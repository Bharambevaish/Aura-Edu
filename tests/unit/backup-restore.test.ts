/**
 * Restore drill: seed the demo institute into a throwaway in-memory MongoDB,
 * back it up, wipe the database, restore, and check nothing was lost or
 * changed. Also checks the admin export leaves out every secret.
 * Never touches MONGODB_URI from .env.
 */
import os from "node:os";
import path from "node:path";
import fsp from "node:fs/promises";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  backupStamp,
  createBackup,
  exportChunks,
  isSecretCollection,
  isSecretField,
  listCollectionNames,
  planRestore,
  readManifest,
  restoreBackup,
} from "@/lib/backup";
import { checkRestoreTarget } from "@/lib/mongo-uri";

const { EJSON } = mongoose.mongo.BSON;
const canonical = (doc: unknown) => EJSON.stringify(doc, { relaxed: false });

describe("backup helpers", () => {
  it("stamps folders as YYYYMMDD-HHmm", () => {
    expect(backupStamp(new Date(2026, 0, 5, 7, 3))).toBe("20260105-0703");
  });

  it("treats sessions and secret fields as secret", () => {
    expect(isSecretCollection("sessions")).toBe(true);
    expect(isSecretCollection("__Secure-authjs")).toBe(true);
    expect(isSecretCollection("ratelimits")).toBe(true);
    expect(isSecretCollection("users")).toBe(false);
    expect(isSecretCollection("invoices")).toBe(false);
    expect(isSecretField("passwordHash")).toBe(true);
    expect(isSecretField("resetToken")).toBe(true);
    expect(isSecretField("apiSecret")).toBe(true);
    expect(isSecretField("mustChangePassword")).toBe(false);
    expect(isSecretField("email")).toBe(false);
  });

  it("restore needs --confirm-remote for a remote database", () => {
    const atlas = "mongodb+srv://u:p@cluster0.abc.mongodb.net/AuraEdu";
    expect(checkRestoreTarget(atlas, []).ok).toBe(false);
    expect(checkRestoreTarget(atlas, ["--confirm-remote"])).toMatchObject({ ok: true, remote: true, dbName: "AuraEdu" });
    expect(checkRestoreTarget("mongodb://localhost:27017/x", [])).toMatchObject({ ok: true, remote: false });
    expect(checkRestoreTarget("mongodb+srv://<db_username>:<db_password>@c.mongodb.net/", ["--confirm-remote"]).ok).toBe(false);
    expect(checkRestoreTarget(undefined, []).ok).toBe(false);
  });
});

describe("restore drill (in-memory MongoDB, demo seed)", () => {
  let mongod: MongoMemoryServer;
  let outRoot: string;
  let conn: mongoose.Connection;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri("auraedu_drill");
    outRoot = await fsp.mkdtemp(path.join(os.tmpdir(), "auraedu-backup-"));
    // Imported after MONGODB_URI is set; connectDB reads it on first call.
    const { seedDemoData } = await import("@/lib/seed/demo");
    await seedDemoData();
    conn = mongoose.connection;
  }, 180_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
    if (outRoot) await fsp.rm(outRoot, { recursive: true, force: true });
  });

  it("backs up, wipes, restores — counts, documents and references match", async () => {
    const db = conn.db!;
    const names = await listCollectionNames(db);
    expect(names).toEqual(expect.arrayContaining(["users", "invoices", "payments", "sessions"]));

    const before: Record<string, number> = {};
    for (const n of names) before[n] = await db.collection(n).countDocuments();
    const invoice = await db.collection("invoices").findOne({ paid: { $gt: 0 } }, { sort: { _id: 1 } });
    const admin = await db.collection("users").findOne({ email: "admin@demo.auraedu.com" });
    const payment = await db.collection("payments").findOne({ invoiceId: invoice!._id });
    expect(invoice && admin && payment).toBeTruthy();

    const { dir, manifest } = await createBackup(conn, outRoot, { appVersion: "test" });
    expect(path.basename(dir)).toMatch(/^auraedu_drill-\d{8}-\d{4}$/);
    expect(manifest.collections).toEqual(before);
    expect(await readManifest(dir)).toEqual(manifest);

    // Disaster: everything is gone, indexes included.
    await db.dropDatabase();
    expect(await listCollectionNames(db)).toEqual([]);

    const plan = await planRestore(conn, dir);
    expect(plan.rows.every((r) => r.current === 0)).toBe(true);
    await restoreBackup(conn, dir);

    const after: Record<string, number> = {};
    for (const n of await listCollectionNames(db)) {
      const count = await db.collection(n).countDocuments();
      if (count || n in before) after[n] = count;
    }
    expect(after).toEqual(before);

    // Exact same documents: amounts, types, dates, ObjectIds.
    const invoiceBack = await db.collection("invoices").findOne({ _id: invoice!._id });
    expect(canonical(invoiceBack)).toBe(canonical(invoice));
    expect(invoiceBack!.total).toBe(invoice!.total);
    expect(invoiceBack!.paid).toBe(invoice!.paid);
    expect(invoiceBack!.createdAt).toBeInstanceOf(Date);

    const adminBack = await db.collection("users").findOne({ _id: admin!._id });
    expect(adminBack!.passwordHash).toBe(admin!.passwordHash);
    expect(await bcrypt.compare("Admin@123", adminBack!.passwordHash)).toBe(true);

    const paymentBack = await db.collection("payments").findOne({ _id: payment!._id });
    expect(paymentBack!.invoiceId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(paymentBack!.invoiceId.equals(invoiceBack!._id)).toBe(true);
    expect(await db.collection("users").findOne({ _id: paymentBack!.studentId })).toBeTruthy();

    // Indexes rebuilt from the models (unique email survives the wipe).
    const userIndexes = await db.collection("users").indexes();
    expect(userIndexes.some((i) => i.key.email === 1 && i.unique)).toBe(true);
    await expect(
      db.collection("users").insertOne({ ...adminBack, _id: new mongoose.Types.ObjectId() }),
    ).rejects.toThrow(/duplicate key/);
  }, 120_000);

  it("restore empties collections that are not in the backup", async () => {
    const db = conn.db!;
    const { dir } = await createBackup(conn, outRoot, { appVersion: "test" });
    await db.collection("strays").insertOne({ x: 1 });
    const plan = await planRestore(conn, dir);
    expect(plan.rows.find((r) => r.name === "strays")).toEqual({ name: "strays", current: 1, restored: 0 });
    await restoreBackup(conn, dir);
    expect(await db.collection("strays").countDocuments()).toBe(0);
  }, 60_000);

  it("refuses a folder without a manifest (interrupted backup)", async () => {
    const broken = await fsp.mkdtemp(path.join(outRoot, "broken-"));
    await expect(planRestore(conn, broken)).rejects.toThrow(/manifest\.json/);
  });

  it("admin export leaves out sessions and password hashes", async () => {
    const admin = await conn.db!.collection("users").findOne({ email: "admin@demo.auraedu.com" });
    await conn.db!.collection("sessions").insertOne({ sessionId: "drill-secret-session-id", userId: admin!._id, active: true });
    let text = "";
    for await (const chunk of exportChunks(conn)) text += chunk;
    const data = JSON.parse(text);
    expect(data.format).toBe("auraedu-export/1");
    expect(data.excluded.collections).toContain("sessions");
    expect(Object.keys(data.collections)).not.toContain("sessions");
    expect(data.collections.users.length).toBeGreaterThan(0);
    expect(data.collections.users.every((u: Record<string, unknown>) => !("passwordHash" in u))).toBe(true);
    expect(text).not.toMatch(/\$2[aby]\$\d\d\$/); // no bcrypt hash anywhere
    expect(text).not.toContain("drill-secret-session-id");
    expect(data.collections.invoices.length).toBe(await conn.db!.collection("invoices").countDocuments());
    // Relaxed EJSON: ids and dates stay recognisable.
    expect(data.collections.invoices[0]._id).toHaveProperty("$oid");
  }, 60_000);
});

/**
 * setup:institute against a throwaway in-memory MongoDB (never a real one).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDB } from "@/lib/db";
import { setupInstitute, type SetupOptions } from "@/lib/setup-institute";
import { UserModel } from "@/lib/models/User";
import { InstituteSettingsModel } from "@/lib/models/InstituteSettings";
import { MasterItemModel } from "@/lib/models/MasterItem";
import { BranchModel } from "@/lib/models/Branch";
import { MASTER_META, MASTER_TYPES } from "@/lib/master";
import { demoSeedRefusal } from "@/lib/seed/guard";

let mongod: MongoMemoryServer;
const savedUri = process.env.MONGODB_URI;

const FRESH: SetupOptions = {
  adminName: "Asha Rao",
  adminEmail: "Asha@Sunrise.in",
  instituteName: "Sunrise Academy",
  branchName: "Main Branch",
  addAdmin: false,
  confirmRemote: false,
};

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri("setup_test");
  await connectDB();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  globalThis.mongooseCache = { conn: null, promise: null };
  await mongod?.stop();
  process.env.MONGODB_URI = savedUri;
});

describe("setupInstitute (in-memory MongoDB)", () => {
  let password = "";

  it("creates exactly one admin who must change the one-time password", async () => {
    const result = await setupInstitute(FRESH);
    expect(result).toMatchObject({ ok: true, mode: "fresh", email: "asha@sunrise.in", branchCreated: true });
    if (!result.ok) return;
    password = result.password;
    expect(password).toMatch(/^[A-Za-z0-9]{8}@[A-Z0-9]{4}$/);

    const users = await UserModel.find().lean();
    expect(users).toHaveLength(1);
    const [admin] = users;
    expect(admin).toMatchObject({ email: "asha@sunrise.in", name: "Asha Rao", role: "admin", mustChangePassword: true, isDemo: false });
    expect(admin.passwordHash).not.toContain(password);
    expect(admin.passwordHash.startsWith("$2b$12$") || admin.passwordHash.startsWith("$2a$12$")).toBe(true);
    expect(await bcrypt.compare(password, admin.passwordHash)).toBe(true);
  }, 60_000);

  it("writes no demo users and leaves the demo seed refusing this database", async () => {
    expect(await UserModel.countDocuments({ email: /@demo\.auraedu\.com$/ })).toBe(0);
    expect(await UserModel.countDocuments({ isDemo: true })).toBe(0);
    const emails = (await UserModel.distinct("email")) as string[];
    expect(demoSeedRefusal(emails, ["admin@demo.auraedu.com"])).toContain("asha@sunrise.in");
  });

  it("writes the institute profile, GST defaults, Master Data and the first branch", async () => {
    const profile = await InstituteSettingsModel.findOne({ key: "institute" }).lean();
    expect(profile).toMatchObject({ name: "Sunrise Academy", legalName: "Sunrise Academy", gstin: "", defaultTaxRuleId: "gst-18", staffCanGrade: true });
    expect(profile?.taxRules.map((r) => [r.id, r.rate])).toEqual([["gst-18", 18], ["gst-0", 0]]);

    for (const type of MASTER_TYPES) {
      expect(await MasterItemModel.countDocuments({ type })).toBe(MASTER_META[type].defaults.length);
    }
    const branches = await BranchModel.find().lean();
    expect(branches.map((b) => [b.name, b.code])).toEqual([["Main Branch", "BR-MAINBR"]]);
  });

  it("refuses a second run and changes nothing", async () => {
    const result = await setupInstitute({ ...FRESH, adminEmail: "other@sunrise.in", instituteName: "Renamed" });
    expect(result).toMatchObject({ ok: false, reason: expect.stringContaining("--add-admin") });
    expect(await UserModel.countDocuments()).toBe(1);
    expect((await InstituteSettingsModel.findOne({ key: "institute" }).lean())?.name).toBe("Sunrise Academy");
  });

  it("--add-admin adds one more admin and nothing else", async () => {
    const before = await InstituteSettingsModel.findOne({ key: "institute" }).lean();
    const result = await setupInstitute({ adminName: "Ravi Kumar", adminEmail: "ravi@sunrise.in", addAdmin: true, confirmRemote: false });
    expect(result).toMatchObject({ ok: true, mode: "add-admin", email: "ravi@sunrise.in", branchCreated: false });
    if (result.ok) expect(result.password).not.toBe(password);

    expect(await UserModel.countDocuments({ role: "admin", mustChangePassword: true })).toBe(2);
    const after = await InstituteSettingsModel.findOne({ key: "institute" }).lean();
    expect(after?.updatedAt).toEqual(before?.updatedAt);
    expect(await BranchModel.countDocuments()).toBe(1);

    const again = await setupInstitute({ adminName: "Ravi Kumar", adminEmail: "RAVI@sunrise.in", addAdmin: true, confirmRemote: false });
    expect(again).toMatchObject({ ok: false, reason: expect.stringContaining("already exists") });
  }, 60_000);

  it("never creates a demo-domain account", async () => {
    const result = await setupInstitute({ adminName: "Admin", adminEmail: "admin@demo.auraedu.com", addAdmin: true, confirmRemote: false });
    expect(result.ok).toBe(false);
    expect(await UserModel.countDocuments({ email: /@demo\.auraedu\.com$/ })).toBe(0);
  });
});

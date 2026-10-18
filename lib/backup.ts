/**
 * Backup, restore and admin export of the connected database.
 *
 * The CLI scripts (scripts/backup.ts, scripts/restore.ts), the restore drill
 * test and the admin "Download all institute data" route all call these
 * functions, so the format is defined in one place.
 *
 * Backup format (a folder per run):
 *   backups/<db>-<YYYYMMDD-HHmm>/<collection>.json   canonical EJSON array
 *   backups/<db>-<YYYYMMDD-HHmm>/manifest.json       written last
 * Canonical EJSON keeps ObjectIds, Dates and int/double types exact, so a
 * restore puts back byte-for-byte the same values. Collections are discovered
 * with listCollections, so a new model is backed up without code changes.
 *
 * The manifest is written after every collection file, so a folder without
 * one is an interrupted backup and restore refuses it.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
// Every model, so a restore can rebuild every index (see restoreBackup).
import "@/lib/models/Assignment";
import "@/lib/models/Attempt";
import "@/lib/models/Attendance";
import "@/lib/models/AuditLog";
import "@/lib/models/Batch";
import "@/lib/models/Branch";
import "@/lib/models/CalendarEvent";
import "@/lib/models/ChatMessage";
import "@/lib/models/Course";
import "@/lib/models/Doubt";
import "@/lib/models/Expense";
import "@/lib/models/ExpenseCategory";
import "@/lib/models/Form";
import "@/lib/models/FormSubmission";
import "@/lib/models/InstituteSettings";
import "@/lib/models/Invoice";
import "@/lib/models/Lead";
import "@/lib/models/LeaveRequest";
import "@/lib/models/LessonProgress";
import "@/lib/models/MasterItem";
import "@/lib/models/Meeting";
import "@/lib/models/Notice";
import "@/lib/models/Notification";
import "@/lib/models/Payment";
import "@/lib/models/Question";
import "@/lib/models/Refund";
import "@/lib/models/Result";
import "@/lib/models/Session";
import "@/lib/models/Submission";
import "@/lib/models/Task";
import "@/lib/models/Test";
import "@/lib/models/TimetableSlot";
import "@/lib/models/User";
import "@/lib/models/Vendor";
import "@/lib/models/Waiver";

// The bson package bundled with the driver mongoose ships (no extra dependency).
const { EJSON } = mongoose.mongo.BSON;
type Db = mongoose.mongo.Db;
type Doc = mongoose.mongo.Document;

export const BACKUP_FORMAT = "auraedu-backup/1";
export const EXPORT_FORMAT = "auraedu-export/1";
const MANIFEST = "manifest.json";
const INSERT_BATCH = 1000;

export interface BackupManifest {
  format: typeof BACKUP_FORMAT;
  database: string;
  createdAt: string;
  appVersion: string;
  /** Collection name → number of documents written. */
  collections: Record<string, number>;
}

function liveDb(conn: mongoose.Connection): Db {
  if (!conn.db) throw new Error("Not connected to MongoDB.");
  return conn.db;
}

/** Every user collection in the database (no system.* or views), sorted. */
export async function listCollectionNames(db: Db): Promise<string[]> {
  const infos = await db.listCollections({ type: "collection" }, { nameOnly: true }).toArray();
  return infos
    .map((c) => c.name)
    .filter((name) => !name.startsWith("system."))
    .sort();
}

const pad = (n: number) => String(n).padStart(2, "0");

/** `20261018-0930` in local time — what an admin sees on their clock. */
export function backupStamp(date: Date): string {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

/** Folder names never contain path separators or other awkward characters. */
const safeName = (name: string) => name.replace(/[^A-Za-z0-9._-]/g, "_");

async function writeCollection(db: Db, name: string, file: string): Promise<number> {
  const out = fs.createWriteStream(file, { encoding: "utf8" });
  const write = (chunk: string) =>
    new Promise<void>((resolve, reject) => {
      if (out.write(chunk)) resolve();
      else out.once("drain", resolve).once("error", reject);
    });
  let count = 0;
  try {
    await write("[");
    for await (const doc of db.collection(name).find({}, { sort: { _id: 1 } })) {
      await write(`${count === 0 ? "\n" : ",\n"}${EJSON.stringify(doc, { relaxed: false })}`);
      count++;
    }
    await write(count === 0 ? "]\n" : "\n]\n");
  } finally {
    await new Promise<void>((resolve, reject) => out.end((err?: Error | null) => (err ? reject(err) : resolve())));
  }
  return count;
}

/**
 * Dump every collection of the connected database into a new folder under
 * `outRoot`. Returns the folder and its manifest.
 */
export async function createBackup(
  conn: mongoose.Connection,
  outRoot: string,
  opts: { appVersion: string; now?: Date },
): Promise<{ dir: string; manifest: BackupManifest }> {
  const db = liveDb(conn);
  const now = opts.now ?? new Date();
  const base = path.join(outRoot, `${safeName(db.databaseName)}-${backupStamp(now)}`);

  // Two runs in the same minute get -2, -3… instead of mixing files.
  await fsp.mkdir(outRoot, { recursive: true });
  let dir = base;
  for (let n = 2; ; n++) {
    try {
      await fsp.mkdir(dir);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      dir = `${base}-${n}`;
    }
  }

  const collections: Record<string, number> = {};
  for (const name of await listCollectionNames(db)) {
    collections[name] = await writeCollection(db, name, path.join(dir, `${safeName(name)}.json`));
  }

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    database: db.databaseName,
    createdAt: now.toISOString(),
    appVersion: opts.appVersion,
    collections,
  };
  await fsp.writeFile(path.join(dir, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return { dir, manifest };
}

/** Read and sanity-check a backup folder's manifest (throws with a plain reason). */
export async function readManifest(dir: string): Promise<BackupManifest> {
  let raw: string;
  try {
    raw = await fsp.readFile(path.join(dir, MANIFEST), "utf8");
  } catch {
    throw new Error(`${dir} has no ${MANIFEST}: not a backup folder, or the backup did not finish.`);
  }
  const manifest = JSON.parse(raw) as BackupManifest;
  if (manifest.format !== BACKUP_FORMAT || typeof manifest.collections !== "object") {
    throw new Error(`${path.join(dir, MANIFEST)} is not an AuraEdu backup manifest (${BACKUP_FORMAT}).`);
  }
  for (const name of Object.keys(manifest.collections)) {
    if (!fs.existsSync(path.join(dir, `${safeName(name)}.json`))) {
      throw new Error(`Backup is incomplete: ${safeName(name)}.json is missing from ${dir}.`);
    }
  }
  return manifest;
}

export interface RestorePlan {
  manifest: BackupManifest;
  /** Every collection the restore touches, with its count now and after. */
  rows: { name: string; current: number; restored: number }[];
}

/**
 * What a restore would do, without changing anything: every collection in
 * the backup is replaced, and collections that exist now but are not in the
 * backup are emptied (restored = 0), so the database matches the backup.
 */
export async function planRestore(conn: mongoose.Connection, dir: string): Promise<RestorePlan> {
  const db = liveDb(conn);
  const manifest = await readManifest(dir);
  const names = new Set([...Object.keys(manifest.collections), ...(await listCollectionNames(db))]);
  const rows = [];
  for (const name of [...names].sort()) {
    rows.push({
      name,
      current: await db.collection(name).countDocuments(),
      restored: manifest.collections[name] ?? 0,
    });
  }
  return { manifest, rows };
}

/**
 * Replace the connected database's contents with the backup in `dir`, then
 * rebuild every registered model's indexes. Documents are written with the
 * raw driver, so they come back exactly as dumped (no schema defaults or
 * validation applied).
 */
export async function restoreBackup(conn: mongoose.Connection, dir: string): Promise<RestorePlan> {
  const db = liveDb(conn);
  const plan = await planRestore(conn, dir);

  for (const { name } of plan.rows) {
    await db.collection(name).deleteMany({});
    if (!(name in plan.manifest.collections)) continue;
    const raw = await fsp.readFile(path.join(dir, `${safeName(name)}.json`), "utf8");
    const docs = EJSON.parse(raw, { relaxed: false }) as Doc[];
    if (docs.length !== plan.manifest.collections[name]) {
      throw new Error(`${name}.json holds ${docs.length} documents but the manifest says ${plan.manifest.collections[name]}.`);
    }
    for (let i = 0; i < docs.length; i += INSERT_BATCH) {
      await db.collection(name).insertMany(docs.slice(i, i + INSERT_BATCH), { ordered: true });
    }
  }

  // Indexes: create any the schema defines (unique email, etc.) and drop stale ones.
  for (const model of Object.values(conn.models)) {
    await model.syncIndexes();
  }
  return plan;
}

// ---------------------------------------------------------------------------
// Admin export
// ---------------------------------------------------------------------------

/**
 * Collections never exported: sign-in sessions (their ids are revocation
 * keys), Auth.js / `__Secure` cookie-style stores and login rate-limit state.
 */
export function isSecretCollection(name: string): boolean {
  return /session|__secure|rate.?limit|login.?attempt|verification.?token/i.test(name) || name.startsWith("system.");
}

/** Field names stripped at any depth: password hashes, tokens, secrets. */
export function isSecretField(key: string): boolean {
  return /^password(hash)?$/i.test(key) || /(secret|token)s?$/i.test(key);
}

function stripSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSecrets);
  // Plain objects only: ObjectId, Date, Decimal128 etc. are BSON values, kept whole.
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      if (!isSecretField(key)) out[key] = stripSecrets(v);
    }
    return out;
  }
  return value;
}

/** A document as it appears in the admin export (secrets removed). */
export function exportDocument(doc: Doc): Doc {
  return stripSecrets(doc) as Doc;
}

/**
 * The admin export as JSON text chunks, one document at a time so a large
 * institute never sits in memory: `{ format, database, exportedAt, excluded,
 * collections: { <name>: [ relaxed-EJSON docs ] } }`. Relaxed EJSON keeps
 * ObjectIds/Dates recognisable while numbers stay plain for spreadsheets.
 */
export async function* exportChunks(
  conn: mongoose.Connection,
  opts: { now?: Date } = {},
): AsyncGenerator<string> {
  const db = liveDb(conn);
  const all = await listCollectionNames(db);
  const included = all.filter((n) => !isSecretCollection(n));
  const header = {
    format: EXPORT_FORMAT,
    database: db.databaseName,
    exportedAt: (opts.now ?? new Date()).toISOString(),
    excluded: {
      collections: all.filter(isSecretCollection),
      fields: "passwordHash, password and any field ending in token/secret",
    },
  };
  yield `${JSON.stringify(header).slice(0, -1)},"collections":{`;
  for (const [i, name] of included.entries()) {
    yield `${i ? "," : ""}\n${JSON.stringify(name)}:[`;
    let n = 0;
    for await (const doc of db.collection(name).find({}, { sort: { _id: 1 } })) {
      yield `${n++ ? "," : ""}\n${EJSON.stringify(exportDocument(doc), { relaxed: true })}`;
    }
    yield "]";
  }
  yield "\n}}\n";
}

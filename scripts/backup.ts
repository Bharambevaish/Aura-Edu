/**
 * CLI backup: `npm run backup` (optionally `npm run backup -- --out D:\AuraEdu-backups`).
 *
 * Dumps every collection of the database MONGODB_URI points at into
 * backups/<db>-<YYYYMMDD-HHmm>/ (EJSON per collection + manifest.json).
 * Only reads, so no confirm flag; a remote target is named before it starts.
 * See docs/BACKUPS.md for the daily routine and how to restore.
 */
// .env is optional; it never overrides variables that are already set.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

import path from "node:path";
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { createBackup } from "@/lib/backup";
import { hostsFromUri, isLocalUri, resolveDbName, uriPlaceholderProblem } from "@/lib/mongo-uri";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const problem = !uri ? "MONGODB_URI is not set." : uriPlaceholderProblem(uri);
  if (problem || !uri) {
    console.error(`Refusing to back up: ${problem}`);
    process.exit(1);
  }
  const dbName = resolveDbName(uri, process.env.MONGODB_DB);
  if (!isLocalUri(uri)) {
    console.log(`Backing up REMOTE database "${dbName}" on ${hostsFromUri(uri).join(", ")} (read-only).`);
  }

  const outRoot = path.resolve(argValue("--out") ?? "backups");
  const { version } = JSON.parse(readFileSync(path.resolve("package.json"), "utf8")) as { version: string };

  const conn = (await connectDB()).connection;
  const { dir, manifest } = await createBackup(conn, outRoot, { appVersion: version });
  const total = Object.values(manifest.collections).reduce((a, b) => a + b, 0);
  for (const [name, count] of Object.entries(manifest.collections)) {
    console.log(`  ${name.padEnd(24)} ${count}`);
  }
  console.log(`Backed up ${Object.keys(manifest.collections).length} collections (${total} documents) to ${dir}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Backup failed:", error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

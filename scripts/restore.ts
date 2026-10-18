/**
 * CLI restore: `npm run restore -- <backup-folder> --confirm-restore`
 * (add `--confirm-remote` when MONGODB_URI is not this machine, e.g. Atlas).
 *
 * REPLACES the contents of the database MONGODB_URI points at with the backup:
 * every collection in the backup is overwritten and collections that are not
 * in it are emptied. Without the flags it only prints what would change.
 * Indexes are rebuilt from the app's models afterwards. See docs/BACKUPS.md.
 */
// .env is optional; it never overrides variables that are already set.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

import path from "node:path";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { planRestore, restoreBackup, type RestorePlan } from "@/lib/backup";
import { checkRestoreTarget } from "@/lib/mongo-uri";

function printPlan({ manifest, rows }: RestorePlan, dbName: string) {
  console.log(`Backup of "${manifest.database}" taken ${manifest.createdAt} (app ${manifest.appVersion}).`);
  console.log(`Restoring into "${dbName}" replaces:`);
  console.log(`  ${"collection".padEnd(24)} ${"now".padStart(8)} ${"after".padStart(8)}`);
  for (const r of rows) {
    console.log(`  ${r.name.padEnd(24)} ${String(r.current).padStart(8)} ${String(r.restored).padStart(8)}`);
  }
}

async function main() {
  const folder = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!folder) {
    console.error("Usage: npm run restore -- <backup-folder> --confirm-restore [--confirm-remote]");
    process.exit(1);
  }
  const dir = path.resolve(folder);

  // Same remote guard as the seed: a non-local database needs --confirm-remote.
  const target = checkRestoreTarget(process.env.MONGODB_URI, process.argv, process.env.MONGODB_DB);
  if (!target.ok) {
    console.error(`Refusing to restore: ${target.reason}`);
    process.exit(1);
  }
  if (target.remote) {
    console.log(`Target is the REMOTE database "${target.dbName}" on ${target.hosts.join(", ")}.`);
  }

  const conn = (await connectDB()).connection;
  const plan = await planRestore(conn, dir);
  printPlan(plan, target.dbName);

  if (!process.argv.includes("--confirm-restore")) {
    console.error("\nNothing changed. Re-run with --confirm-restore to replace the data above.");
    await mongoose.disconnect();
    process.exit(1);
  }

  await restoreBackup(conn, dir);
  console.log(`\nRestored ${plan.rows.length} collections from ${dir} and rebuilt indexes.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Restore failed:", error instanceof Error ? error.message : error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

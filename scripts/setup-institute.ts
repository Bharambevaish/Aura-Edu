/**
 * CLI: `npm run setup:institute -- --name ... --email ... --institute ...`.
 *
 * Sets up a REAL institute's empty database: institute profile, Master Data
 * defaults, optional first branch, and the first admin with a one-time
 * password (printed once; must be changed at first sign-in). No demo data.
 * `--add-admin` adds another admin to an institute that is already set up.
 *
 * Safety: refuses when any user already exists (unless --add-admin), refuses
 * placeholder URIs, and only writes a non-local MONGODB_URI (Atlas) with
 * --confirm-remote, after printing the host and database.
 */
// .env is optional; it never overrides variables that are already set.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { checkSeedTarget } from "@/lib/mongo-uri";
import { parseSetupArgs, setupInstitute, SETUP_USAGE } from "@/lib/setup-institute";

async function main() {
  const args = parseSetupArgs(process.argv.slice(2), process.env);
  if (args.ok && args.help) {
    console.log(SETUP_USAGE);
    return;
  }
  if (!args.ok) {
    console.error(`Refusing to set up: ${args.error}\n\n${SETUP_USAGE}`);
    process.exit(1);
  }

  const target = checkSeedTarget(
    process.env.MONGODB_URI,
    process.argv,
    process.env.MONGODB_DB,
    (hosts, dbName) =>
      `MONGODB_URI points at a remote server (${hosts.join(", ")}), database "${dbName}". ` +
      "Add --confirm-remote if this is the institute's database.",
  );
  if (!target.ok) {
    console.error(`Refusing to set up: ${target.reason}`);
    process.exit(1);
  }
  if (target.remote) {
    console.log(`Setting up REMOTE database "${target.dbName}" on ${target.hosts.join(", ")}.`);
  }

  await connectDB();
  const result = await setupInstitute(args.options);
  await mongoose.disconnect();

  if (!result.ok) {
    console.error(`Refusing to set up: ${result.reason}`);
    process.exit(1);
  }

  if (result.mode === "fresh") {
    console.log(`Institute profile "${args.options.instituteName}" and Master Data defaults written.`);
    if (result.branchCreated) console.log(`Branch "${args.options.branchName}" created.`);
  }
  console.log(
    [
      "",
      `Admin account created: ${result.email}`,
      `One-time password:     ${result.password}`,
      "",
      "This password is shown only once and is not stored anywhere in plain text.",
      "Hand it to the admin securely; they must choose their own password at first sign-in.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});

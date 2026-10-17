/**
 * CLI seed script: `npm run seed`.
 *
 * Writes the full reproducible demo world (users, tests, questions, attempts,
 * results) into whatever `MONGODB_URI` points at. Idempotent: users are
 * upserted by email and test data is wiped+recreated, so re-seeding never
 * stacks duplicates. Uses the running local Mongo (`npm run mongo`) or the
 * Atlas URI set in .env.
 *
 * Safety: seeding wipes and rewrites collections, so a non-local MONGODB_URI
 * (Atlas) is refused unless run as `npm run seed:remote` (--confirm-remote),
 * which first prints the host and database it is about to write to. A
 * database holding any non-demo account (a real institute, see
 * `npm run setup:institute`) is always refused.
 */
// .env is optional (CI and the e2e server pass MONGODB_URI directly); it
// never overrides variables that are already set.
try {
  process.loadEnvFile();
} catch {
  /* no .env file */
}

import { connectDB } from "@/lib/db";
import { DEMO_ACCOUNTS, seedDemoData } from "@/lib/seed/demo";
import { demoSeedRefusal } from "@/lib/seed/guard";
import { UserModel } from "@/lib/models/User";
import mongoose from "mongoose";
import { checkSeedTarget } from "@/lib/mongo-uri";

async function main() {
  const target = checkSeedTarget(process.env.MONGODB_URI, process.argv, process.env.MONGODB_DB);
  if (!target.ok) {
    console.error(`Refusing to seed: ${target.reason}`);
    process.exit(1);
  }
  if (target.remote) {
    console.log(`Seeding REMOTE database "${target.dbName}" on ${target.hosts.join(", ")} (existing demo data will be replaced).`);
  }
  await connectDB();
  const emails = (await UserModel.distinct("email")) as string[];
  const refusal = demoSeedRefusal(emails, DEMO_ACCOUNTS.map((a) => a.email));
  if (refusal) {
    console.error(`Refusing to seed: ${refusal}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  await seedDemoData();
  console.log("Seeded demo users, tests, questions, attempts and results.");
  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
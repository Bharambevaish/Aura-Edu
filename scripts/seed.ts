/**
 * CLI seed script: `npm run seed`.
 *
 * Writes the full reproducible demo world (users, tests, questions, attempts,
 * results) into whatever `MONGODB_URI` points at. Idempotent: users are
 * upserted by email and test data is wiped+recreated, so re-seeding never
 * stacks duplicates. Uses the running local Mongo (`npm run mongo`) or the
 * Atlas URI set in .env.
 */
process.loadEnvFile();

import { connectDB } from "@/lib/db";
import { seedDemoData } from "@/lib/seed/demo";
import mongoose from "mongoose";

async function main() {
  await connectDB();
  await seedDemoData();
  console.log("Seeded demo users, tests, questions, attempts and results.");
  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
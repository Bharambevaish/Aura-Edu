/**
 * Server for the Playwright e2e suite (`npm run test:e2e`): a throwaway
 * in-memory MongoDB, the demo seed, then the production build via
 * `next start`. Requires `npm run build` first. Nothing touches a real DB.
 */
import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.E2E_PORT ?? 3200);
const mongod = await MongoMemoryServer.create();
const env = {
  ...process.env,
  MONGODB_URI: mongod.getUri("auraedu_e2e"),
  AUTH_URL: `http://localhost:${PORT}`,
  AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-only-secret-not-used-anywhere-else",
  AUTH_TRUST_HOST: "true",
  // The e2e story drives the one-click demo logins and Reset demo data.
  DEMO_MODE: "true",
  NEXT_TELEMETRY_DISABLED: "1",
};

// Async spawn: spawnSync + inherited stdio through npx hangs on Windows.
const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { env, stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code ?? 1));
  });

const seeded = await run("npx", ["tsx", "scripts/seed.ts"]);
if (seeded !== 0) {
  await mongod.stop();
  process.exit(seeded);
}

const next = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: "inherit", shell: true });
const stop = async () => {
  next.kill();
  await mongod.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
next.on("exit", async (code) => {
  await mongod.stop();
  process.exit(code ?? 0);
});

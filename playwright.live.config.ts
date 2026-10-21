import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests against a deployed site (tests/live). Nothing here changes
 * data: no Reset, no conversions, no grading.
 *
 *   LIVE_URL=https://aura-edu-eight.vercel.app npm run test:live
 *
 * The sign-in checks type the public demo passwords into the site, so they
 * only run when LIVE_LOGINS=1 is set as well.
 */
const baseURL = process.env.LIVE_URL;
if (!baseURL) throw new Error("Set LIVE_URL to the deployed site, e.g. LIVE_URL=https://aura-edu-eight.vercel.app");

export default defineConfig({
  testDir: "tests/live",
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

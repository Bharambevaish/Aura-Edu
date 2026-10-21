import { expect, test } from "@playwright/test";

// The post-deploy check from docs/DEPLOYMENT.md: the DB is reachable and the
// response carries nothing but the status.
test("/api/health reports the database up, uncached, without details", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toContain("no-store");
  // The e2e server runs a seeded demo (DEMO_MODE=true), so it also reports the demo data.
  expect(await res.json()).toEqual({ ok: true, db: "up", demoData: "ready" });
});

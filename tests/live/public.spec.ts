import { expect, test } from "@playwright/test";

/** Read-only checks of a deployed site: no sign-in, nothing changed. */

test("health: database reachable and, on a demo, demo data loaded", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status(), "GET /api/health").toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.db).toBe("up");
  if ("demoData" in body) {
    expect(body.demoData, "Demo data is missing: run `npm run seed:remote` against this database").toBe("ready");
  }
});

test("public pages load", async ({ page }) => {
  for (const path of ["/", "/login", "/register", "/privacy-policy", "/verify"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
  }
});

test("login page: if it offers one-click demo logins, the demo data is loaded", async ({ page }) => {
  await page.goto("/login");
  const buttons = page.getByRole("button", { name: /^Explore as (Admin|Staff|Student)$/ });
  const count = await buttons.count();
  expect([0, 3], "either all three demo buttons or none").toContain(count);
  if (count === 3) await expect(page.getByTestId("demo-data-missing")).toHaveCount(0);
});

test("security headers: nonce CSP, no framing, HTTPS-only", async ({ request }) => {
  const res = await request.get("/login");
  const h = res.headers();
  expect(h["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  if (res.url().startsWith("https://")) expect(h["strict-transport-security"]).toContain("max-age=");
});

test("signed-out visitors are sent to /login from both portals", async ({ page }) => {
  for (const path of ["/admin-dashboard", "/student-portal", "/admin-dashboard/settings"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/login/);
  }
});

test("the institute data export refuses anonymous requests", async ({ request }) => {
  const res = await request.get("/api/admin/export");
  expect([401, 403]).toContain(res.status());
});

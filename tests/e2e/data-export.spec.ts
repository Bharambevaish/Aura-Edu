import { expect, test, type Browser, type Page } from "@playwright/test";
import fs from "node:fs/promises";

/**
 * Settings → Security → "Download all institute data": admins get one JSON
 * file without password hashes or sign-in sessions; everyone else is refused
 * by the route itself (the proxy does not guard /api/).
 */
async function demoLogin(browser: Browser, who: "Admin" | "Staff"): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: `Explore as ${who}` }).click();
  await page.waitForURL(/\/admin-dashboard/);
  return page;
}

test("signed-out requests are refused", async ({ request }) => {
  const res = await request.get("/api/admin/export");
  expect(res.status()).toBe(401);
});

test("staff cannot export", async ({ browser }) => {
  const staff = await demoLogin(browser, "Staff");
  const res = await staff.request.get("/api/admin/export");
  expect(res.status()).toBe(403);
  await staff.context().close();
});

test("admin downloads all institute data without secrets", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.goto("/admin-dashboard/settings");
  const [download] = await Promise.all([
    admin.waitForEvent("download"),
    admin.getByRole("link", { name: "Download all institute data" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^auraedu-export-\d{8}-\d{4}\.json$/);
  const text = await fs.readFile((await download.path())!, "utf8");
  const data = JSON.parse(text);
  expect(data.format).toBe("auraedu-export/1");
  expect(data.collections.users.length).toBeGreaterThan(0);
  expect(data.collections.invoices.length).toBeGreaterThan(0);
  expect(Object.keys(data.collections)).not.toContain("sessions");
  expect(data.collections.users.every((u: Record<string, unknown>) => !("passwordHash" in u))).toBe(true);
  expect(text).not.toMatch(/\$2[aby]\$\d\d\$/);
  // The admin's own sign-in session exists now, and is still left out.
  expect(data.excluded.collections).toContain("sessions");

  // Audited before streaming, so the file already records its own download.
  expect(data.collections.auditlogs.some((a: { action: string }) => a.action === "exported all institute data")).toBe(true);
  await admin.context().close();
});

import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Sign-in smoke tests for a deployed DEMO (DEMO_MODE=true, seeded). They use
 * the public one-click demo logins and only read pages — no Reset, no
 * conversions, no grading. Opt in with LIVE_LOGINS=1.
 */
test.skip(process.env.LIVE_LOGINS !== "1", "Set LIVE_LOGINS=1 to run the sign-in checks");

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && /Content Security Policy|Refused to/i.test(m.text())) errors.push(m.text());
  });
  return errors;
}

async function oneClick(browser: Browser, who: "Admin" | "Staff" | "Student"): Promise<{ page: Page; errors: string[] }> {
  const page = await (await browser.newContext()).newPage();
  const errors = watchErrors(page);
  await page.goto("/login");
  await page.getByRole("button", { name: `Explore as ${who}` }).click();
  await expect(page.getByText("Invalid email or password"), `${who} one-click login was rejected`).toHaveCount(0, { timeout: 5_000 });
  await page.waitForURL(who === "Student" ? /\/student-portal/ : /\/admin-dashboard/);
  return { page, errors };
}

async function visitAll(page: Page, paths: string[]) {
  for (const path of paths) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBeLessThan(400);
    await expect(page, path).not.toHaveURL(/\/login|session-ended/);
    await expect(page.getByText(/Application error|This page couldn.t load/i), path).toHaveCount(0);
  }
}

test("a wrong password is rejected", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("student@example.com").fill("student@demo.auraedu.com");
  await page.getByPlaceholder("••••••••").fill("definitely-wrong");
  await page.getByRole("button", { name: "Login as Student" }).click();
  await expect(page.getByText("Invalid email or password")).toBeVisible();
});

test("Explore as Admin: dashboard and main modules load", async ({ browser }) => {
  const { page, errors } = await oneClick(browser, "Admin");
  await expect(page.getByText("Active Students")).toBeVisible();
  await visitAll(page, [
    "/admin-dashboard/lms/students",
    "/admin-dashboard/lms/leads",
    "/admin-dashboard/lms/students/tests",
    "/admin-dashboard/finance/overview",
    "/admin-dashboard/finance/invoices",
    "/admin-dashboard/reports",
    "/admin-dashboard/lms/forms",
    "/admin-dashboard/administration/staff",
    "/admin-dashboard/settings/config/staff-permission",
  ]);
  expect(errors).toEqual([]);
  await page.context().close();
});

test("Explore as Staff: dashboard loads and Settings is refused", async ({ browser }) => {
  const { page, errors } = await oneClick(browser, "Staff");
  await visitAll(page, ["/admin-dashboard/lms/students", "/admin-dashboard/lms/doubts", "/admin-dashboard/leave"]);
  await page.goto("/admin-dashboard/settings");
  await expect(page.getByText("That section is restricted to administrators.")).toBeVisible();
  expect(errors).toEqual([]);
  await page.context().close();
});

test("Explore as Student: portal pages load", async ({ browser }) => {
  const { page, errors } = await oneClick(browser, "Student");
  await visitAll(page, [
    "/student-portal/my-courses",
    "/student-portal/tests",
    "/student-portal/fees",
    "/student-portal/schedule",
    "/student-portal/certificates",
  ]);
  expect(errors).toEqual([]);
  await page.context().close();
});

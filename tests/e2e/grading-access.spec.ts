import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * "Staff can grade written answers" (Settings → Permissions): admins can
 * always grade; with the switch off, staff can read an attempt but not save
 * grades, and the server rejects a save that was already on screen.
 *
 * Self-contained: it starts by resetting the demo data, which seeds Meera
 * Iyer's submitted attempt on the active test with written answers pending
 * and turns staff grading on.
 */
test.describe.configure({ mode: "serial" });

const ACTIVE_TEST = "Biology Speed Drill - Genetics & Evolution";
const STUDENT = "Meera Iyer";
const LOCKED = "Grading is limited to administrators — ask an admin.";

let attemptUrl = "";

async function demoLogin(browser: Browser, who: "Admin" | "Staff"): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: `Explore as ${who}` }).click();
  await page.waitForURL(/\/admin-dashboard/);
  return page;
}

async function openReport(page: Page) {
  await page.goto("/admin-dashboard/lms/students/tests");
  const card = page
    .locator("div", { has: page.getByRole("heading", { name: ACTIVE_TEST }) })
    .filter({ has: page.getByRole("button", { name: "Reports" }) })
    .last();
  await card.getByRole("button", { name: "Reports" }).click();
  await page.waitForURL(/\/tests\/[a-f0-9]{24}$/);
  return page.locator("tr", { hasText: STUDENT });
}

async function setStaffGrading(page: Page, on: boolean) {
  await page.goto("/admin-dashboard/settings/config/staff-permission");
  const toggle = page.getByRole("switch", { name: "Staff can grade written answers" });
  await expect(toggle).toBeEnabled();
  if ((await toggle.getAttribute("aria-checked")) !== String(on)) await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", String(on));
  await expect(page.getByRole("status").filter({ hasText: on ? "Staff can now grade" : "Only admins can grade" })).toBeVisible();
}

async function fillMaxMarks(page: Page) {
  const marks = page.locator('input[type="number"]');
  await expect(marks.first()).toBeVisible();
  for (const input of await marks.all()) {
    await input.fill((await input.getAttribute("max")) ?? "1");
  }
}

test("1. reset demo data so a written answer is waiting", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.getByRole("button", { name: "Reset demo data" }).click();
  await expect(admin.getByRole("button", { name: "Reset demo data" })).toBeEnabled({ timeout: 90_000 });
  await admin.context().close();
});

test("2. with staff grading off, staff can read the attempt but not grade it", async ({ browser }) => {
  // Staff open the grading screen while grading is still allowed...
  const staff = await demoLogin(browser, "Staff");
  const row = await openReport(staff);
  await expect(row).toContainText("GRADE PENDING");
  await row.getByRole("button", { name: "Grade Written" }).click();
  await staff.waitForURL(/\/tests\/attempts\/[a-f0-9]{24}$/);
  attemptUrl = new URL(staff.url()).pathname;
  await expect(staff.getByRole("button", { name: "Save Grades" })).toBeVisible();

  // ...then an admin switches staff grading off.
  const admin = await demoLogin(browser, "Admin");
  await setStaffGrading(admin, false);
  await admin.context().close();

  // The save that was already on screen is refused by the server.
  await fillMaxMarks(staff);
  await staff.getByRole("button", { name: "Save Grades" }).click();
  await expect(staff.getByText(LOCKED)).toBeVisible();

  // Reloaded, the screen explains the lock instead of offering a button.
  await staff.reload();
  await expect(staff.getByText(LOCKED)).toBeVisible();
  await expect(staff.getByRole("button", { name: "Save Grades" })).toHaveCount(0);
  await expect(staff.locator('input[type="number"]').first()).toBeDisabled();

  const lockedRow = await openReport(staff);
  await expect(lockedRow).toContainText("GRADE PENDING");
  await expect(lockedRow.getByRole("button", { name: "View (admins grade)" })).toBeVisible();
  await staff.context().close();
});

test("3. the admin grades the written answers", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.goto(attemptUrl);
  await fillMaxMarks(admin);
  await admin.getByRole("button", { name: "Save Grades" }).click();
  await expect(admin.getByText(/Written \d+, total \d+ \/ \d+ — fully graded\./)).toBeVisible();
  await expect(admin.getByText(/Graded by System Administrator \(Admin\) on \d{2} \w{3} \d{4}/)).toBeVisible();

  const row = await openReport(admin);
  await expect(row).toContainText("COMPLETE");
  await admin.context().close();
});

test("4. the admin turns staff grading back on", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await setStaffGrading(admin, true);
  await admin.context().close();

  const staff = await demoLogin(browser, "Staff");
  await staff.goto(attemptUrl);
  await expect(staff.getByText(/Graded by System Administrator \(Admin\)/)).toBeVisible();
  await expect(staff.getByText(LOCKED)).toHaveCount(0);
  await staff.context().close();
});

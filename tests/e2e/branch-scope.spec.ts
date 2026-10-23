import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/**
 * Branch switcher follow-ups (Stage G1): reports, leads and the admission
 * form follow the real branches. The seed has Main Branch and Mumbai Branch.
 */
async function adminIn(context: BrowserContext, branch: string | null): Promise<Page> {
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore as Admin" }).click();
  await page.waitForURL(/admin-dashboard/);
  const url = new URL(page.url());
  await context.clearCookies({ name: "auraedu_branch" });
  if (branch) await context.addCookies([{ name: "auraedu_branch", value: encodeURIComponent(branch), domain: url.hostname, path: "/" }]);
  return page;
}

async function summaryNumber(page: Page, label: string): Promise<number> {
  const tile = page.locator("div", { has: page.getByText(label, { exact: true }) }).last();
  const text = await tile.innerText();
  return Number(text.replace(label, "").replace(/[^\d]/g, ""));
}

test("reports follow the branch switcher and say which branch they cover", async ({ browser }) => {
  const all = await adminIn(await browser.newContext(), null);
  await all.goto("/admin-dashboard/reports/admissions-by-month");
  await expect(all.getByText("Branch: All branches")).toBeVisible();
  const allStudents = await summaryNumber(all, "Total students");

  const mumbai = await adminIn(await browser.newContext(), "Mumbai Branch");
  await mumbai.goto("/admin-dashboard/reports/admissions-by-month");
  await expect(mumbai.getByText("Branch: Mumbai Branch")).toBeVisible();
  const mumbaiStudents = await summaryNumber(mumbai, "Total students");

  expect(mumbaiStudents).toBeGreaterThan(0);
  expect(mumbaiStudents).toBeLessThan(allStudents);

  // Payroll is institute-wide whatever the switcher says.
  await mumbai.goto("/admin-dashboard/reports/payroll-summary");
  await expect(mumbai.getByText(/Institute-wide/)).toBeVisible();
});

test("the leads list narrows to the branch's leads plus unassigned ones", async ({ browser }) => {
  const all = await adminIn(await browser.newContext(), null);
  await all.goto("/admin-dashboard/lms/leads");
  const allRows = all.locator("tbody tr");
  await expect(allRows.first()).toBeVisible();
  const allCount = await allRows.count();

  const mumbai = await adminIn(await browser.newContext(), "Mumbai Branch");
  await mumbai.goto("/admin-dashboard/lms/leads");
  await expect(mumbai.locator("tbody")).toBeVisible();
  expect(await mumbai.locator("tbody tr").count()).toBeLessThan(allCount);
});

test("the admission form offers only the institute's real branches", async ({ page }) => {
  await page.goto("/register");
  // Step 2 holds the branch picker; options come from Settings → Branches.
  const options = async () => page.locator("select").filter({ has: page.locator("option", { hasText: "Main Branch" }) }).locator("option").allInnerTexts();
  await page.locator('label:has-text("First Name") + input').fill("Branch");
  await page.locator('label:has-text("Last Name") + input').fill("Check");
  await page.locator('label:has-text("Date of Birth") + input').fill("2000-01-01");
  await page.locator('label:has-text("Gender") + select').selectOption("Female");
  await page.locator('label:has-text("Email Address") + input').fill("branch.check@demo.auraedu.com");
  await page.locator('label:has-text("Phone Number") + input').fill("9876512345");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect.poll(options).toEqual(["Main Branch", "Mumbai Branch"]);
});

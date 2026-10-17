import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

/**
 * Privacy consent on the public forms, the Privacy Notice, and the admin
 * data-subject tools (export + erase) on the student profile.
 */
test.describe.configure({ mode: "serial" });

const CONSENT_ERROR = "Please agree to the Privacy Notice to continue.";

const field = (page: Page, label: string) =>
  page
    .locator(`label:has-text("${label}") + input, label:has-text("${label}") + select, label:has-text("${label}") + textarea`)
    .first();

test("admission form refuses to submit without consent, and a minor also needs a guardian", async ({ page }) => {
  await page.goto("/register");
  await field(page, "First Name").fill("Consent");
  await field(page, "Last Name").fill("Check");
  await field(page, "Date of Birth").fill("2012-03-01");
  await field(page, "Gender").selectOption("Male");
  await field(page, "Email Address").fill("consent.check@demo.auraedu.com");
  await field(page, "Phone Number").fill("9800000001");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator('input[name="course"]').first().check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();
  await field(page, "Guardian's Full Name").fill("Parent Check");
  await field(page, "Guardian's Contact Number").fill("9800000002");
  await field(page, "Permanent Address").fill("1 Test Lane, Pune");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByRole("link", { name: "Privacy Notice" })).toHaveAttribute("href", "/privacy-policy");
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page.getByText(CONSENT_ERROR)).toBeVisible();

  await page.locator("#consent").check();
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page.getByText("a parent/guardian must give consent on their behalf")).toBeVisible();
  await expect(page.getByText("Application Received!")).toHaveCount(0);
});

test("public forms always carry the consent box and require it", async ({ page }) => {
  await page.goto("/f/free-demo-class");
  await field(page, "Student name").fill("Form Consent");
  await field(page, "Phone number").fill("9800000003");
  await field(page, "Course interested in").selectOption({ index: 1 });
  await page.locator("#ff-consent").check(); // the form's own WhatsApp checkbox
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText(CONSENT_ERROR).first()).toBeVisible();

  await page.locator("#ff-privacy-consent").check();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByText("Response received")).toBeVisible();
});

test("the Privacy Notice names the institute's grievance contact", async ({ page }) => {
  await page.goto("/privacy-policy");
  await expect(page.getByRole("heading", { name: "Privacy Notice" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Grievance contact" })).toBeVisible();
  await expect(page.getByText("Withdraw consent", { exact: false })).toBeVisible();
});

test("admin exports a student's data, then erases it", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore as Admin" }).click();
  await page.waitForURL(/\/admin-dashboard/);

  await page.goto("/admin-dashboard/lms/students");
  await page.getByPlaceholder("Search by name, email, phone, admission, roll...").fill("Kabir Singh");
  // Wait for the debounced search to settle before clicking into the row.
  await expect(page.locator("tbody tr")).toHaveCount(1);
  const row = page.locator("tr", { hasText: "Kabir Singh" });
  await expect(async () => {
    await row.getByTitle("View details").click();
    await expect(page.getByText("Data & privacy")).toBeVisible({ timeout: 3_000 });
  }).toPass();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Export this student's data/ }).click(),
  ]);
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(data.profile.name).toBe("Kabir Singh");
  expect(data.profile).not.toHaveProperty("passwordHash");
  for (const key of ["invoices", "payments", "attendance", "results", "assignmentSubmissions", "leads"]) {
    expect(Array.isArray(data[key]), key).toBe(true);
  }
  expect(data.leads.length).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Erase personal data" }).click();
  const confirm = page.getByRole("button", { name: "Erase permanently" });
  await page.locator("#erase-confirm").fill("Kabir");
  await expect(confirm).toBeDisabled();
  await page.locator("#erase-confirm").fill("Kabir Singh");
  await confirm.click();
  await expect(page.getByText(/Personal data erased on/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Erased student #/ })).toBeVisible();
});

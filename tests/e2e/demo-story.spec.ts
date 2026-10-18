import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * The demo story from docs/DEMO_SCRIPT.md, end to end on live data:
 * apply online → admin converts the lead → the student signs in and sets a
 * password → sits the active test → staff grade the written answer → the
 * student sees the final score → admin blocks the account (instant sign-out)
 * → staff are kept out of Settings → Reset demo data restores the seed.
 */
test.describe.configure({ mode: "serial" });

const stamp = Date.now().toString().slice(-6);
const applicant = {
  first: "Riya",
  last: `E2E${stamp}`,
  email: `riya.e2e${stamp}@demo.auraedu.com`,
  phone: `98${stamp}11`,
};
const fullName = `${applicant.first} ${applicant.last}`;
const newPassword = `Story@${stamp}x`;

let oneTimePassword = "";
let student: Page;
let testId = "";
let testTitle = "";
let finalScore = "";

/** An input/select/textarea that follows a visible label with this text. */
const field = (page: Page, label: string) =>
  page
    .locator(`label:has-text("${label}") + input, label:has-text("${label}") + select, label:has-text("${label}") + textarea`)
    .first();

async function demoLogin(browser: Browser, who: "Admin" | "Staff"): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: `Explore as ${who}` }).click();
  await page.waitForURL(/\/admin-dashboard/);
  return page;
}

async function studentLogin(page: Page, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("student@example.com").fill(applicant.email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Login as Student" }).click();
}

test("1. an applicant applies online and gets a reference", async ({ page }) => {
  await page.goto("/register");
  await field(page, "First Name").fill(applicant.first);
  await field(page, "Last Name").fill(applicant.last);
  await field(page, "Date of Birth").fill("2010-05-14");
  await field(page, "Gender").selectOption("Female");
  await field(page, "Email Address").fill(applicant.email);
  await field(page, "Phone Number").fill(applicant.phone);
  await page.getByRole("button", { name: "Continue" }).click();

  // The seeded "Active Now" test belongs to NEET Batch A.
  await page.locator("label", { hasText: "NEET" }).locator('input[name="course"]').first().check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();

  await field(page, "Guardian's Full Name").fill("Sunil Sharma");
  await field(page, "Guardian's Contact Number").fill("9812345670");
  await field(page, "Permanent Address").fill("12 MG Road, Pune");
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText(applicant.email)).toBeVisible();
  // Born 2010 → a minor, so the guardian must consent as well.
  await page.locator("#consent").check();
  await page.locator("#guardianConsent").check();
  await page.getByRole("button", { name: "Submit Application" }).click();
  await expect(page.getByText("Application Received!")).toBeVisible();
  await expect(page.getByText(/^LD-\d{4}-\d+$/)).toBeVisible();
});

test("2. admin converts the lead into a student with a one-time password", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.goto("/admin-dashboard/lms/leads");
  await admin.getByPlaceholder("Search name, lead no, course, owner, phone...").fill(applicant.last);
  const row = admin.locator("tr", { hasText: fullName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Convert" }).click();
  await admin.locator('select:has(option[value="NEET Batch A"])').first().selectOption("NEET Batch A");
  await admin.getByRole("button", { name: "Convert to student" }).click();

  const password = admin.locator("code").filter({ hasText: /\S{6,}/ }).first();
  await expect(password).toBeVisible();
  oneTimePassword = (await password.innerText()).trim();
  expect(oneTimePassword.length).toBeGreaterThanOrEqual(8);
  await admin.getByRole("button", { name: "Done" }).click();
  await expect(admin.locator("tr", { hasText: fullName })).toContainText(/Converted/i);
  await admin.context().close();
});

test("3. the new student must set a password at first sign-in", async ({ browser }) => {
  student = await (await browser.newContext()).newPage();
  await studentLogin(student, oneTimePassword);
  await expect(student.getByRole("heading", { name: "Set a new password" })).toBeVisible();
  await field(student, "Current (temporary) password").fill(oneTimePassword);
  await field(student, "New password").fill(newPassword);
  await field(student, "Confirm new password").fill(newPassword);
  await student.getByRole("button", { name: "Save and continue" }).click();
  await expect(student.getByRole("heading", { name: "Set a new password" })).toBeHidden();
  await expect(student.getByText(applicant.first).first()).toBeVisible();
});

test("4. the student sits the active test; MCQs score instantly, written waits", async () => {
  await student.goto("/student-portal/tests");
  await student.getByRole("button", { name: "Start Examination Now" }).first().click();
  await student.waitForURL(/\/student-portal\/tests\/[a-f0-9]{24}/);
  testId = student.url().split("/").pop()!;
  await student.getByRole("button", { name: "Begin Test (Fullscreen Lock)" }).click();

  const textarea = student.getByPlaceholder("Type your answer here...");
  const next = student.getByRole("button", { name: "Next" });
  const submit = student.getByRole("button", { name: "Submit Examination" });
  testTitle = (await student.locator("h2").first().innerText()).trim();

  let wroteSomething = false;
  for (let i = 0; i < 50; i++) {
    await expect(student.getByText(/QUESTION \d+ \/ \d+/)).toBeVisible();
    if (await textarea.isVisible()) {
      await textarea.fill("Force equals mass times acceleration, so doubling the mass halves the acceleration.");
      wroteSomething = true;
    } else {
      await student.locator("h3 + div button").first().click();
    }
    if (await submit.isVisible()) break;
    await next.click();
  }
  expect(wroteSomething, "the active demo test should include a written question").toBe(true);

  await submit.click();
  await student.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(student.getByText(`${testTitle} — Submitted`)).toBeVisible();
  // The answered written question must wait for faculty, not count as graded.
  await expect(student.getByText(/\([1-9]\d* grading\)/)).toBeVisible();
});

test("5. staff grade the written answer", async ({ browser }) => {
  const staff = await demoLogin(browser, "Staff");
  await staff.goto(`/admin-dashboard/lms/students/tests/${testId}`);
  const row = staff.locator("tr", { hasText: fullName });
  await expect(row).toContainText("GRADE PENDING");
  await row.getByRole("button", { name: "Grade Written" }).click();
  await staff.waitForURL(/\/tests\/attempts\//);

  const marks = staff.locator('input[type="number"]');
  await expect(marks.first()).toBeVisible();
  for (const input of await marks.all()) {
    await input.fill((await input.getAttribute("max")) ?? "1");
  }
  await staff.getByRole("button", { name: "Save Grades" }).click();
  const saved = staff.getByText(/Written \d+, total \d+ \/ \d+/);
  await expect(saved).toBeVisible();
  finalScore = (await saved.innerText()).match(/total (\d+ \/ \d+)/)![1];
  await staff.context().close();
});

test("6. the student sees the final graded score", async () => {
  await student.goto("/student-portal/tests");
  await expect(student.getByText(`Score: ${finalScore}`).first()).toBeVisible();
  // A batch test whose window closed before the student joined is "Missed", not "Upcoming".
  await expect(student.getByText(/Closed on .* — not attempted/).first()).toBeVisible();
});

test("7. blocking the student signs them out at once; staff can't open Settings", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.goto("/admin-dashboard/lms/students/logins");
  await admin.getByPlaceholder("Search student name, email, or student ID").fill(applicant.last);
  // The search leaves one student; the page shows cards or a table by width.
  await expect(admin.getByText(applicant.email).first()).toBeVisible();
  await admin.getByRole("button", { name: "Block", exact: true }).first().click();
  await admin.getByRole("button", { name: "Block student" }).click();
  await expect(admin.getByRole("button", { name: "Unblock", exact: true }).first()).toBeVisible();
  await admin.context().close();

  await student.goto("/student-portal");
  await expect(student).toHaveURL(/session-ended|\/login/);

  const staff = await demoLogin(browser, "Staff");
  await staff.goto("/admin-dashboard/settings");
  await expect(staff.getByText("That section is restricted to administrators.")).toBeVisible();
  await staff.context().close();
});

test("8. Reset demo data removes the converted applicant", async ({ browser }) => {
  const admin = await demoLogin(browser, "Admin");
  await admin.getByRole("button", { name: "Reset demo data" }).click();
  await expect(admin.getByRole("button", { name: "Reset demo data" })).toBeEnabled({ timeout: 90_000 });
  await admin.context().close();

  const page = await (await browser.newContext()).newPage();
  await studentLogin(page, newPassword);
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

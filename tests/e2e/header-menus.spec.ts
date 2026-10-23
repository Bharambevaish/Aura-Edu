import { expect, test, type Browser } from "@playwright/test";

/**
 * Header menus "light-dismiss": only one open at a time, and the open one
 * closes on a click outside, on Escape, or after following one of its links.
 */
async function signIn(browser: Browser, who: "Student" | "Admin") {
  const page = await (await browser.newContext()).newPage();
  await page.goto("/login");
  await page.getByRole("button", { name: `Explore as ${who}` }).click();
  await page.waitForURL(who === "Student" ? /\/student-portal/ : /\/admin-dashboard/);
  return page;
}

test("student header: opening one menu closes the other; outside click and Esc close it", async ({ browser }) => {
  const page = await signIn(browser, "Student");
  // The dashboard opens its own welcome pop-up; test the header on another page.
  await page.goto("/student-portal/my-courses");
  // The notifications panel is the one with the "View All" link.
  const notifications = page.getByRole("banner").getByRole("link", { name: /View All/ });
  const accountMenu = page.getByRole("link", { name: "Manage Profile & Password" });

  // The reported bug: notifications open, then the account menu → both stayed open.
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(notifications).toBeVisible();
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(accountMenu).toBeVisible();
  await expect(notifications).toBeHidden();

  // Click outside → closes.
  await page.locator("main").click({ position: { x: 20, y: 20 } });
  await expect(accountMenu).toBeHidden();

  // Escape → closes.
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(notifications).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(notifications).toBeHidden();

  // Following a link in the menu closes it on the new page.
  await page.getByRole("button", { name: "Account menu" }).click();
  await accountMenu.click();
  await page.waitForURL(/\/student-portal\/profile\/manage/);
  await expect(accountMenu).toBeHidden();
  await page.context().close();
});

test("admin header: branch and account menus close each other", async ({ browser }) => {
  const page = await signIn(browser, "Admin");
  const branchOption = page.getByRole("button", { name: "Mumbai Branch" });
  const logout = page.getByRole("banner").getByRole("button", { name: "Logout" });

  await page.getByRole("button", { name: "Switch branch" }).click();
  await expect(branchOption).toBeVisible();
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(logout).toBeVisible();
  await expect(branchOption).toBeHidden();

  await page.keyboard.press("Escape");
  await expect(logout).toBeHidden();
  await page.context().close();
});

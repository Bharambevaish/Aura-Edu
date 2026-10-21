import { expect, test, type Browser } from "@playwright/test";
import { ADMIN_ROUTES, PUBLIC_ROUTES, STUDENT_ROUTES } from "./routes";

/**
 * Server and browser clocks disagree in real life (Vercel renders in UTC,
 * users are in India). Any page that formats "today" or a time during the
 * server render then hydrates with different text (React error #418).
 * Run every page with the browser 14 hours ahead and fail on any such error.
 */
test.setTimeout(600_000);

async function pageErrors(browser: Browser, who: "Admin" | "Student" | null, paths: string[]): Promise<string[]> {
  const context = await browser.newContext({ timezoneId: "Pacific/Kiritimati" });
  const page = await context.newPage();
  const found: string[] = [];
  let current = "";
  page.on("pageerror", (e) => found.push(`${current}: ${e.message.slice(0, 120)}`));
  if (who) {
    await page.goto("/login");
    await page.getByRole("button", { name: `Explore as ${who}` }).click();
    await page.waitForURL(who === "Admin" ? /admin-dashboard/ : /student-portal/);
  }
  for (const path of paths) {
    current = path;
    await page.goto(path);
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  await context.close();
  return found;
}

test("no hydration or script errors when the browser's time zone differs from the server's", async ({ browser }) => {
  const errors = [
    ...(await pageErrors(browser, null, PUBLIC_ROUTES)),
    ...(await pageErrors(browser, "Admin", ADMIN_ROUTES)),
    ...(await pageErrors(browser, "Student", STUDENT_ROUTES)),
  ];
  expect(errors).toEqual([]);
});

import { expect, test, type Page } from "@playwright/test";

/**
 * The nonce-based CSP (proxy.ts + lib/csp.ts) must not break any page:
 * each page loads, hydrates, and logs no CSP violation or script error.
 */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && /Content Security Policy|Refused to/i.test(msg.text())) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

test("public pages carry a nonce CSP and run without violations", async ({ page }) => {
  const errors = watchErrors(page);
  for (const path of ["/", "/login", "/register", "/privacy-policy", "/f/free-demo-class"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    const csp = res!.headers()["content-security-policy"] ?? "";
    expect(csp, path).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(csp, path).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(csp, path).toContain(path.startsWith("/f/") ? "frame-ancestors *" : "frame-ancestors 'none'");
    await page.waitForLoadState("networkidle");
  }
  // Hydration works: the multi-step admission form reacts to input.
  await page.goto("/register");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText(/required|enter/i).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("admin and student portals run without CSP violations", async ({ browser }) => {
  for (const who of ["Admin", "Student"] as const) {
    const page = await (await browser.newContext()).newPage();
    const errors = watchErrors(page);
    await page.goto("/login");
    await page.getByRole("button", { name: `Explore as ${who}` }).click();
    await page.waitForURL(who === "Admin" ? /\/admin-dashboard/ : /\/student-portal/);
    const paths =
      who === "Admin"
        ? ["/admin-dashboard", "/admin-dashboard/lms/students", "/admin-dashboard/finance/overview", "/admin-dashboard/reports", "/admin-dashboard/lms/forms"]
        : ["/student-portal", "/student-portal/tests", "/student-portal/fees", "/student-portal/my-courses"];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    expect(errors, who).toEqual([]);
    await page.context().close();
  }
});

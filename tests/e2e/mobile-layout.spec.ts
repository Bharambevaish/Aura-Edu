import { expect, test, type Browser } from "@playwright/test";

/**
 * Phone-width layout guard: no page may scroll sideways at 375px. Content
 * inside its own scroll box (wide tables) is fine; the page itself is not.
 */

const ADMIN = "/admin-dashboard /admin-dashboard/account /admin-dashboard/administration/master /admin-dashboard/administration/payroll /admin-dashboard/administration/staff /admin-dashboard/connect /admin-dashboard/connect/calendar /admin-dashboard/connect/groups /admin-dashboard/connect/meetings /admin-dashboard/connect/meetings/schedule /admin-dashboard/connect/notices /admin-dashboard/finance/audit-trail /admin-dashboard/finance/expense-approvals /admin-dashboard/finance/expense-categories /admin-dashboard/finance/expenses /admin-dashboard/finance/expenses/create /admin-dashboard/finance/invoices /admin-dashboard/finance/overview /admin-dashboard/finance/payments /admin-dashboard/finance/refunds /admin-dashboard/finance/vendors /admin-dashboard/finance/waivers /admin-dashboard/leave /admin-dashboard/lms/courses /admin-dashboard/lms/courses/create /admin-dashboard/lms/doubts /admin-dashboard/lms/forms /admin-dashboard/lms/forms/create /admin-dashboard/lms/leads /admin-dashboard/lms/schedules/batch /admin-dashboard/lms/schedules/date-wise /admin-dashboard/lms/students /admin-dashboard/lms/students/assignments /admin-dashboard/lms/students/assignments/create /admin-dashboard/lms/students/attendance /admin-dashboard/lms/students/batches /admin-dashboard/lms/students/batches/create /admin-dashboard/lms/students/certificates /admin-dashboard/lms/students/certificates/generate /admin-dashboard/lms/students/logins /admin-dashboard/lms/students/test-cards /admin-dashboard/lms/students/tests /admin-dashboard/lms/students/tests/create /admin-dashboard/lms/tasks /admin-dashboard/reports /admin-dashboard/settings /admin-dashboard/settings/config/branch /admin-dashboard/settings/config/invoice /admin-dashboard/settings/config/staff-permission /admin-dashboard/settings/config/tax /admin-dashboard/settings/profile".split(" ");
const STUDENT = "/student-portal /student-portal/assignments /student-portal/attendance /student-portal/certificates /student-portal/course-store /student-portal/fees /student-portal/my-courses /student-portal/notifications /student-portal/profile/manage /student-portal/schedule /student-portal/test-card /student-portal/tests".split(" ");
const PUBLIC = "/ /login /register /privacy-policy /verify /f/free-demo-class".split(" ");

test.use({ viewport: { width: 375, height: 812 } });
test.setTimeout(600_000);

async function probe(browser: Browser, who: "Admin" | "Student" | null, paths: string[], offenders: string[]) {
  const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
  if (who) {
    await page.goto("/login");
    await page.getByRole("button", { name: `Explore as ${who}` }).click();
    await page.waitForURL(who === "Admin" ? /admin-dashboard/ : /student-portal/);
  }
  for (const p of paths) {
    await page.goto(p);
    await page.waitForLoadState("networkidle").catch(() => {});
    const r = await page.evaluate(() => {
      const vw = window.innerWidth;
      const over = document.documentElement.scrollWidth - vw;
      let worst = "";
      let worstRight = vw;
      if (over > 1) {
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.right <= worstRight + 1) continue;
          // skip things inside a horizontally scrollable box
          let a: Element | null = el.parentElement;
          let clipped = false;
          while (a && a !== document.body) {
            const ox = getComputedStyle(a).overflowX;
            if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") { clipped = true; break; }
            a = a.parentElement;
          }
          if (clipped) continue;
          worstRight = rect.right;
          worst = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 90)} [${(el.textContent ?? "").trim().slice(0, 30)}]`;
        }
      }
      return { over, worst };
    });
    if (r.over > 1) offenders.push(`${p}: ${r.over}px wider than the screen (${r.worst})`);
  }
  await page.context().close();
}

test("no page scrolls sideways on a 375px phone", async ({ browser }) => {
  const offenders: string[] = [];
  await probe(browser, null, PUBLIC, offenders);
  await probe(browser, "Admin", ADMIN, offenders);
  await probe(browser, "Student", STUDENT, offenders);
  expect(offenders).toEqual([]);
});

import { expect, test, type Browser } from "@playwright/test";
import { ADMIN_ROUTES as ADMIN, PUBLIC_ROUTES as PUBLIC, STUDENT_ROUTES as STUDENT } from "./routes";

/**
 * Phone-width layout guard: no page may scroll sideways at 375px. Content
 * inside its own scroll box (wide tables) is fine; the page itself is not.
 */


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

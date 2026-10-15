import { describe, expect, it } from "vitest";
import { computePayslip, workingDaysBetween, workingDaysInMonth } from "@/lib/hr";

describe("working days (Mon–Sat)", () => {
  it("skips Sundays", () => {
    // Sat 10 Oct 2026 → Tue 13 Oct 2026: Sat, (Sun), Mon, Tue
    expect(workingDaysBetween(new Date(2026, 9, 10), new Date(2026, 9, 13))).toBe(3);
  });
  it("counts a whole month", () => {
    expect(workingDaysInMonth(2026, 9)).toBe(27); // October 2026 has 4 Sundays
  });
});

describe("computePayslip", () => {
  it("splits salary and applies PF and professional tax", () => {
    const p = computePayslip(40000, 26, 0);
    expect(p).toMatchObject({ basic: 20000, hra: 8000, special: 12000, pf: 1800, professionalTax: 200, tds: 0, net: 38000 });
  });

  it("pro-rates loss of pay and never docks more days than exist", () => {
    expect(computePayslip(26000, 26, 2).lossOfPay).toBe(2000);
    expect(computePayslip(26000, 26, 40)).toMatchObject({ unpaidDays: 26, earnedGross: 0, net: 0 });
  });

  it("applies illustrative TDS above ₹1,00,000", () => {
    expect(computePayslip(150000, 26, 0).tds).toBe(5000);
  });
});

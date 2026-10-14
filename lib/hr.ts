/**
 * HR rules shared by leave and payroll (pure, client-safe).
 *
 * The payroll numbers are a *simulator* for the demo — a plain, explainable
 * Indian salary structure, not tax advice or a statutory calculator.
 */
import type { LeaveType } from "@/lib/models/LeaveRequest";

/** Yearly allowance per leave type (unpaid has no cap). */
export const LEAVE_ALLOWANCE: Record<Exclude<LeaveType, "unpaid">, number> = {
  casual: 12,
  sick: 10,
  earned: 15,
};

export const LEAVE_LABEL: Record<LeaveType, string> = {
  casual: "Casual",
  sick: "Sick",
  earned: "Earned",
  unpaid: "Unpaid (loss of pay)",
};

/** Working days (Mon–Sat; Sundays off) between two dates, inclusive. */
export function workingDaysBetween(from: Date, to: Date): number {
  let n = 0;
  for (let d = new Date(from.getFullYear(), from.getMonth(), from.getDate()); d <= to; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0) n += 1;
  }
  return n;
}

/** Working days in a calendar month (Mon–Sat). */
export function workingDaysInMonth(year: number, monthIndex: number): number {
  return workingDaysBetween(new Date(year, monthIndex, 1), new Date(year, monthIndex + 1, 0));
}

export type Payslip = {
  gross: number;
  basic: number;
  hra: number;
  special: number;
  lossOfPay: number;
  earnedGross: number;
  pf: number;
  professionalTax: number;
  tds: number;
  totalDeductions: number;
  net: number;
  workingDays: number;
  unpaidDays: number;
};

const round = (n: number) => Math.round(n);

/**
 * Simple salary structure: basic 50%, HRA 20%, special allowance 30% of gross.
 * Loss of pay pro-rates gross by unpaid working days. Employee PF is 12% of
 * basic (capped at ₹1,800), professional tax ₹200 above ₹15,000, and TDS a
 * flat 10% of the monthly income above ₹1,00,000 (illustrative only).
 */
export function computePayslip(monthlySalary: number, workingDays: number, unpaidDays: number): Payslip {
  const gross = Math.max(0, monthlySalary);
  const unpaid = Math.min(Math.max(0, unpaidDays), workingDays);
  const lossOfPay = workingDays > 0 ? round((gross / workingDays) * unpaid) : 0;
  const earnedGross = gross - lossOfPay;
  const basic = round(earnedGross * 0.5);
  const hra = round(earnedGross * 0.2);
  const special = earnedGross - basic - hra;
  const pf = Math.min(1800, round(basic * 0.12));
  const professionalTax = earnedGross > 15000 ? 200 : 0;
  const tds = earnedGross > 100000 ? round((earnedGross - 100000) * 0.1) : 0;
  const totalDeductions = pf + professionalTax + tds;
  return {
    gross,
    basic,
    hra,
    special,
    lossOfPay,
    earnedGross,
    pf,
    professionalTax,
    tds,
    totalDeductions,
    net: earnedGross - totalDeductions,
    workingDays,
    unpaidDays: unpaid,
  };
}

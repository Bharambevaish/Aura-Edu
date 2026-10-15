import { describe, expect, it } from "vitest";
import { invoiceBalance, invoiceStatus, refundableAmount, summarizeFees } from "@/lib/finance";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const NOW = day("2026-10-15").getTime();

describe("invoiceBalance", () => {
  it("subtracts payments and waivers", () => {
    expect(invoiceBalance({ total: 10000, paid: 6000, waived: 1000 })).toBe(3000);
  });
  it("is never negative and treats missing amounts as 0", () => {
    expect(invoiceBalance({ total: 5000, paid: 6000, waived: 0 })).toBe(0);
    expect(invoiceBalance({ total: 5000 })).toBe(5000);
  });
});

describe("invoiceStatus", () => {
  it("is Paid when nothing is due, whatever the date", () => {
    expect(invoiceStatus(0, day("2020-01-01"), NOW)).toBe("Paid");
  });
  it("is Overdue past the due date and Issued before it", () => {
    expect(invoiceStatus(100, day("2026-10-14"), NOW)).toBe("Overdue");
    expect(invoiceStatus(100, day("2026-10-16"), NOW)).toBe("Issued");
  });
});

describe("summarizeFees", () => {
  it("adds up totals, outstanding and overdue across invoices", () => {
    const s = summarizeFees(
      [
        { total: 10000, paid: 10000, waived: 0, dueDate: day("2026-08-01") },
        { total: 8000, paid: 3000, waived: 1000, dueDate: day("2026-09-01") }, // 4000 overdue
        { total: 6000, paid: 0, waived: 0, dueDate: day("2026-11-01") }, // 6000 upcoming
      ],
      NOW,
    );
    expect(s).toMatchObject({ total: 24000, paid: 13000, waived: 1000, outstanding: 10000, overdue: 4000 });
    expect(s.nextDueDate).toEqual(day("2026-09-01"));
  });

  it("does not let an overpaid invoice hide the balance on another", () => {
    const s = summarizeFees(
      [
        { total: 5000, paid: 7000, waived: 0, dueDate: day("2026-09-01") },
        { total: 5000, paid: 0, waived: 0, dueDate: day("2026-11-01") },
      ],
      NOW,
    );
    expect(s.outstanding).toBe(5000);
  });

  it("has no next due date when everything is settled", () => {
    expect(summarizeFees([{ total: 100, paid: 100, waived: 0, dueDate: day("2026-09-01") }], NOW).nextDueDate).toBeNull();
  });
});

describe("refundableAmount", () => {
  it("subtracts every earlier refund except rejected ones", () => {
    expect(
      refundableAmount(10000, [
        { amount: 3000, status: "pending" },
        { amount: 2000, status: "processed" },
        { amount: 9000, status: "rejected" },
      ]),
    ).toBe(5000);
  });
  it("is never negative", () => {
    expect(refundableAmount(1000, [{ amount: 1500, status: "approved" }])).toBe(0);
  });
});

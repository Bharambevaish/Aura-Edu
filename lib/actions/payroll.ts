"use server";

/**
 * Payroll simulator: monthly payslips for active staff from their monthly
 * salary and approved unpaid leave (lib/hr.ts computePayslip). Nothing is
 * paid or stored — it is a calculator over live HR data.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";
import { LeaveRequestModel } from "@/lib/models/LeaveRequest";
import { computePayslip, workingDaysBetween, workingDaysInMonth, type Payslip } from "@/lib/hr";

export type PayslipRow = {
  userId: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  month: string;
  slip: Payslip;
};

function parseMonth(month: string): { year: number; index: number; label: string } {
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  const now = new Date();
  const year = m ? Number(m[1]) : now.getFullYear();
  const index = m ? Math.min(11, Math.max(0, Number(m[2]) - 1)) : now.getMonth();
  return { year, index, label: `${year}-${String(index + 1).padStart(2, "0")}` };
}

/** Approved unpaid working days per user inside the month. */
async function unpaidDaysInMonth(year: number, index: number, userIds?: mongoose.Types.ObjectId[]): Promise<Map<string, number>> {
  const start = new Date(year, index, 1);
  const end = new Date(year, index + 1, 0);
  const rows = await LeaveRequestModel.find({
    type: "unpaid",
    status: "approved",
    from: { $lte: end },
    to: { $gte: start },
    ...(userIds ? { userId: { $in: userIds } } : {}),
  }).lean();
  const map = new Map<string, number>();
  for (const r of rows) {
    const from = r.from > start ? r.from : start;
    const to = r.to < end ? r.to : end;
    map.set(String(r.userId), (map.get(String(r.userId)) ?? 0) + workingDaysBetween(from, to));
  }
  return map;
}

/** Admin: payslips for every active staff member for a month (YYYY-MM). */
export async function getPayroll(month: string): Promise<{ month: string; workingDays: number; rows: PayslipRow[]; withoutSalary: string[]; totals: { gross: number; deductions: number; net: number } }> {
  await requireRole(["admin"]);
  await connectDB();
  const { year, index, label } = parseMonth(month);
  // Active staff with a salary on file; others are counted but not paid.
  const allStaff = await UserModel.find({ role: "staff", isBlocked: { $ne: true } }).sort({ name: 1 }).lean();
  const staff = allStaff.filter((s) => (s.monthlySalary ?? 0) > 0);
  const unpaid = await unpaidDaysInMonth(year, index);
  const workingDays = workingDaysInMonth(year, index);
  const rows = staff.map((s) => ({
    userId: String(s._id),
    name: s.name,
    employeeId: s.employeeId ?? "",
    designation: s.designation ?? "",
    department: s.department ?? "",
    month: label,
    slip: computePayslip(s.monthlySalary ?? 0, workingDays, unpaid.get(String(s._id)) ?? 0),
  }));
  return {
    month: label,
    workingDays,
    rows,
    withoutSalary: allStaff.filter((s) => !(s.monthlySalary ?? 0)).map((s) => s.name),
    totals: {
      gross: rows.reduce((n, r) => n + r.slip.earnedGross, 0),
      deductions: rows.reduce((n, r) => n + r.slip.totalDeductions, 0),
      net: rows.reduce((n, r) => n + r.slip.net, 0),
    },
  };
}

/** The signed-in staff member's own payslip for a month. */
export async function getMyPayslip(month: string): Promise<PayslipRow | null> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const { year, index, label } = parseMonth(month);
  const me = await UserModel.findById(user.id).lean();
  if (!me || !me.monthlySalary) return null;
  const unpaid = await unpaidDaysInMonth(year, index, [me._id as mongoose.Types.ObjectId]);
  return {
    userId: String(me._id),
    name: me.name,
    employeeId: me.employeeId ?? "",
    designation: me.designation ?? "",
    department: me.department ?? "",
    month: label,
    slip: computePayslip(me.monthlySalary, workingDaysInMonth(year, index), unpaid.get(String(me._id)) ?? 0),
  };
}

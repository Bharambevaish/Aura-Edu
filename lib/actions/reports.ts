"use server";

/**
 * Report engine: every report in lib/reports.ts is computed here from live
 * data and returned as a table (+ which columns to chart). Expense and
 * payroll reports are admin-only, matching the screens they summarise.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { reportMeta, type ReportKey } from "@/lib/reports";
import { computePayslip, workingDaysBetween, workingDaysInMonth } from "@/lib/hr";
import { PaymentModel } from "@/lib/models/Payment";
import { InvoiceModel } from "@/lib/models/Invoice";
import { WaiverModel } from "@/lib/models/Waiver";
import { RefundModel } from "@/lib/models/Refund";
import { ExpenseModel } from "@/lib/models/Expense";
import { ExpenseCategoryModel } from "@/lib/models/ExpenseCategory";
import { VendorModel } from "@/lib/models/Vendor";
import { UserModel } from "@/lib/models/User";
import { AttendanceModel } from "@/lib/models/Attendance";
import { CourseModel } from "@/lib/models/Course";
import { LessonProgressModel } from "@/lib/models/LessonProgress";
import { ResultModel } from "@/lib/models/Result";
import { TestModel } from "@/lib/models/Test";
import { LeadModel } from "@/lib/models/Lead";
import { LeaveRequestModel } from "@/lib/models/LeaveRequest";

type Cell = string | number;

export type ReportResult = {
  key: ReportKey;
  title: string;
  description: string;
  columns: string[];
  /** Columns holding ₹ amounts (formatted as currency). */
  moneyColumns: number[];
  rows: Cell[][];
  /** Chart the value column against the label column. */
  chart: { label: number; value: number } | null;
  summary: { label: string; value: string }[];
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
const sumBy = <T,>(items: T[], key: (t: T) => string, val: (t: T) => number) => {
  const map = new Map<string, number>();
  for (const it of items) map.set(key(it), (map.get(key(it)) ?? 0) + val(it));
  return map;
};

export async function runReport(key: string): Promise<ReportResult | null> {
  const meta = reportMeta(key);
  if (!meta) return null;
  await requireRole(meta.adminOnly ? ["admin"] : ["admin", "staff"]);
  await connectDB();
  const base = { key: meta.key, title: meta.title, moneyColumns: [] as number[], summary: [] as { label: string; value: string }[] };
  const now = new Date();

  switch (meta.key) {
    case "collections-by-month": {
      const pays = await PaymentModel.find({ status: "success" }).select("amount recordedAt").lean();
      const map = sumBy(pays, (p) => monthKey(new Date(p.recordedAt)), (p) => p.amount);
      const keys = [...map.keys()].sort();
      return {
        ...base,
        description: "Successful fee payments grouped by month.",
        columns: ["Month", "Payments", "Collected"],
        moneyColumns: [2],
        rows: keys.map((k) => [monthLabel(k), pays.filter((p) => monthKey(new Date(p.recordedAt)) === k).length, map.get(k)!]),
        chart: { label: 0, value: 2 },
        summary: [{ label: "Total collected", value: inr(pays.reduce((n, p) => n + p.amount, 0)) }],
      };
    }
    case "collections-by-mode": {
      const pays = await PaymentModel.find({ status: "success" }).select("amount mode source").lean();
      const map = sumBy(pays, (p) => p.mode || "Other", (p) => p.amount);
      const total = pays.reduce((n, p) => n + p.amount, 0);
      return {
        ...base,
        description: "How students pay — share of collections per payment mode.",
        columns: ["Mode", "Payments", "Collected", "Share %"],
        moneyColumns: [2],
        rows: [...map.entries()].sort((a, b) => b[1] - a[1]).map(([mode, amt]) => [mode, pays.filter((p) => (p.mode || "Other") === mode).length, amt, pct(amt, total)]),
        chart: { label: 0, value: 2 },
        summary: [
          { label: "Online via student portal", value: inr(pays.filter((p) => p.source === "Student Portal").reduce((n, p) => n + p.amount, 0)) },
        ],
      };
    }
    case "collections-by-branch": {
      const pays = await PaymentModel.find({ status: "success" }).select("amount branch").lean();
      const map = sumBy(pays, (p) => p.branch || "Main Branch", (p) => p.amount);
      return {
        ...base,
        description: "Fee collections per branch.",
        columns: ["Branch", "Collected"],
        moneyColumns: [1],
        rows: [...map.entries()].sort((a, b) => b[1] - a[1]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Branches", value: String(map.size) }],
      };
    }
    case "gst-collected": {
      const pays = await PaymentModel.find({ status: "success" }).select("gst amount recordedAt").lean();
      const map = sumBy(pays, (p) => monthKey(new Date(p.recordedAt)), (p) => p.gst ?? 0);
      const keys = [...map.keys()].sort();
      const total = pays.reduce((n, p) => n + (p.gst ?? 0), 0);
      return {
        ...base,
        description: "GST recorded on fee payments, by month.",
        columns: ["Month", "GST collected"],
        moneyColumns: [1],
        rows: keys.map((k) => [monthLabel(k), map.get(k)!]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Total GST", value: inr(total) }, ...(total === 0 ? [{ label: "Note", value: "No GST recorded on payments yet" }] : [])],
      };
    }
    case "fee-defaulters": {
      const invoices = await InvoiceModel.find().lean();
      const students = new Map((await UserModel.find({ _id: { $in: invoices.map((i) => i.studentId) } }).select("name admissionNo phone").lean()).map((u) => [String(u._id), u]));
      const rows = invoices
        .map((i) => ({ i, balance: i.total - i.paid - i.waived, overdueDays: Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86400000) }))
        .filter((x) => x.balance > 0)
        .sort((a, b) => b.overdueDays - a.overdueDays);
      return {
        ...base,
        description: "Students with an unpaid balance, most overdue first.",
        columns: ["Student", "Admission no", "Phone", "Invoice", "Due date", "Days overdue", "Balance"],
        moneyColumns: [6],
        rows: rows.map(({ i, balance, overdueDays }) => {
          const s = students.get(String(i.studentId));
          return [s?.name ?? "—", s?.admissionNo ?? "—", s?.phone ?? "—", i.invoiceNo, new Date(i.dueDate).toLocaleDateString("en-GB"), Math.max(0, overdueDays), balance];
        }),
        chart: { label: 0, value: 6 },
        summary: [
          { label: "Students with dues", value: String(rows.length) },
          { label: "Overdue amount", value: inr(rows.filter((r) => r.overdueDays > 0).reduce((n, r) => n + r.balance, 0)) },
        ],
      };
    }
    case "expected-vs-collected": {
      const invoices = await InvoiceModel.find().lean();
      const byCourse = new Map<string, { expected: number; collected: number; waived: number }>();
      for (const i of invoices) {
        const k = i.course || "—";
        const v = byCourse.get(k) ?? { expected: 0, collected: 0, waived: 0 };
        v.expected += i.total;
        v.collected += i.paid;
        v.waived += i.waived;
        byCourse.set(k, v);
      }
      return {
        ...base,
        description: "Invoiced fees against collections and waivers, per course.",
        columns: ["Course", "Expected", "Collected", "Waived", "Outstanding", "Collection %"],
        moneyColumns: [1, 2, 3, 4],
        rows: [...byCourse.entries()].map(([c, v]) => [c, v.expected, v.collected, v.waived, v.expected - v.collected - v.waived, pct(v.collected, v.expected)]),
        chart: { label: 0, value: 2 },
        summary: [],
      };
    }
    case "waivers": {
      const waivers = await WaiverModel.find().sort({ createdAt: -1 }).lean();
      const names = new Map((await UserModel.find({ _id: { $in: waivers.map((w) => w.studentId) } }).select("name").lean()).map((u) => [String(u._id), u.name]));
      return {
        ...base,
        description: "Fee waivers and scholarships, approved or not.",
        columns: ["Waiver", "Student", "Reason", "Status", "Amount"],
        moneyColumns: [4],
        rows: waivers.map((w) => [w.waiverNo, names.get(String(w.studentId)) ?? "—", w.reason, w.status, w.amount]),
        chart: null,
        summary: [{ label: "Approved total", value: inr(waivers.filter((w) => w.status === "approved").reduce((n, w) => n + w.amount, 0)) }],
      };
    }
    case "refunds": {
      const refunds = await RefundModel.find().sort({ createdAt: -1 }).lean();
      const map = sumBy(refunds, (r) => r.status, (r) => r.amount);
      return {
        ...base,
        description: "Refund requests by status and reason.",
        columns: ["Refund", "Reason", "Method", "Status", "Amount"],
        moneyColumns: [4],
        rows: refunds.map((r) => [r.refundNo, r.reason, r.method, r.status, r.amount]),
        chart: null,
        summary: [...map.entries()].map(([s, v]) => ({ label: `${s[0].toUpperCase()}${s.slice(1)}`, value: inr(v) })),
      };
    }
    case "expense-breakdown": {
      const [expenses, cats] = await Promise.all([ExpenseModel.find({ status: "approved" }).lean(), ExpenseCategoryModel.find().lean()]);
      const catName = new Map(cats.map((c) => [String(c._id), c.name]));
      const map = sumBy(expenses, (e) => catName.get(String(e.categoryRef)) ?? "Uncategorised", (e) => e.amount);
      const total = expenses.reduce((n, e) => n + e.amount, 0);
      return {
        ...base,
        description: "Approved expenses by category.",
        columns: ["Category", "Spent", "Share %"],
        moneyColumns: [1],
        rows: [...map.entries()].sort((a, b) => b[1] - a[1]).map(([c, v]) => [c, v, pct(v, total)]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Total approved spend", value: inr(total) }],
      };
    }
    case "vendor-payments": {
      const [expenses, vendors] = await Promise.all([ExpenseModel.find({ status: "approved", vendorRef: { $ne: null } }).lean(), VendorModel.find().lean()]);
      const vName = new Map(vendors.map((v) => [String(v._id), v.name]));
      const map = sumBy(expenses, (e) => vName.get(String(e.vendorRef)) ?? "—", (e) => e.amount);
      return {
        ...base,
        description: "Approved spend per vendor.",
        columns: ["Vendor", "Paid"],
        moneyColumns: [1],
        rows: [...map.entries()].sort((a, b) => b[1] - a[1]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Vendors paid", value: String(map.size) }],
      };
    }
    case "payroll-summary": {
      const staff = await UserModel.find({ role: "staff", isBlocked: { $ne: true }, monthlySalary: { $gt: 0 } }).lean();
      const y = now.getFullYear();
      const m = now.getMonth();
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      const unpaid = await LeaveRequestModel.find({ type: "unpaid", status: "approved", from: { $lte: end }, to: { $gte: start } }).lean();
      const wd = workingDaysInMonth(y, m);
      const byDept = new Map<string, { people: number; net: number; gross: number }>();
      for (const s of staff) {
        const lop = unpaid
          .filter((l) => String(l.userId) === String(s._id))
          .reduce((n, l) => n + workingDaysBetween(l.from > start ? l.from : start, l.to < end ? l.to : end), 0);
        const slip = computePayslip(s.monthlySalary ?? 0, wd, lop);
        const k = s.department || "—";
        const v = byDept.get(k) ?? { people: 0, net: 0, gross: 0 };
        v.people += 1;
        v.net += slip.net;
        v.gross += slip.earnedGross;
        byDept.set(k, v);
      }
      return {
        ...base,
        description: `This month's simulated payroll by department (${monthLabel(monthKey(now))}).`,
        columns: ["Department", "Staff", "Gross earned", "Net pay"],
        moneyColumns: [2, 3],
        rows: [...byDept.entries()].map(([d, v]) => [d, v.people, v.gross, v.net]),
        chart: { label: 0, value: 3 },
        summary: [{ label: "Total net pay", value: inr([...byDept.values()].reduce((n, v) => n + v.net, 0)) }],
      };
    }
    case "admissions-by-month": {
      const students = await UserModel.find({ role: "student" }).select("admissionDate createdAt").lean();
      const map = sumBy(students, (s) => monthKey(new Date(s.admissionDate ?? s.createdAt)), () => 1);
      const keys = [...map.keys()].sort();
      return {
        ...base,
        description: "New admissions per month.",
        columns: ["Month", "Admissions"],
        moneyColumns: [],
        rows: keys.map((k) => [monthLabel(k), map.get(k)!]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Total students", value: String(students.length) }],
      };
    }
    case "batch-attendance": {
      const regs = await AttendanceModel.find().select("batch entries.status").lean();
      const byBatch = new Map<string, { sessions: number; marked: number; present: number; late: number; absent: number }>();
      for (const r of regs) {
        const v = byBatch.get(r.batch) ?? { sessions: 0, marked: 0, present: 0, late: 0, absent: 0 };
        v.sessions += 1;
        for (const e of r.entries ?? []) {
          v.marked += 1;
          if (e.status === "present") v.present += 1;
          else if (e.status === "late") v.late += 1;
          else v.absent += 1;
        }
        byBatch.set(r.batch, v);
      }
      return {
        ...base,
        description: "Attendance per batch across all recorded sessions (late counts as attended).",
        columns: ["Batch", "Sessions", "Present", "Late", "Absent", "Attendance %"],
        moneyColumns: [],
        rows: [...byBatch.entries()].map(([b, v]) => [b, v.sessions, v.present, v.late, v.absent, pct(v.present + v.late, v.marked)]),
        chart: { label: 0, value: 5 },
        summary: [],
      };
    }
    case "course-completion": {
      const [courses, progress] = await Promise.all([CourseModel.find().select("title modules enrolledStudents").lean(), LessonProgressModel.find().select("courseId userId lessonId").lean()]);
      return {
        ...base,
        description: "Average lesson completion per course across enrolled students.",
        columns: ["Course", "Enrolled", "Lessons", "Avg completion %", "Completed course"],
        moneyColumns: [],
        rows: courses.map((c) => {
          const lessonIds = new Set((c.modules ?? []).flatMap((m) => (m.lessons ?? []).map((l) => l.id)));
          const enrolled = c.enrolledStudents ?? [];
          const perStudent = enrolled.map((u) => progress.filter((p) => String(p.courseId) === String(c._id) && String(p.userId) === String(u) && lessonIds.has(p.lessonId)).length);
          const avg = enrolled.length && lessonIds.size ? Math.round((perStudent.reduce((n, x) => n + x, 0) / (enrolled.length * lessonIds.size)) * 100) : 0;
          return [c.title, enrolled.length, lessonIds.size, avg, perStudent.filter((x) => lessonIds.size > 0 && x >= lessonIds.size).length];
        }),
        chart: { label: 0, value: 3 },
        summary: [],
      };
    }
    case "test-performance": {
      const [results, tests] = await Promise.all([ResultModel.find().lean(), TestModel.find().select("passMarks").lean()]);
      const pass = new Map(tests.map((t) => [String(t._id), t.passMarks ?? 0]));
      const byBatch = new Map<string, { attempts: number; pctSum: number; passed: number }>();
      for (const r of results) {
        const v = byBatch.get(r.batch) ?? { attempts: 0, pctSum: 0, passed: 0 };
        v.attempts += 1;
        v.pctSum += r.totalMarks > 0 ? r.obtained / r.totalMarks : 0;
        if (r.obtained >= (pass.get(String(r.testId)) ?? 0)) v.passed += 1;
        byBatch.set(r.batch, v);
      }
      return {
        ...base,
        description: "Test results per batch: average score and pass rate.",
        columns: ["Batch", "Attempts", "Average %", "Pass rate %"],
        moneyColumns: [],
        rows: [...byBatch.entries()].map(([b, v]) => [b, v.attempts, Math.round((v.pctSum / v.attempts) * 100), pct(v.passed, v.attempts)]),
        chart: { label: 0, value: 2 },
        summary: [],
      };
    }
    case "lead-funnel": {
      const leads = await LeadModel.find().select("stage").lean();
      const order = ["new", "contacted", "follow_up", "qualified", "converted", "lost"];
      const map = sumBy(leads, (l) => l.stage, () => 1);
      return {
        ...base,
        description: "How many leads sit at each stage of the pipeline.",
        columns: ["Stage", "Leads", "Share %"],
        moneyColumns: [],
        rows: order.map((s) => [s.replace("_", "-"), map.get(s) ?? 0, pct(map.get(s) ?? 0, leads.length)]),
        chart: { label: 0, value: 1 },
        summary: [{ label: "Total leads", value: String(leads.length) }],
      };
    }
    case "lead-sources": {
      const leads = await LeadModel.find().select("source stage").lean();
      const bySource = new Map<string, { total: number; converted: number; lost: number }>();
      for (const l of leads) {
        const v = bySource.get(l.source) ?? { total: 0, converted: 0, lost: 0 };
        v.total += 1;
        if (l.stage === "converted") v.converted += 1;
        if (l.stage === "lost") v.lost += 1;
        bySource.set(l.source, v);
      }
      return {
        ...base,
        description: "Lead volume and conversion rate per source.",
        columns: ["Source", "Leads", "Converted", "Lost", "Conversion %"],
        moneyColumns: [],
        rows: [...bySource.entries()].map(([s, v]) => [s.replace("_", " "), v.total, v.converted, v.lost, pct(v.converted, v.converted + v.lost)]),
        chart: { label: 0, value: 1 },
        summary: [],
      };
    }
    case "counselor-performance": {
      const leads = await LeadModel.find().select("ownerName stage").lean();
      const byOwner = new Map<string, { total: number; open: number; converted: number; lost: number }>();
      for (const l of leads) {
        const v = byOwner.get(l.ownerName || "Unassigned") ?? { total: 0, open: 0, converted: 0, lost: 0 };
        v.total += 1;
        if (l.stage === "converted") v.converted += 1;
        else if (l.stage === "lost") v.lost += 1;
        else v.open += 1;
        byOwner.set(l.ownerName || "Unassigned", v);
      }
      return {
        ...base,
        description: "Leads owned, open, converted and lost per counsellor.",
        columns: ["Counsellor", "Leads", "Open", "Converted", "Lost", "Conversion %"],
        moneyColumns: [],
        rows: [...byOwner.entries()].map(([o, v]) => [o, v.total, v.open, v.converted, v.lost, pct(v.converted, v.converted + v.lost)]),
        chart: { label: 0, value: 3 },
        summary: [],
      };
    }
    case "lost-leads": {
      const leads = await LeadModel.find({ stage: "lost" }).select("name source lostReason ownerName updatedAt").sort({ updatedAt: -1 }).lean();
      return {
        ...base,
        description: "Leads marked lost and the reasons recorded.",
        columns: ["Lead", "Source", "Owner", "Reason"],
        moneyColumns: [],
        rows: leads.map((l) => [l.name, l.source.replace("_", " "), l.ownerName, l.lostReason || "—"]),
        chart: null,
        summary: [{ label: "Lost leads", value: String(leads.length) }],
      };
    }
  }
}

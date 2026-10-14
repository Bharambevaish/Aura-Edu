"use server";

/**
 * Admin/staff dashboard home — every number is aggregated live from the DB.
 * Activity is built from domain events (applications, payments, admissions,
 * submissions) rather than the admin-only audit log, because staff see this
 * page too.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";
import { CourseModel } from "@/lib/models/Course";
import { BatchModel } from "@/lib/models/Batch";
import { PaymentModel } from "@/lib/models/Payment";
import { InvoiceModel } from "@/lib/models/Invoice";
import { LeadModel } from "@/lib/models/Lead";
import { AttendanceModel } from "@/lib/models/Attendance";
import { ResultModel } from "@/lib/models/Result";
import { TestModel } from "@/lib/models/Test";
import { SubmissionModel } from "@/lib/models/Submission";
import { ExpenseModel } from "@/lib/models/Expense";

export type RevenueBar = { label: string; amount: number };

export type ActivityItem = {
  kind: "lead" | "payment" | "student" | "submission";
  text: string;
  name: string;
  at: string;
};

export type AdminOverview = {
  students: { active: number; newThisMonth: number };
  courses: { published: number; total: number; batches: number };
  collections: { thisMonth: number; lastMonth: number; outstanding: number; overdue: number };
  leads: { open: number; conversionRate: number; followUpsDue: number; newThisWeek: number };
  attendancePct: number | null;
  passRate: number | null;
  pendingReviews: number;
  pendingExpenseApprovals: number;
  revenue: { last7Days: RevenueBar[]; last6Months: RevenueBar[] };
  activity: ActivityItem[];
};

const DAY = 24 * 60 * 60 * 1000;

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysStart = new Date(todayStart.getTime() - 6 * DAY);
  const endOfToday = new Date(todayStart.getTime() + DAY - 1);

  const [
    activeStudents,
    newStudents,
    publishedCourses,
    totalCourses,
    batches,
    payments,
    invoices,
    leads,
    attendance,
    results,
    tests,
    pendingReviews,
    pendingExpenses,
    recentStudents,
    recentSubmissions,
  ] = await Promise.all([
    UserModel.countDocuments({ role: "student", status: "Active" }),
    // Admission date when known (seeded/imported students), else account creation.
    UserModel.countDocuments({
      role: "student",
      $or: [
        { admissionDate: { $gte: monthStart } },
        { admissionDate: { $exists: false }, createdAt: { $gte: monthStart } },
      ],
    }),
    CourseModel.countDocuments({ published: true }),
    CourseModel.countDocuments(),
    BatchModel.countDocuments(),
    PaymentModel.find({ status: "success", recordedAt: { $gte: sixMonthsStart } })
      .select("amount recordedAt studentId")
      .sort({ recordedAt: -1 })
      .lean(),
    InvoiceModel.find().select("total paid waived dueDate").lean(),
    LeadModel.find().select("name stage source nextFollowUpAt createdAt").sort({ createdAt: -1 }).lean(),
    AttendanceModel.find({ date: { $gte: new Date(now.getTime() - 30 * DAY) } }).select("entries.status").lean(),
    ResultModel.find().select("testId obtained").lean(),
    TestModel.find().select("passMarks").lean(),
    SubmissionModel.countDocuments({ status: "pending_review" }),
    ExpenseModel.countDocuments({ status: "pending" }),
    UserModel.find({ role: "student" }).select("name batch admissionDate createdAt").sort({ admissionDate: -1, createdAt: -1 }).limit(4).lean(),
    SubmissionModel.find().select("studentName submittedAt").sort({ submittedAt: -1 }).limit(4).lean(),
  ]);

  // Collections
  let thisMonth = 0;
  let lastMonth = 0;
  const daily = new Map<string, number>();
  const monthly = new Map<string, number>();
  for (const p of payments) {
    const d = new Date(p.recordedAt);
    if (d >= monthStart) thisMonth += p.amount;
    else if (d >= lastMonthStart) lastMonth += p.amount;
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    monthly.set(monthKey, (monthly.get(monthKey) ?? 0) + p.amount);
    if (d >= sevenDaysStart) {
      const dayKey = d.toDateString();
      daily.set(dayKey, (daily.get(dayKey) ?? 0) + p.amount);
    }
  }
  let outstanding = 0;
  let overdue = 0;
  for (const inv of invoices) {
    const balance = Math.max(0, inv.total - inv.paid - inv.waived);
    outstanding += balance;
    if (balance > 0 && new Date(inv.dueDate) < now) overdue += balance;
  }

  const last7Days: RevenueBar[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysStart.getTime() + i * DAY);
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), amount: daily.get(d.toDateString()) ?? 0 };
  });
  const last6Months: RevenueBar[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: d.toLocaleDateString("en-IN", { month: "short" }), amount: monthly.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0 };
  });

  // Leads
  let open = 0;
  let converted = 0;
  let lost = 0;
  let followUpsDue = 0;
  let newThisWeek = 0;
  for (const l of leads) {
    if (l.stage === "converted") converted += 1;
    else if (l.stage === "lost") lost += 1;
    else {
      open += 1;
      if (l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= endOfToday) followUpsDue += 1;
    }
    if (new Date(l.createdAt) >= sevenDaysStart) newThisWeek += 1;
  }

  // Attendance (last 30 days): late counts as attended.
  let marked = 0;
  let attended = 0;
  for (const reg of attendance) {
    for (const e of reg.entries ?? []) {
      marked += 1;
      if (e.status !== "absent") attended += 1;
    }
  }

  // Test pass rate against each test's pass mark.
  const passMarks = new Map(tests.map((t) => [String(t._id), t.passMarks ?? 0]));
  const scored = results.filter((r) => passMarks.has(String(r.testId)));
  const passed = scored.filter((r) => r.obtained >= (passMarks.get(String(r.testId)) ?? 0)).length;

  // Activity feed (newest first).
  const studentNames = new Map(
    (await UserModel.find({ _id: { $in: payments.slice(0, 4).map((p) => p.studentId) } }).select("name").lean()).map((u) => [
      String(u._id),
      u.name,
    ]),
  );
  const activity: ActivityItem[] = [
    ...leads.slice(0, 4).map((l) => ({
      kind: "lead" as const,
      text: l.source === "web_register" ? "Online admission received" : "New lead added",
      name: l.name,
      at: new Date(l.createdAt).toISOString(),
    })),
    ...payments.slice(0, 4).map((p) => ({
      kind: "payment" as const,
      text: `Fee payment received · ₹${p.amount.toLocaleString("en-IN")}`,
      name: studentNames.get(String(p.studentId)) ?? "Student",
      at: new Date(p.recordedAt).toISOString(),
    })),
    ...recentStudents.map((s) => ({
      kind: "student" as const,
      text: "Student admitted",
      name: `${s.name}${s.batch ? ` (${s.batch})` : ""}`,
      at: new Date(s.admissionDate ?? s.createdAt).toISOString(),
    })),
    ...recentSubmissions.map((s) => ({
      kind: "submission" as const,
      text: "Assignment submitted",
      name: s.studentName,
      at: new Date(s.submittedAt).toISOString(),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return {
    students: { active: activeStudents, newThisMonth: newStudents },
    courses: { published: publishedCourses, total: totalCourses, batches },
    collections: { thisMonth, lastMonth, outstanding, overdue },
    leads: {
      open,
      conversionRate: converted + lost > 0 ? Math.round((converted / (converted + lost)) * 100) : 0,
      followUpsDue,
      newThisWeek,
    },
    attendancePct: marked > 0 ? Math.round((attended / marked) * 100) : null,
    passRate: scored.length > 0 ? Math.round((passed / scored.length) * 100) : null,
    pendingReviews,
    pendingExpenseApprovals: pendingExpenses,
    revenue: { last7Days, last6Months },
    activity,
  };
}

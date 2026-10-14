/**
 * Report catalogue (client-safe). Each key is computed by runReport() in
 * lib/actions/reports.ts and rendered by /admin-dashboard/reports/[report].
 */
export type ReportKey =
  | "collections-by-month"
  | "collections-by-mode"
  | "collections-by-branch"
  | "gst-collected"
  | "fee-defaulters"
  | "expected-vs-collected"
  | "waivers"
  | "refunds"
  | "expense-breakdown"
  | "vendor-payments"
  | "payroll-summary"
  | "admissions-by-month"
  | "batch-attendance"
  | "course-completion"
  | "test-performance"
  | "lead-funnel"
  | "lead-sources"
  | "counselor-performance"
  | "lost-leads";

export type ReportCategory = {
  title: string;
  description: string;
  tone: string;
  reports: { key: ReportKey; title: string; adminOnly?: boolean }[];
};

export const REPORT_CATEGORIES: ReportCategory[] = [
  {
    title: "Revenue",
    description: "Fee collections over time, by payment mode and branch.",
    tone: "emerald",
    reports: [
      { key: "collections-by-month", title: "Collections by Month" },
      { key: "collections-by-mode", title: "Collections by Payment Mode" },
      { key: "collections-by-branch", title: "Branch-wise Collections" },
      { key: "gst-collected", title: "GST Collected" },
    ],
  },
  {
    title: "Receivables",
    description: "Outstanding fees, overdue students, waivers and refunds.",
    tone: "blue",
    reports: [
      { key: "fee-defaulters", title: "Fee Defaulters" },
      { key: "expected-vs-collected", title: "Expected vs Collected by Course" },
      { key: "waivers", title: "Scholarships & Waivers" },
      { key: "refunds", title: "Refund Analysis" },
    ],
  },
  {
    title: "Expenses & Payroll",
    description: "Operational costs by category and vendor, and this month's payroll.",
    tone: "red",
    reports: [
      { key: "expense-breakdown", title: "Expense Breakdown", adminOnly: true },
      { key: "vendor-payments", title: "Vendor Payments", adminOnly: true },
      { key: "payroll-summary", title: "Payroll Summary", adminOnly: true },
    ],
  },
  {
    title: "Students & Courses",
    description: "Admissions, attendance, course completion and test results.",
    tone: "purple",
    reports: [
      { key: "admissions-by-month", title: "Admission Trends" },
      { key: "batch-attendance", title: "Batch-wise Attendance" },
      { key: "course-completion", title: "Course Completion" },
      { key: "test-performance", title: "Test Performance by Batch" },
    ],
  },
  {
    title: "Leads",
    description: "Pipeline health, source quality and counsellor performance.",
    tone: "orange",
    reports: [
      { key: "lead-funnel", title: "Lead Funnel" },
      { key: "lead-sources", title: "Source-wise Conversion" },
      { key: "counselor-performance", title: "Counsellor Performance" },
      { key: "lost-leads", title: "Lost Lead Analysis" },
    ],
  },
];

export const REPORTS = REPORT_CATEGORIES.flatMap((c) => c.reports.map((r) => ({ ...r, category: c.title })));
export const reportMeta = (key: string) => REPORTS.find((r) => r.key === key);

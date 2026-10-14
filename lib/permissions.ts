/**
 * Role → admin-dashboard access map (single source of truth).
 *
 * Admin and staff share /admin-dashboard. Staff run day-to-day academics and
 * front-desk finance; the routes below are admin-only. This file is pure
 * (no server imports) so the client sidebar can filter links with it, while
 * the real enforcement is server-side: each admin-only section has a
 * layout.tsx calling `requireAdminPage()` (lib/dal.ts), and the server actions
 * behind those screens call `requireRole(["admin"])`.
 */
import type { Role } from "@/lib/models/User";

export const ADMIN_ONLY_ROUTES = [
  "/admin-dashboard/lms/students/logins", // block / force-logout accounts
  "/admin-dashboard/finance/expense-approvals", // approve / reject spend
  "/admin-dashboard/finance/audit-trail", // full finance audit log
  "/admin-dashboard/administration", // staff roster, master data
  "/admin-dashboard/settings", // institute, tax, invoice, permissions, branches
] as const;

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function canAccessPath(role: Role, pathname: string): boolean {
  if (role === "admin") return true;
  if (role === "staff") return !isAdminOnlyPath(pathname);
  return false;
}

/**
 * Human-readable summary of what each role can do — shown on Settings →
 * Permissions. Keep in sync with the requireRole() checks in lib/actions.
 */
export type Access = "full" | "partial" | "none";

export const PERMISSION_MATRIX: { area: string; admin: Access; staff: Access; note: string }[] = [
  { area: "Dashboard, My Account, Leave requests", admin: "full", staff: "full", note: "Everyone manages their own account and leave." },
  { area: "Student Corner", admin: "full", staff: "partial", note: "Staff add, edit, import and assign; only admins delete students or reissue passwords." },
  { area: "Student Logins (block, sign out)", admin: "full", staff: "none", note: "Account security actions are admin-only." },
  { area: "Leads & Online Admissions", admin: "full", staff: "full", note: "Follow up and convert leads into students." },
  { area: "Batches, Attendance, Assignments", admin: "full", staff: "full", note: "" },
  { area: "Courses", admin: "full", staff: "partial", note: "Staff edit content and store settings; only admins delete a course." },
  { area: "Tests", admin: "partial", staff: "full", note: "Both create tests and see reports; written answers are graded by staff only." },
  { area: "Timetable & schedules", admin: "full", staff: "full", note: "" },
  { area: "Task Manager", admin: "full", staff: "partial", note: "Staff delete only tasks they created or are assigned." },
  { area: "Finance — payments, invoices, expenses, refund/waiver requests", admin: "full", staff: "partial", note: "Staff record and request; admins approve, reject, void, delete and process." },
  { area: "Finance — Expense Approvals, Audit Trail", admin: "full", staff: "none", note: "" },
  { area: "Communications", admin: "full", staff: "partial", note: "Staff send broadcasts and schedule; only admins delete notices, meetings and events." },
  { area: "Reports", admin: "full", staff: "partial", note: "Expense and payroll reports are admin-only." },
  { area: "Leave approvals, Payroll, Staff Corner", admin: "full", staff: "none", note: "" },
  { area: "Settings, Master Data, Branches", admin: "full", staff: "none", note: "" },
  { area: "Reset demo data", admin: "full", staff: "none", note: "" },
];

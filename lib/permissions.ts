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

import React from "react";
import AdminShell from "@/components/admin/shell/AdminShell";
import { requireRole } from "@/lib/dal";

/**
 * Admin layout gate: every /admin-dashboard route passes
 * `requireRole(["admin", "staff"])` server-side before a single byte renders.
 * The proxy.ts edge gate already bounced logged-out visitors; this is the
 * authoritative enforcement (plus the role-aware DB check per data action).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRole(["admin", "staff"]);
  return <AdminShell user={user}>{children}</AdminShell>;
}
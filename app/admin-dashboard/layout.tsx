import React from "react";
import AdminShell from "@/components/admin/shell/AdminShell";
import { requireRole } from "@/lib/dal";
import ForcePasswordChange from "@/components/auth/ForcePasswordChange";
import { getBranchScope } from "@/lib/branch-scope";
import { getActiveBranchNames } from "@/lib/actions/branches";
import { isDemoMode } from "@/lib/demo-mode";

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
  // Admin-issued password still in use (new or reset staff account).
  if (user.mustChangePassword) {
    return <ForcePasswordChange name={user.name} />;
  }
  const [scope, branches] = await Promise.all([getBranchScope(), getActiveBranchNames()]);
  return (
    <AdminShell user={user} branch={{ current: scope.branch, branches }} demoMode={isDemoMode()}>
      {children}
    </AdminShell>
  );
}
import React from "react";
import { StudentProvider } from "@/context/StudentContext";
import StudentShell from "@/components/student/StudentShell";
import { requireRole } from "@/lib/dal";
import { getMyProfile } from "@/lib/actions/student-portal";
import { getMyFees } from "@/lib/actions/finance";
import ForcePasswordChange from "@/components/student/ForcePasswordChange";

/**
 * Student layout gate: every /student-portal route requires a signed-in
 * student session (requireRole), then loads that student's own profile and
 * fee balance from the DB and hands them to the client context. Pages call
 * `router.refresh()` after a mutation so this layout re-reads fresh values.
 */
export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRole(["student"]);
  // Admin-issued password still in use: nothing else renders until it's changed.
  if (user.mustChangePassword) {
    return <ForcePasswordChange name={user.name} />;
  }
  const [profile, fees] = await Promise.all([getMyProfile(), getMyFees()]);
  return (
    <StudentProvider profile={profile} pendingFee={fees.outstanding}>
      <StudentShell>{children}</StudentShell>
    </StudentProvider>
  );
}

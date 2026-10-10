import React from "react";
import { StudentProvider } from "@/context/StudentContext";
import StudentShell from "@/components/student/StudentShell";
import { requireRole } from "@/lib/dal";

/**
 * Student layout gate: every /student-portal route requires a signed-in
 * student session (requireRole) and then provides the demo-profile context
 * to the whole portal (see context/StudentContext.tsx for the POC scope note).
 */
export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["student"]);
  return (
    <StudentProvider>
      <StudentShell>{children}</StudentShell>
    </StudentProvider>
  );
}
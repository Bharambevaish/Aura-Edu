"use client";

/**
 * Student portal client state — all of it real, signed-in-student data.
 *
 * `profile`, `pendingFee` and `notifications` are loaded server-side by
 * app/student-portal/layout.tsx (getMyProfile / getMyFees /
 * getStudentNotifications) and passed in as props. After a mutation that
 * changes them (payment, profile edit, marking notifications read) call
 * `router.refresh()` so the layout re-reads them. Everything else (courses,
 * tests, assignments, attendance, certificates, schedule) is fetched per page
 * from server actions.
 */
import React, { createContext, useContext } from "react";
import type { MyProfile } from "@/lib/actions/student-portal";
import type { StudentNotification } from "@/lib/actions/assignments";

export type StudentProfile = MyProfile;
export type NotificationItem = StudentNotification;

interface StudentContextType {
  profile: StudentProfile;
  /** Outstanding fee balance across the student's invoices (live). */
  pendingFee: number;
  /** Most recent notifications (newest first) for the bell and sidebar badge. */
  notifications: NotificationItem[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({
  children,
  profile,
  pendingFee,
  notifications,
}: {
  children: React.ReactNode;
  profile: StudentProfile;
  pendingFee: number;
  notifications: NotificationItem[];
}) {
  return (
    <StudentContext.Provider value={{ profile, pendingFee, notifications }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}

"use server";

/**
 * Student dashboard: every widget's data in ONE server action.
 *
 * Next.js runs server actions called from the browser one at a time, so the
 * dashboard's five separate calls used to queue up, each paying its own
 * access check and database round trips. Here the five loaders run in
 * parallel on the server and the browser makes a single request.
 *
 * Each source still fails soft: an error leaves that widget empty (null)
 * instead of blanking the whole dashboard.
 */
import { requireRole } from "@/lib/dal";
import { getStudentAssignments, type StudentAssignmentRow } from "@/lib/actions/assignments";
import { getStudentAttendance, type StudentAttendance } from "@/lib/actions/attendance";
import { getMyCourses, getMyCertificates, type MyCourse } from "@/lib/actions/student-portal";
import { getStudentTests, type TestCardDTO } from "@/lib/actions/tests/student-tests";

export interface StudentDashboardData {
  courses: MyCourse[] | null;
  assignments: StudentAssignmentRow[] | null;
  attendance: StudentAttendance | null;
  tests: TestCardDTO[] | null;
  certificateCount: number | null;
}

const soft = <T,>(p: Promise<T>): Promise<T | null> => p.catch(() => null);

export async function getStudentDashboard(): Promise<StudentDashboardData> {
  // Gate once up front; the loaders below re-check, which is cached per request.
  await requireRole(["student"]);
  const [courses, assignments, attendance, tests, certificates] = await Promise.all([
    soft(getMyCourses()),
    soft(getStudentAssignments()),
    soft(getStudentAttendance()),
    soft(getStudentTests()),
    soft(getMyCertificates()),
  ]);
  return { courses, assignments, attendance, tests, certificateCount: certificates ? certificates.length : null };
}

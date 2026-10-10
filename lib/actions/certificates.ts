"use server";

/**
 * Certificates module — stateless PDF preview/generation.
 *
 * There is intentionally NO persistent certificate collection: the demo
 * generates a printable A4 certificate on the fly from the form, and the
 * "Download PDF" action is just opening the `/certificates/render` route (a
 * chrome-free sheet that print-to-PDFs itself). Nothing is written to the
 * database, so there is nothing stored "for the student to download later" —
 * exactly like a real demo flyer.
 *
 * The only DB touches are reads: the generate form needs the live student list
 * (and the courses those students are on) so the dropdowns match reality.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";

export type { CertificateTemplate } from "@/lib/certificates";

export type CertificateOptionStudent = {
  id: string;
  name: string;
  admissionNo: string;
  batch: string;
  course: string;
};

export type CertificateOptions = {
  students: CertificateOptionStudent[];
  courses: { name: string; studentCount: number }[];
};

/** Admin/staff: everything the generate form needs — live students + their courses. */
export async function getCertificateOptions(): Promise<CertificateOptions> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const students = await UserModel.find({ role: "student" })
    .select("name admissionNo batch course")
    .sort({ name: 1 })
    .lean();

  const courseMap = new Map<string, number>();
  for (const s of students) {
    if (s.course?.trim()) courseMap.set(s.course, (courseMap.get(s.course) ?? 0) + 1);
  }

  return {
    students: students.map((s) => ({
      id: String(s._id),
      name: s.name,
      admissionNo: s.admissionNo ?? "",
      batch: s.batch ?? "",
      course: s.course ?? "",
    })),
    courses: [...courseMap.entries()]
      .map(([name, studentCount]) => ({ name, studentCount }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
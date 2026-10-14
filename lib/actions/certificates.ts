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
 * Links are signed server-side (lib/certificate-signing.ts) so the print route
 * and the public /verify page can tell a genuine certificate from an edited URL.
 */

import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { signedCertificateQuery } from "@/lib/certificate-signing";
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
/**
 * Admin/staff: issue a signed certificate link for a student. The name and
 * batch come from the student record (not the browser), the credential id is
 * generated here, and the issue is audit-logged.
 */
export async function issueCertificateLink(input: {
  studentId: string;
  course: string;
  template: string;
  date: string;
}): Promise<{ ok: boolean; message: string; url?: string; credential?: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const course = String(input?.course ?? "").trim();
  const date = String(input?.date ?? "").trim();
  if (!mongoose.isValidObjectId(input?.studentId)) return { ok: false, message: "Pick a student." };
  if (!course || course.length > 120) return { ok: false, message: "Enter the course name." };
  if (!date || date.length > 60) return { ok: false, message: "Pick the issue date." };

  await connectDB();
  const student = await UserModel.findOne({ _id: input.studentId, role: "student" }).select("name batch").lean();
  if (!student) return { ok: false, message: "Student not found." };

  const credential = `AURA-AD-${randomBytes(4).toString("hex").toUpperCase()}`;
  const query = signedCertificateQuery({
    student: student.name,
    course,
    batch: student.batch ?? "",
    template: String(input.template ?? ""),
    date,
    credential,
  });
  await writeAudit(user, "issued certificate", `${credential} — ${student.name} · ${course}`);
  return { ok: true, message: "Certificate issued.", url: `/certificates/render?${query}`, credential };
}

"use server";

/**
 * Data-subject tools for one student (DPDP Act 2023: access and erasure),
 * on the Student Corner profile. Admin-only, enforced here.
 *
 *   exportStudentData  - everything held about the student, as JSON
 *   eraseStudentData   - anonymise personal data, keep fee/tax amounts,
 *                        block sign-in and end every session
 *
 * Both are audit-logged.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { endAllSessions } from "@/lib/session-registry";
import { anonymisedLeadFields, anonymisedUserFields, erasedLabel, PRIVACY_NOTICE_VERSION } from "@/lib/privacy";
import { UserModel } from "@/lib/models/User";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { RefundModel } from "@/lib/models/Refund";
import { WaiverModel } from "@/lib/models/Waiver";
import { AttendanceModel } from "@/lib/models/Attendance";
import { ResultModel } from "@/lib/models/Result";
import { AttemptModel } from "@/lib/models/Attempt";
import { SubmissionModel } from "@/lib/models/Submission";
import { LessonProgressModel } from "@/lib/models/LessonProgress";
import { DoubtModel } from "@/lib/models/Doubt";
import { ChatMessageModel } from "@/lib/models/ChatMessage";
import { LeadModel } from "@/lib/models/Lead";
import { FormSubmissionModel } from "@/lib/models/FormSubmission";
import { SessionModel } from "@/lib/models/Session";

export type PrivacyOutcome = { ok: boolean; message: string };
export type ExportOutcome = PrivacyOutcome & { filename?: string; json?: string };

async function findStudent(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const student = await UserModel.findById(id).lean();
  return student && student.role === "student" ? student : null;
}

/** Leads that became this student, or were made with their email. */
function leadFilter(studentId: mongoose.Types.ObjectId, email: string) {
  return { $or: [{ convertedStudentId: studentId }, ...(email ? [{ email }] : [])] };
}

/**
 * Everything held about one student as pretty-printed JSON: profile (no
 * password hash), fees, attendance, tests, assignments, doubts, sign-ins and
 * the admission leads / form responses they came from.
 */
export async function exportStudentData(id: string): Promise<ExportOutcome> {
  const { user } = await requireRole(["admin"]);
  const student = await findStudent(id);
  if (!student) return { ok: false, message: "Student not found." };

  const sid = student._id as mongoose.Types.ObjectId;
  const leads = await LeadModel.find(leadFilter(sid, student.email)).lean();
  const [invoices, payments, refunds, waivers, attendance, results, attempts, submissions, progress, doubts, formSubmissions, sessions] =
    await Promise.all([
      InvoiceModel.find({ studentId: sid }).lean(),
      PaymentModel.find({ studentId: sid }).lean(),
      RefundModel.find({ studentId: sid }).lean(),
      WaiverModel.find({ studentId: sid }).lean(),
      AttendanceModel.find({ "entries.studentId": sid }).sort({ date: 1 }).lean(),
      ResultModel.find({ userId: sid }).lean(),
      AttemptModel.find({ userId: sid }).lean(),
      SubmissionModel.find({ userId: sid }).lean(),
      LessonProgressModel.find({ userId: sid }).lean(),
      DoubtModel.find({ studentId: sid }).lean(),
      FormSubmissionModel.find({ leadId: { $in: leads.map((l) => l._id) } }).lean(),
      SessionModel.find({ userId: sid }).select("-_id startedAt lastSeenAt expiresAt active device ip").lean(),
    ]);

  // Security internals, not personal data the student gave us.
  const { passwordHash, failedAttempts, lockoutUntil, ...profile } = student;
  void passwordHash;
  void failedAttempts;
  void lockoutUntil;

  const data = {
    exportedAt: new Date().toISOString(),
    exportedBy: user.name,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    profile,
    invoices,
    payments,
    refunds,
    waivers,
    // Only this student's own mark from each daily register.
    attendance: attendance.map((a) => {
      const mine = a.entries.find((e) => String(e.studentId) === String(sid));
      return { date: a.date, batch: a.batch, subject: a.subject, status: mine?.status, checkIn: mine?.checkIn, remark: mine?.remark };
    }),
    results,
    testAttempts: attempts,
    assignmentSubmissions: submissions,
    lessonProgress: progress,
    doubts,
    leads,
    formSubmissions,
    signIns: sessions,
  };

  await writeAudit(user, "exported student data", `${student.name} (${student.admissionNo ?? id})`);
  const slug = (student.admissionNo || id).replace(/[^A-Za-z0-9_-]/g, "_");
  return { ok: true, message: "Export ready.", filename: `student-data-${slug}.json`, json: JSON.stringify(data, null, 2) };
}

/**
 * Erase a student's personal data. Anonymises rather than deletes: invoices,
 * payments, refunds and waivers stay (amounts are needed for fee/tax records)
 * but now point at "Erased student #<id>". The account is blocked, its
 * password voided and every session ended. `confirmName` must equal the
 * student's current name.
 */
export async function eraseStudentData(id: string, confirmName: unknown): Promise<PrivacyOutcome> {
  const { user } = await requireRole(["admin"]);
  const student = await findStudent(id);
  if (!student) return { ok: false, message: "Student not found." };
  if (student.erasedAt) return { ok: false, message: "This student's data was already erased." };
  if (typeof confirmName !== "string" || confirmName.trim() !== student.name.trim()) {
    return { ok: false, message: "Type the student's name exactly to confirm." };
  }

  const sid = student._id as mongoose.Types.ObjectId;
  const label = erasedLabel(id);
  const now = new Date();
  const leads = await LeadModel.find(leadFilter(sid, student.email)).select("_id").lean();
  const leadIds = leads.map((l) => l._id);

  // Block first so the account is unusable even if a later step fails.
  await UserModel.updateOne({ _id: sid }, anonymisedUserFields(student, now));
  const sessionsEnded = await endAllSessions(id);

  await Promise.all([
    AttemptModel.updateMany({ userId: sid }, { $set: { studentName: label } }),
    SubmissionModel.updateMany({ userId: sid }, { $set: { studentName: label } }),
    DoubtModel.updateMany({ studentId: sid }, { $set: { studentName: label } }),
    DoubtModel.updateMany({ "replies.authorId": sid }, { $set: { "replies.$[m].authorName": label } }, { arrayFilters: [{ "m.authorId": sid }] }),
    ChatMessageModel.updateMany({ senderId: sid }, { $set: { senderName: label } }),
    LeadModel.updateMany({ _id: { $in: leadIds } }, anonymisedLeadFields(id)),
    FormSubmissionModel.updateMany(
      { leadId: { $in: leadIds } },
      { $set: { name: label, email: "", phone: "", "answers.$[].value": "" } },
    ),
    // Sign-in history holds IPs and devices; nothing to keep.
    SessionModel.deleteMany({ userId: sid }),
  ]);

  // The audit entry must not repeat the erased name.
  await writeAudit(user, "erased student personal data", `${label} (${student.admissionNo ?? "no admission no"}; ${sessionsEnded} session(s) ended)`);
  return { ok: true, message: "Personal data erased. Fee records are kept without the student's name." };
}

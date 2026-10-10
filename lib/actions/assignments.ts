"use server";

/**
 * Assignments module (online worksheets + reminder notifications).
 *
 *  ADMIN/STAFF
 *    getAssignmentsOverview - list + headline stats (real counts)
 *    createAssignment       - persist a worksheet + push a reminder
 *                             Notification to every student in the batch
 *    getAssignmentDetail    - one worksheet + its submissions (for grading)
 *    reviewSubmission       - award marks + verdict + note
 *
 *  STUDENT
 *    getStudentAssignments   - this student's worksheets + status
 *    getAssignmentWorksheet  - safe worksheet read (or own answers if submitted)
 *    submitAssignment        - save answers, status = pending_review
 *    getStudentNotifications - the Notifications Hub feed
 *    markNotificationRead / markAllNotificationsRead
 *
 * Mirrors the Test Management pattern: everything is computed at request time
 * from live MongoDB docs; nothing is hardcoded on the client.
 */

import { connectDB } from "@/lib/db";
import { requireRole, getSession } from "@/lib/dal";
import { Types } from "mongoose";
import { AssignmentModel } from "@/lib/models/Assignment";
import { SubmissionModel } from "@/lib/models/Submission";
import { NotificationModel } from "@/lib/models/Notification";
import { UserModel } from "@/lib/models/User";
import { CreateAssignmentSchema, SubmitAssignmentSchema, ReviewSubmissionSchema } from "@/lib/validation";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/services/tests";

const DEADLINE_HINT_MS = 48 * 60 * 60 * 1000;

export type AssignmentStatus = "active" | "due_soon" | "overdue";

function assignmentStatus(dueDate: Date, now = new Date()): AssignmentStatus {
  if (now >= dueDate) return "overdue";
  return dueDate.getTime() - now.getTime() <= DEADLINE_HINT_MS ? "due_soon" : "active";
}

export type AdminAssignmentRow = {
  id: string;
  title: string;
  subject: string;
  course: string;
  batch: string;
  totalMarks: number;
  dueDate: string;
  questionsCount: number;
  submitted: number;
  pendingReview: number;
  reviewed: number;
  status: AssignmentStatus;
};

export type AssignmentsOverview = {
  stats: {
    total: number;
    active: number;
    dueSoon: number;
    overdue: number;
    submitted: number;
    pendingReview: number;
    reviewed: number;
  };
  assignments: AdminAssignmentRow[];
};

/** Admin/staff: worksheet list + headline stats, real counts from the DB. */
export async function getAssignmentsOverview(): Promise<AssignmentsOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const [assignments, submissions] = await Promise.all([
    AssignmentModel.find().sort({ dueDate: -1 }).lean(),
    SubmissionModel.find().lean(),
  ]);

  const now = new Date();
  const stats = { total: assignments.length, active: 0, dueSoon: 0, overdue: 0, submitted: submissions.length, pendingReview: 0, reviewed: 0 };

  const rows: AdminAssignmentRow[] = assignments.map((a) => {
    const status = assignmentStatus(a.dueDate, now);
    if (status === "due_soon") stats.dueSoon++;
    else if (status === "overdue") stats.overdue++;
    else stats.active++;

    const subs = submissions.filter((s) => String(s.assignmentId) === String(a._id));
    const pendingReview = subs.filter((s) => s.status === "pending_review").length;
    const reviewed = subs.length - pendingReview;
    stats.pendingReview += pendingReview;
    stats.reviewed += reviewed;

    return {
      id: String(a._id),
      title: a.title,
      subject: a.subject,
      course: a.course,
      batch: a.batch,
      totalMarks: a.totalMarks,
      dueDate: fmtDate(a.dueDate),
      questionsCount: a.questions.length,
      submitted: subs.length,
      pendingReview,
      reviewed,
      status,
    };
  });

  return { stats, assignments: rows };
}

/** Admin/staff: complete worksheet + every student's submission for grading. */
export async function getAssignmentDetail(assignmentId: string) {
  await requireRole(["admin", "staff"]);
  await connectDB();

  if (!Types.ObjectId.isValid(assignmentId)) return null;
  const assignment = await AssignmentModel.findById(assignmentId).lean();
  if (!assignment) return null;

  const [subs, students] = await Promise.all([
    SubmissionModel.find({ assignmentId: assignment._id }).sort({ submittedAt: 1 }).lean(),
    UserModel.find({ role: "student", batch: assignment.batch }).select("name email admissionNo").lean(),
  ]);

  const submissions = subs.map((s) => ({
    id: String(s._id),
    studentName: s.studentName,
    submittedAt: fmtDateTime(s.submittedAt),
    status: s.status,
    marks: s.marks,
    verdict: s.verdict,
    note: s.note,
    answers: s.answers,
  }));

  const notSubmitted = students
    .filter((st) => !subs.some((s) => String(s.userId) === String(st._id)))
    .map((st) => ({ id: String(st._id), studentName: st.name, email: st.email, submitted: false }));

return {
      assignment: {
        id: String(assignment._id),
        title: assignment.title,
        subject: assignment.subject,
        course: assignment.course,
        batch: assignment.batch,
        description: assignment.description,
        totalMarks: assignment.totalMarks,
        dueDate: fmtDateTime(assignment.dueDate),
        status: assignmentStatus(assignment.dueDate),
        questions: assignment.questions.map((q) => ({ text: q.text, marks: q.marks })),
      },
      submissions,
      notSubmitted,
    };
}

export type CreateAssignmentOutcome = { ok: true; id: string; title: string } | { ok: false; message: string };

/**
 * Admin/staff: persist a worksheet (total = sum of question marks) and push
 * an unread reminder Notification to every student in the targeted batch —
 * that Notification is what the student Hub surfaces as the assignment alert.
 */
export async function createAssignment(input: {
  title: string;
  subject: string;
  course: string;
  batch: string;
  description?: string;
  dueDate: string;
  questions: { text: string; marks: number }[];
}): Promise<CreateAssignmentOutcome> {
  await requireRole(["admin", "staff"]);

  const parsed = CreateAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Invalid assignment data." };
  }

  const due = new Date(parsed.data.dueDate);
  if (Number.isNaN(due.getTime())) {
    return { ok: false, message: "Pick a valid due date and time." };
  }

  await connectDB();
  const session = await getSession();
  const createdBy = session?.user?.id ?? new Types.ObjectId();
  const totalMarks = parsed.data.questions.reduce((sum, q) => sum + q.marks, 0);

  const assignment = await AssignmentModel.create({
    title: parsed.data.title,
    subject: parsed.data.subject,
    course: parsed.data.course,
    batch: parsed.data.batch,
    description: parsed.data.description || "",
    totalMarks,
    dueDate: due,
    questions: parsed.data.questions.map((q) => ({ text: q.text, marks: q.marks })),
    createdBy,
  });

  const students = await UserModel.find({ role: "student", batch: parsed.data.batch, status: "Active" })
    .select("_id")
    .lean();
  if (students.length > 0) {
    const deadline = fmtDateTime(due);
    const reminder = students.map((s) => ({
      userId: s._id,
      title: `New Assignment: ${parsed.data.title}`,
      message: `Worksheet "${parsed.data.title}" is live for ${parsed.data.batch}. Submission deadline: ${deadline}. Solve it and submit from the Assignments tab.`,
      category: "Assignments",
      sender: "Academic Cell",
      important: false,
      read: false,
      link: `/student-portal/assignments/${String(assignment._id)}`,
    }));
    await NotificationModel.insertMany(reminder);
  }

  return { ok: true, id: String(assignment._id), title: parsed.data.title };
}

export type ReviewOutcome = { ok: true } | { ok: false; message: string };

/** Admin/staff: mark a submission reviewed with marks + verdict + short note. */
export async function reviewSubmission(
  submissionId: string,
  input: { marks: number; verdict: "complete" | "needs_work"; note?: string },
): Promise<ReviewOutcome> {
  await requireRole(["admin", "staff"]);

  const validated = ReviewSubmissionSchema.safeParse({ submissionId, ...input });
  if (!validated.success) {
    const issue = validated.error.issues[0];
    return { ok: false, message: issue?.message ?? "Invalid review." };
  }

  await connectDB();
  const session = await getSession();
  const submission = await SubmissionModel.findById(validated.data.submissionId).lean();
  if (!submission) return { ok: false, message: "Submission not found." };

  await SubmissionModel.updateOne(
    { _id: submission._id },
    {
      $set: {
        status: "reviewed",
        marks: validated.data.marks,
        verdict: validated.data.verdict,
        note: validated.data.note?.trim() ?? "",
        reviewedBy: session?.user?.id ?? null,
        reviewedAt: new Date(),
      },
    },
  );

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Student side                                                         */
/* ------------------------------------------------------------------ */

export type StudentAssignmentStatus = "Pending" | "Overdue" | "Submitted" | "Reviewed";

/** The JWT cookie has no batch; the DB row does — fetch it for batch scoping. */
async function getStudentBatch(userId: string): Promise<string | null> {
  await connectDB();
  const u = await UserModel.findById(userId).select("batch").lean();
  return u?.batch ?? null;
}

export type StudentAssignmentRow = {
  id: string;
  title: string;
  subject: string;
  course: string;
  batch: string;
  dueDate: string;
  totalMarks: number;
  questionsCount: number;
  status: StudentAssignmentStatus;
  obtainedMarks: number | null;
  verdict: "complete" | "needs_work" | null;
  note: string;
  submittedAt: string | null;
};

/** Student: their batch's worksheets with per-student status from live data. */
export async function getStudentAssignments(): Promise<StudentAssignmentRow[]> {
  const { user } = await requireRole(["student"]);
  const batch = await getStudentBatch(user.id);
  if (!batch) return [];
  await connectDB();

  const [assignments, submissions] = await Promise.all([
    AssignmentModel.find({ batch }).sort({ dueDate: 1 }).lean(),
    SubmissionModel.find({ userId: user.id }).lean(),
  ]);

  const now = new Date();
  return assignments.map((a) => {
    const sub = submissions.find((s) => String(s.assignmentId) === String(a._id));
    let status: StudentAssignmentStatus = now > a.dueDate ? "Overdue" : "Pending";
    if (sub) status = sub.status === "reviewed" ? "Reviewed" : "Submitted";

    return {
      id: String(a._id),
      title: a.title,
      subject: a.subject,
      course: a.course,
      batch: a.batch,
      dueDate: fmtDate(a.dueDate),
      totalMarks: a.totalMarks,
      questionsCount: a.questions.length,
      status,
      obtainedMarks: sub?.marks ?? null,
      verdict: sub?.verdict ?? null,
      note: sub?.note ?? "",
      submittedAt: sub ? fmtDateTime(sub.submittedAt) : null,
    };
  });
}

export type WorksheetRead =
  | {
      state: "open";
      assignment: {
        id: string;
        title: string;
        subject: string;
        course: string;
        batch: string;
        description: string;
        totalMarks: number;
        dueDate: string;
        overdue: boolean;
        questions: { text: string; marks: number }[];
      };
    }
  | {
      state: "submitted";
      assignment: {
        id: string;
        title: string;
        subject: string;
        course: string;
        batch: string;
        description: string;
        totalMarks: number;
      };
      answers: string[];
      questions: { text: string; marks: number }[];
      submittedAt: string;
      marks: number | null;
      verdict: "complete" | "needs_work" | null;
      note: string;
    };

/** Student: read-only worksheet for the solve screen (or own submission if done). */
export async function getAssignmentWorksheet(assignmentId: string): Promise<WorksheetRead | null> {
  const { user } = await requireRole(["student"]);
  const batch = await getStudentBatch(user.id);
  await connectDB();

  if (!Types.ObjectId.isValid(assignmentId)) return null;
  const assignment = await AssignmentModel.findById(assignmentId).lean();
  if (!assignment || batch !== assignment.batch) return null;

  const submission = await SubmissionModel.findOne({ assignmentId: assignment._id, userId: user.id }).lean();
  if (submission) {
    return {
      state: "submitted",
      assignment: {
        id: String(assignment._id),
        title: assignment.title,
        subject: assignment.subject,
        course: assignment.course,
        batch: assignment.batch,
        description: assignment.description,
        totalMarks: assignment.totalMarks,
      },
      questions: assignment.questions.map((q) => ({ text: q.text, marks: q.marks })),
      answers: submission.answers,
      submittedAt: fmtDateTime(submission.submittedAt),
      marks: submission.marks,
      verdict: submission.verdict,
      note: submission.note,
    };
  }

  return {
    state: "open",
    assignment: {
      id: String(assignment._id),
      title: assignment.title,
      subject: assignment.subject,
      course: assignment.course,
      batch: assignment.batch,
      description: assignment.description,
      totalMarks: assignment.totalMarks,
      dueDate: fmtDateTime(assignment.dueDate),
      overdue: new Date() > assignment.dueDate,
      questions: assignment.questions.map((q) => ({ text: q.text, marks: q.marks })),
    },
  };
}

export type SubmitOutcome = { ok: true; id: string } | { ok: false; message: string };

/** Student: persist worksheet answers. One submission per (student, worksheet). */
export async function submitAssignment(
  assignmentId: string,
  answers: string[],
): Promise<SubmitOutcome> {
  const { user } = await requireRole(["student"]);

  const validated = SubmitAssignmentSchema.safeParse({ assignmentId, answers });
  if (!validated.success) {
    const issue = validated.error.issues[0];
    return { ok: false, message: issue?.message ?? "Please answer every question." };
  }

  await connectDB();
  if (!Types.ObjectId.isValid(assignmentId)) return { ok: false, message: "Worksheet not found." };
  const batch = await getStudentBatch(user.id);
  const assignment = await AssignmentModel.findById(assignmentId).lean();
  if (!assignment || batch !== assignment.batch) {
    return { ok: false, message: "Worksheet not found." };
  }

  const clean = validated.data.answers.map((a) => a.trim());
  if (clean.length !== assignment.questions.length || clean.some((a) => a.length === 0)) {
    return { ok: false, message: "Please answer every question before submitting." };
  }

  const existing = await SubmissionModel.findOne({ assignmentId: assignment._id, userId: user.id }).lean();
  if (existing) return { ok: false, message: "You have already submitted this worksheet." };

  const submission = await SubmissionModel.create({
    assignmentId: assignment._id,
    userId: user.id,
    studentName: user.name,
    batch: assignment.batch,
    answers: clean,
    submittedAt: new Date(),
    status: "pending_review",
  });

  return { ok: true, id: String(submission._id) };
}

/* ------------------------------------------------------------------ */
/* Notifications hub                                                    */
/* ------------------------------------------------------------------ */

export type StudentNotification = {
  id: string;
  title: string;
  message: string;
  category: string;
  time: string;
  date: string;
  read: boolean;
  important: boolean;
  sender: string;
  ip: string;
  os: string;
  device: string;
  link: string;
};

function notifDateDisplay(date: Date, now = new Date()): string {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((d2 - d1) / (24 * 60 * 60 * 1000));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return fmtDate(date);
}

/** Student: their notification feed (the Assignments reminders appear here). */
export async function getStudentNotifications(): Promise<StudentNotification[]> {
  const { user } = await requireRole(["student"]);
  await connectDB();

  const docs = await NotificationModel.find({ userId: user.id }).sort({ createdAt: -1 }).limit(100).lean();
  return docs.map((n) => ({
    id: String(n._id),
    title: n.title,
    message: n.message,
    category: n.category,
    time: fmtTime(n.createdAt),
    date: notifDateDisplay(n.createdAt),
    read: n.read,
    important: n.important,
    sender: n.sender,
    ip: n.ip,
    os: n.os,
    device: n.device,
    link: n.link,
  }));
}

/** Student: mark one notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  await NotificationModel.updateMany({ _id: id, userId: user.id }, { $set: { read: true } });
}

/** Student: mark the whole feed as read. */
export async function markAllNotificationsRead(): Promise<void> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  await NotificationModel.updateMany({ userId: user.id, read: false }, { $set: { read: true } });
}
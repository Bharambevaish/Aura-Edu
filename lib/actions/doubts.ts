"use server";

/**
 * Doubt discussion — students ask questions on a lesson from the Learn
 * player; admin/staff answer them from the Doubts inbox (LMS → Doubts).
 *
 * Students: enrollment is checked server-side on every call (the course's
 * `enrolledStudents` must include the signed-in student), and they see every
 * doubt on that lesson — their own and classmates'.
 * Staff: scoped to the batches they teach (timetable slots with their
 * teacherId — the same assignment Staff Corner derives); admins see all.
 * A staff reply notifies the student in their notification hub.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import type { SessionUser } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { CourseModel } from "@/lib/models/Course";
import { UserModel } from "@/lib/models/User";
import { DoubtModel } from "@/lib/models/Doubt";
import type { DoubtStatus, DoubtReply } from "@/lib/models/Doubt";
import { NotificationModel } from "@/lib/models/Notification";
import { TimetableSlotModel } from "@/lib/models/TimetableSlot";
import { AskDoubtSchema, ReplyDoubtSchema } from "@/lib/validation";

type Outcome<T = unknown> = (T & { ok: true }) | { ok: false; message: string };

export type DoubtReplyRow = {
  id: string;
  authorName: string;
  authorRole: DoubtReply["authorRole"];
  body: string;
  createdAt: string;
};

export type DoubtRow = {
  id: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  studentName: string;
  batch: string;
  question: string;
  status: DoubtStatus;
  replies: DoubtReplyRow[];
  createdAt: string;
  answeredAt: string | null;
  /** Student view: asked by the signed-in student. */
  mine: boolean;
};

export type InboxDoubtRow = DoubtRow & { courseTitle: string; courseCode: string };

type DoubtLean = {
  _id: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: string;
  lessonTitle?: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  batch?: string;
  question: string;
  status: DoubtStatus;
  replies?: DoubtReply[];
  createdAt: Date;
  answeredAt?: Date | null;
};

const toRow = (d: DoubtLean, meId?: string): DoubtRow => ({
  id: String(d._id),
  courseId: String(d.courseId),
  lessonId: d.lessonId,
  lessonTitle: d.lessonTitle ?? "",
  studentName: d.studentName,
  batch: d.batch ?? "",
  question: d.question,
  status: d.status,
  replies: (d.replies ?? []).map((r) => ({
    id: String(r._id),
    authorName: r.authorName,
    authorRole: r.authorRole,
    body: r.body,
    createdAt: new Date(r.createdAt).toISOString(),
  })),
  createdAt: d.createdAt.toISOString(),
  answeredAt: d.answeredAt ? d.answeredAt.toISOString() : null,
  mine: !!meId && String(d.studentId) === meId,
});

type CourseLessons = { _id: mongoose.Types.ObjectId; title: string; modules?: { lessons?: { id: string; title: string }[] }[] };

async function enrolledCourse(courseId: string, studentId: string): Promise<CourseLessons | null> {
  if (!mongoose.isValidObjectId(courseId)) return null;
  return CourseModel.findOne({ _id: courseId, enrolledStudents: new mongoose.Types.ObjectId(studentId) })
    .select("title modules.lessons.id modules.lessons.title")
    .lean<CourseLessons>();
}

const findLesson = (course: CourseLessons, lessonId: string) =>
  (course.modules ?? []).flatMap((m) => m.lessons ?? []).find((l) => l.id === lessonId);

/* ------------------------------- Student ------------------------------ */

/** All doubts on one lesson of a course the student is enrolled in, newest first. */
export async function listLessonDoubts(courseId: string, lessonId: string): Promise<DoubtRow[]> {
  const { user } = await requireRole(["student"]);
  if (typeof lessonId !== "string" || !lessonId) return [];
  await connectDB();
  const course = await enrolledCourse(courseId, user.id);
  if (!course) return [];
  const rows = await DoubtModel.find({ courseId: course._id, lessonId }).sort({ createdAt: -1 }).limit(100).lean<DoubtLean[]>();
  return rows.map((d) => toRow(d, user.id));
}

/** Ask a question on the current lesson. */
export async function askDoubt(input: unknown): Promise<Outcome<{ doubt: DoubtRow }>> {
  const { user } = await requireRole(["student"]);
  const parsed = AskDoubtSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Write your question first." };
  await connectDB();
  const course = await enrolledCourse(parsed.data.courseId, user.id);
  const lesson = course && findLesson(course, parsed.data.lessonId);
  if (!course || !lesson) return { ok: false, message: "Lesson not found in your courses." };

  const me = await UserModel.findById(user.id).select("batch").lean();
  const doc = await DoubtModel.create({
    courseId: course._id,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    studentId: new mongoose.Types.ObjectId(user.id),
    studentName: user.name,
    batch: me?.batch ?? "",
    question: parsed.data.question,
  });
  return { ok: true, doubt: toRow(doc.toObject() as DoubtLean, user.id) };
}

/* ---------------------------- Admin / staff --------------------------- */

/** Batches a staff member teaches (null = admin, unrestricted). */
async function scopeBatches(user: SessionUser): Promise<string[] | null> {
  if (user.role === "admin") return null;
  const slots = await TimetableSlotModel.find({ teacherId: new mongoose.Types.ObjectId(user.id) }).select("batch").lean();
  return [...new Set(slots.map((s) => s.batch))];
}

export type DoubtInbox = {
  doubts: InboxDoubtRow[];
  counts: { open: number; answered: number };
  /** Staff: the batches they're scoped to; null for admins. */
  scope: string[] | null;
};

export async function getDoubtInbox(status: DoubtStatus | "all" = "open"): Promise<DoubtInbox> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const scope = await scopeBatches(user);
  const base: Record<string, unknown> = scope ? { batch: { $in: scope } } : {};
  const filter = status === "all" ? base : { ...base, status };

  const [rows, open, answered] = await Promise.all([
    DoubtModel.find(filter).sort({ status: -1, createdAt: -1 }).limit(300).lean<DoubtLean[]>(),
    DoubtModel.countDocuments({ ...base, status: "open" }),
    DoubtModel.countDocuments({ ...base, status: "answered" }),
  ]);
  const courses = await CourseModel.find({ _id: { $in: [...new Set(rows.map((r) => String(r.courseId)))] } })
    .select("title code")
    .lean();
  const byId = new Map(courses.map((c) => [String(c._id), c]));
  return {
    doubts: rows.map((d) => {
      const c = byId.get(String(d.courseId));
      return { ...toRow(d), courseTitle: c?.title ?? "Deleted course", courseCode: c?.code ?? "" };
    }),
    counts: { open, answered },
    scope,
  };
}

async function loadScoped(user: SessionUser, doubtId: string) {
  if (!mongoose.isValidObjectId(doubtId)) return null;
  const doubt = await DoubtModel.findById(doubtId);
  if (!doubt) return null;
  const scope = await scopeBatches(user);
  if (scope && !scope.includes(doubt.batch)) return null;
  return doubt;
}

/** Reply to a doubt (and by default mark it answered); the student is notified. */
export async function replyToDoubt(input: unknown): Promise<Outcome<{ doubt: DoubtRow }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = ReplyDoubtSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Write a reply first." };
  await connectDB();
  const doubt = await loadScoped(user, parsed.data.doubtId);
  if (!doubt) return { ok: false, message: "Doubt not found." };

  doubt.replies.push({
    authorId: new mongoose.Types.ObjectId(user.id),
    authorName: user.name,
    authorRole: user.role === "admin" ? "admin" : "staff",
    body: parsed.data.body,
    createdAt: new Date(),
  });
  if (parsed.data.markAnswered && doubt.status !== "answered") {
    doubt.status = "answered";
    doubt.answeredAt = new Date();
  }
  await doubt.save();

  const course = await CourseModel.findById(doubt.courseId).select("title").lean();
  await NotificationModel.create({
    userId: doubt.studentId,
    title: doubt.status === "answered" ? "Your doubt has been answered" : "New reply on your doubt",
    message: `${user.name} replied to your question on "${doubt.lessonTitle || "a lesson"}"${course ? ` (${course.title})` : ""}: ${parsed.data.body.slice(0, 180)}`,
    category: "Courses",
    sender: user.name,
    link: `/student-portal/my-courses/${String(doubt.courseId)}/learn?lesson=${encodeURIComponent(doubt.lessonId)}&tab=discussion`,
    ip: "-",
    os: "-",
    device: "-",
  });
  await writeAudit(user, "answered doubt", `${doubt.studentName} — ${doubt.lessonTitle || doubt.lessonId}`);
  return { ok: true, doubt: toRow(doubt.toObject() as DoubtLean) };
}

/** Mark answered without a reply, or reopen. */
export async function setDoubtStatus(doubtId: string, status: DoubtStatus): Promise<Outcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (status !== "open" && status !== "answered") return { ok: false, message: "Invalid status." };
  await connectDB();
  const doubt = await loadScoped(user, doubtId);
  if (!doubt) return { ok: false, message: "Doubt not found." };
  doubt.status = status;
  doubt.answeredAt = status === "answered" ? new Date() : null;
  await doubt.save();
  await writeAudit(user, status === "answered" ? "closed doubt" : "reopened doubt", `${doubt.studentName} — ${doubt.lessonTitle || doubt.lessonId}`);
  return { ok: true };
}

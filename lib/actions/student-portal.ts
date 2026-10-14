"use server";

/**
 * Student self-service — profile and courses for the *signed-in* student.
 *
 * Every action derives the student's id from the session (requireRole), never
 * from a client-supplied parameter, so a student can only ever read or change
 * their own record. Fees live in lib/actions/finance.ts (getMyFees /
 * payMyInvoice) next to the private finance helpers they reuse.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";
import type { UserDoc } from "@/lib/models/User";
import { CourseModel } from "@/lib/models/Course";
import { LessonProgressModel } from "@/lib/models/LessonProgress";
import type { CourseDoc, CourseLesson } from "@/lib/models/Course";
import { UpdateMyProfileSchema, ChangePasswordSchema } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

/** Shape consumed by StudentContext (`profile`). Missing fields render as "—". */
export type MyProfile = {
  name: string;
  admissionNo: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  category: string;
  bloodGroup: string;
  rollNo: string;
  batch: string;
  course: string;
  joiningDate: string;
  academicYear: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const DASH = "—";

function fmtLongDate(d?: Date | null): string {
  if (!d) return DASH;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

/** Indian academic year (Apr–Mar) the student joined in, e.g. "2026-2027". */
function academicYearOf(d?: Date | null): string {
  if (!d) return DASH;
  const date = new Date(d);
  const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

function toProfile(u: Partial<UserDoc>): MyProfile {
  return {
    name: u.name || DASH,
    admissionNo: u.admissionNo || DASH,
    email: u.email || DASH,
    phone: u.phone || "",
    dob: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().slice(0, 10) : DASH,
    gender: u.gender || DASH,
    category: DASH,
    bloodGroup: DASH,
    rollNo: u.rollNo || DASH,
    batch: u.batch || "Unassigned",
    course: u.course || DASH,
    joiningDate: fmtLongDate(u.admissionDate),
    academicYear: academicYearOf(u.admissionDate),
    fatherName: u.guardianName || DASH,
    motherName: DASH,
    guardianPhone: u.guardianPhone || "",
    address: u.address?.street || "",
    city: u.address?.city || "",
    state: u.address?.state || "",
    pincode: u.address?.pincode || "",
  };
}

/** The signed-in student's profile, read fresh from `users`. */
export async function getMyProfile(): Promise<MyProfile> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  const doc = await UserModel.findOne({ _id: user.id, role: "student" })
    .select("-passwordHash -failedAttempts -lockoutUntil -lastDevice -idProofNumber")
    .lean();
  // Session outlived its record (e.g. deleted by admin): show the identity
  // the JWT carries rather than crash; Task-3 revocation will bounce them.
  return doc ? toProfile(doc) : toProfile({ name: user.name, email: user.email });
}

export type ProfileOutcome = { ok: boolean; message: string };

/** Students may edit their own contact details only (phone, guardian phone, address). */
export async function updateMyProfile(input: unknown): Promise<ProfileOutcome> {
  const { user } = await requireRole(["student"]);
  const parsed = UpdateMyProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile details." };
  }
  await connectDB();
  const { phone, guardianPhone, street, city } = parsed.data;
  const res = await UserModel.updateOne(
    { _id: user.id, role: "student" },
    { $set: { phone, guardianPhone, "address.street": street, "address.city": city } },
  );
  if (res.matchedCount === 0) return { ok: false, message: "Student record not found." };
  return { ok: true, message: "Contact details saved." };
}

/** Change the signed-in student's password after verifying the current one. */
export async function changeMyPassword(input: unknown): Promise<ProfileOutcome> {
  const { user } = await requireRole(["student"]);
  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid password." };
  }
  await connectDB();
  const doc = await UserModel.findOne({ _id: user.id, role: "student" }).select("passwordHash").lean();
  if (!doc) return { ok: false, message: "Student record not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, doc.passwordHash);
  if (!valid) return { ok: false, message: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await UserModel.updateOne({ _id: doc._id }, { $set: { passwordHash, mustChangePassword: false } });
  return { ok: true, message: "Password updated." };
}

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

export type MyLesson = Pick<CourseLesson, "id" | "title" | "type" | "url" | "duration">;
export type MyModule = { id: string; title: string; lessons: MyLesson[] };

export type MyCourse = {
  id: string;
  title: string;
  code: string;
  category: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  description: string;
  totalLessons: number;
  modules: MyModule[];
  /** Lesson ids this student has marked complete. */
  completedLessonIds: string[];
  completedLessons: number;
  /** 0–100, from completed / total lessons. */
  progress: number;
};

export type StoreCourse = {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  isPaid: boolean;
  duration: string;
  level: string;
  rating: number;
  reviewsCount: number;
  badge: string;
  description: string;
  features: string[];
  isEnrolled: boolean;
};

type CourseLean = CourseDoc & { _id: mongoose.Types.ObjectId };

function toMyCourse(c: CourseLean, completed: Set<string> = new Set()): MyCourse {
  const modules = (c.modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    lessons: (m.lessons ?? []).map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      url: l.url ?? "",
      duration: l.duration ?? "",
    })),
  }));
  const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
  // Only count completions for lessons that still exist in the curriculum.
  const completedLessonIds = lessonIds.filter((id) => completed.has(id));
  return {
    id: String(c._id),
    title: c.title,
    code: c.code,
    category: c.category,
    instructor: c.instructor ?? "",
    duration: c.duration ?? "",
    thumbnail: c.thumbnail ?? "",
    description: c.description ?? "",
    totalLessons: lessonIds.length,
    modules,
    completedLessonIds,
    completedLessons: completedLessonIds.length,
    progress: lessonIds.length ? Math.round((completedLessonIds.length / lessonIds.length) * 100) : 0,
  };
}

/** completed lesson ids per course id for one student. */
async function progressFor(userId: string, courseIds: mongoose.Types.ObjectId[]): Promise<Map<string, Set<string>>> {
  const rows = await LessonProgressModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    courseId: { $in: courseIds },
  })
    .select("courseId lessonId")
    .lean();
  const map = new Map<string, Set<string>>();
  for (const r of rows) {
    const key = String(r.courseId);
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(r.lessonId);
  }
  return map;
}

/** Courses the signed-in student is enrolled in (Course.enrolledStudents). */
export async function getMyCourses(): Promise<MyCourse[]> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  const courses = await CourseModel.find({ enrolledStudents: new mongoose.Types.ObjectId(user.id) })
    .select("-enrolledStudents")
    .sort({ title: 1 })
    .lean<CourseLean[]>();
  const progress = await progressFor(user.id, courses.map((c) => c._id));
  return courses.map((c) => toMyCourse(c, progress.get(String(c._id))));
}

/** One enrolled course with its curriculum; null if missing or not enrolled. */
export async function getMyCourse(courseId: string): Promise<MyCourse | null> {
  const { user } = await requireRole(["student"]);
  if (!mongoose.isValidObjectId(courseId)) return null;
  await connectDB();
  const course = await CourseModel.findOne({
    _id: courseId,
    enrolledStudents: new mongoose.Types.ObjectId(user.id),
  })
    .select("-enrolledStudents")
    .lean<CourseLean>();
  if (!course) return null;
  const progress = await progressFor(user.id, [course._id]);
  return toMyCourse(course, progress.get(String(course._id)));
}

/** Mark a lesson complete (or not) for the signed-in student. Enrollment-checked. */
export async function setLessonComplete(courseId: string, lessonId: string, done: boolean): Promise<ProfileOutcome> {
  const { user } = await requireRole(["student"]);
  if (!mongoose.isValidObjectId(courseId) || typeof lessonId !== "string" || !lessonId) {
    return { ok: false, message: "Lesson not found." };
  }
  await connectDB();
  const me = new mongoose.Types.ObjectId(user.id);
  const course = await CourseModel.findOne({ _id: courseId, enrolledStudents: me }).select("modules").lean<CourseLean>();
  const exists = course?.modules?.some((m) => m.lessons?.some((l) => l.id === lessonId));
  if (!course || !exists) return { ok: false, message: "Lesson not found." };

  if (done) {
    await LessonProgressModel.updateOne(
      { userId: me, courseId: course._id, lessonId },
      { $setOnInsert: { completedAt: new Date() } },
      { upsert: true },
    );
  } else {
    await LessonProgressModel.deleteOne({ userId: me, courseId: course._id, lessonId });
  }
  return { ok: true, message: done ? "Lesson marked complete." : "Lesson marked incomplete." };
}

/** Published storefront, flagged with the signed-in student's enrollment. */
export async function getCourseStore(): Promise<StoreCourse[]> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  const me = new mongoose.Types.ObjectId(user.id);
  const courses = await CourseModel.find({ published: true }).sort({ title: 1 }).lean<CourseLean[]>();
  return courses.map((c) => ({
    id: String(c._id),
    title: c.title,
    category: c.category,
    price: c.price ?? 0,
    originalPrice: c.originalPrice ?? 0,
    isPaid: !!c.isPaid,
    duration: c.duration ?? "",
    level: c.level ?? "",
    rating: c.rating ?? 4.5,
    reviewsCount: c.reviewsCount ?? 0,
    badge: c.badge ?? "",
    description: c.description ?? "",
    features: c.features ?? [],
    isEnrolled: (c.enrolledStudents ?? []).some((id) => id.equals(me)),
  }));
}

/**
 * Enroll the signed-in student in a published course. Checkout is simulated
 * in the POC (no payment gateway) — the enrollment itself is real and shows
 * up in My Courses and the admin Course Center roster/revenue.
 */
export async function enrollInCourse(courseId: string): Promise<ProfileOutcome> {
  const { user } = await requireRole(["student"]);
  if (!mongoose.isValidObjectId(courseId)) return { ok: false, message: "Course not found." };
  await connectDB();
  const res = await CourseModel.updateOne(
    { _id: courseId, published: true },
    { $addToSet: { enrolledStudents: new mongoose.Types.ObjectId(user.id) } },
  );
  if (res.matchedCount === 0) return { ok: false, message: "This course is not available." };
  if (res.modifiedCount === 0) return { ok: true, message: "You are already enrolled." };
  return { ok: true, message: "Enrollment confirmed." };
}

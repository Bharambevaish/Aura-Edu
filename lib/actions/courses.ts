"use server";

/**
 * Courses module — the single Course collection drives both admin tabs:
 *
 *  Course Content (app/admin-dashboard/lms/courses/content)
 *    getCourseContentList          - content list + headline stats
 *    getCourseDetail               - one course + full module/lesson tree
 *    createCourse / deleteCourse
 *    addModule / renameModule / deleteModule / moveModule
 *    addLesson / updateLesson / deleteLesson / moveLesson
 *
 *  Course Center (app/admin-dashboard/lms/courses/center)
 *    getCourseCatalog              - storefront list (published/paid/price/badge)
 *    getCourseStudents             - roster for a course's enrolled students
 *    updateCourseStoreSettings     - publish/price/badge edits
 *
 * Like Batches/Attendance, everything is computed at request time from live
 * Mongo docs — no hardcoded numbers on the client.
 */

import { randomUUID } from "crypto";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { CourseModel } from "@/lib/models/Course";
import { UserModel } from "@/lib/models/User";
import {
  CourseSchema,
  ModuleSchema,
  LessonSchema,
  CourseStoreSettingsSchema,
} from "@/lib/validation";
import type { CourseModule, CourseLesson } from "@/lib/models/Course";

export type CourseContentRow = {
  id: string;
  title: string;
  code: string;
  category: string;
  thumbnail: string;
  published: boolean;
  modules: number;
  lessons: number;
  enrolled: number;
};

export type CourseContentOverview = {
  stats: { total: number; published: number; modules: number; lessons: number };
  courses: CourseContentRow[];
};

/** Admin/staff: content list + headline stats (real counts from the DB). */
export async function getCourseContentList(search?: string): Promise<CourseContentOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const q = search?.trim().toLowerCase() ?? "";
  const filter = q
    ? { $or: [{ title: { $regex: q, $options: "i" } }, { code: { $regex: q, $options: "i" } }, { category: { $regex: q, $options: "i" } }] }
    : {};

  const courses = await CourseModel.find(filter).sort({ title: 1 }).lean();

  const rows: CourseContentRow[] = courses.map((c) => ({
    id: String(c._id),
    title: c.title,
    code: c.code,
    category: c.category,
    thumbnail: c.thumbnail ?? "",
    published: !!c.published,
    modules: c.modules?.length ?? 0,
    lessons: (c.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0),
    enrolled: c.enrolledStudents?.length ?? 0,
  }));

  return {
    stats: {
      total: courses.length,
      published: courses.filter((c) => c.published).length,
      modules: courses.reduce((n, c) => n + (c.modules?.length ?? 0), 0),
      lessons: courses.reduce(
        (n, c) => n + (c.modules ?? []).reduce((x, m) => x + (m.lessons?.length ?? 0), 0),
        0,
      ),
    },
    courses: rows,
  };
}

export type CourseLessonDTO = {
  id: string;
  title: string;
  type: "video" | "document" | "quiz";
  url: string;
  duration: string;
};

export type CourseModuleDTO = {
  id: string;
  title: string;
  lessons: CourseLessonDTO[];
};

export type CourseDetail = {
  id: string;
  title: string;
  code: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  published: boolean;
  isPaid: boolean;
  price: number;
  originalPrice: number;
  level: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  features: string[];
  modules: CourseModuleDTO[];
  enrolled: number;
};

/** Admin/staff: one course + its full curriculum tree. */
export async function getCourseDetail(courseId: string): Promise<CourseDetail | null> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const c = await CourseModel.findById(courseId).lean();
  if (!c) return null;

  return {
    id: String(c._id),
    title: c.title,
    code: c.code,
    category: c.category,
    description: c.description ?? "",
    instructor: c.instructor ?? "",
    duration: c.duration ?? "",
    thumbnail: c.thumbnail ?? "",
    published: !!c.published,
    isPaid: !!c.isPaid,
    price: c.price ?? 0,
    originalPrice: c.originalPrice ?? 0,
    level: c.level ?? "",
    badge: c.badge ?? "",
    rating: c.rating ?? 4.5,
    reviewsCount: c.reviewsCount ?? 0,
    features: c.features ?? [],
    modules: (c.modules ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        type: l.type,
        url: l.url ?? "",
        duration: l.duration ?? "",
      })),
    })),
    enrolled: c.enrolledStudents?.length ?? 0,
  };
}

export type CourseOutcome = {
  ok: boolean;
  id?: string;
  message?: string;
};

/** Admin/staff: create a course. Returns the new id for a client redirect. */
export async function createCourse(input: unknown): Promise<CourseOutcome> {
  const parsed = CourseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid course details." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const clash = await CourseModel.findOne({ code: parsed.data.code }).select("_id").lean();
  if (clash) return { ok: false, message: `A course with code "${parsed.data.code}" already exists.` };

  const doc = await CourseModel.create({
    title: parsed.data.title,
    code: parsed.data.code,
    category: parsed.data.category,
    description: parsed.data.description ?? "",
    instructor: parsed.data.instructor ?? "",
    duration: parsed.data.duration ?? "",
    thumbnail: parsed.data.thumbnail ?? "",
    published: parsed.data.published ?? false,
    isPaid: parsed.data.isPaid ?? true,
    price: parsed.data.price,
    originalPrice: parsed.data.originalPrice ?? 0,
    level: parsed.data.level ?? "",
    badge: parsed.data.badge ?? "",
    rating: parsed.data.rating ?? 4.5,
    reviewsCount: 0,
    features: parsed.data.features ?? [],
    modules: [],
    enrolledStudents: [],
  });

  return { ok: true, id: String(doc._id), message: `Course "${doc.title}" created. Add its modules next.` };
}

/** Admin only: delete a course (refused while students are enrolled). */
export async function deleteCourse(courseId: string): Promise<CourseOutcome> {
  await requireRole(["admin"]);
  await connectDB();

  const course = await CourseModel.findById(courseId).lean();
  if (!course) return { ok: false, message: "Course not found." };

  const enrolled = course.enrolledStudents?.length ?? 0;
  if (enrolled > 0) {
    return {
      ok: false,
      message: `Cannot delete "${course.title}" — ${enrolled} student(s) are enrolled. Unpublish it instead.`,
    };
  }

  await CourseModel.deleteOne({ _id: course._id });
  return { ok: true, message: `Course "${course.title}" deleted.` };
}

/* ------------------------------------------------------------------ */
/* Curriculum editor (Course Content)                                  */
/* ------------------------------------------------------------------ */

async function mutateModules(courseId: string, fn: (modules: CourseModule[]) => CourseModule[]) {
  const course = await CourseModel.findById(courseId).lean();
  if (!course) return { ok: false, message: "Course not found." } satisfies CourseOutcome;

  const next = fn(course.modules ?? []);
  await CourseModel.updateOne({ _id: course._id }, { $set: { modules: next } });
  return { ok: true } satisfies CourseOutcome;
}

function moduleIndex(modules: CourseModule[], moduleId: string): number {
  return modules.findIndex((m) => m.id === moduleId);
}

function lessonIndex(module: CourseModule | undefined, lessonId: string): number {
  return (module?.lessons ?? []).findIndex((l) => l.id === lessonId);
}

/** Admin/staff: add a module to a course. */
export async function addModule(courseId: string, input: unknown): Promise<CourseOutcome> {
  const parsed = ModuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Module title is required." };
  }
  await requireRole(["admin", "staff"]);
  await connectDB();

  return mutateModules(courseId, (modules) => [
    ...modules,
    { id: randomUUID(), title: parsed.data.title, lessons: [] },
  ]);
}

/** Admin/staff: rename a module. */
export async function renameModule(courseId: string, moduleId: string, input: unknown): Promise<CourseOutcome> {
  const parsed = ModuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Module title is required." };
  }
  await requireRole(["admin", "staff"]);
  await connectDB();

  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    if (i < 0) return modules;
    const list = [...modules];
    list[i] = { ...list[i], title: parsed.data.title };
    return list;
  });
}

/** Admin/staff: delete a module (and its lessons). */
export async function deleteModule(courseId: string, moduleId: string): Promise<CourseOutcome> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  return mutateModules(courseId, (modules) => modules.filter((m) => m.id !== moduleId));
}

/** Admin/staff: move a module up/down in the curriculum. */
export async function moveModule(courseId: string, moduleId: string, direction: "up" | "down"): Promise<CourseOutcome> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= modules.length) return modules;
    const list = [...modules];
    [list[i], list[j]] = [list[j], list[i]];
    return list;
  });
}

/** Admin/staff: add a lesson to a module. */
export async function addLesson(courseId: string, moduleId: string, input: unknown): Promise<CourseOutcome> {
  const parsed = LessonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Lesson title is required." };
  }
  await requireRole(["admin", "staff"]);
  await connectDB();

  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    if (i < 0) return modules;
    const list = [...modules];
    const lesson: CourseLesson = {
      id: randomUUID(),
      title: parsed.data.title,
      type: parsed.data.type,
      url: parsed.data.url ?? "",
      duration: parsed.data.duration ?? "",
    };
    list[i] = { ...list[i], lessons: [...(list[i].lessons ?? []), lesson] };
    return list;
  });
}

/** Admin/staff: edit a lesson's details (or move it to another module). */
export async function updateLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  input: unknown,
): Promise<CourseOutcome> {
  const parsed = LessonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Lesson title is required." };
  }
  await requireRole(["admin", "staff"]);
  await connectDB();

  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    const j = lessonIndex(modules[i], lessonId);
    if (i < 0 || j < 0) return modules;
    const list = [...modules];
    const lessons = [...(list[i].lessons ?? [])];
    lessons[j] = {
      ...lessons[j],
      title: parsed.data.title,
      type: parsed.data.type,
      url: parsed.data.url ?? "",
      duration: parsed.data.duration ?? "",
    };
    list[i] = { ...list[i], lessons };
    return list;
  });
}

/** Admin/staff: delete a lesson. */
export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<CourseOutcome> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    if (i < 0) return modules;
    const list = [...modules];
    list[i] = { ...list[i], lessons: (list[i].lessons ?? []).filter((l) => l.id !== lessonId) };
    return list;
  });
}

/** Admin/staff: move a lesson up/down within its module. */
export async function moveLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: "up" | "down",
): Promise<CourseOutcome> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  return mutateModules(courseId, (modules) => {
    const i = moduleIndex(modules, moduleId);
    const j = lessonIndex(modules[i], lessonId);
    const k = direction === "up" ? j - 1 : j + 1;
    if (i < 0 || j < 0 || k < 0 || k >= (modules[i]?.lessons?.length ?? 0)) return modules;
    const list = [...modules];
    const lessons = [...(list[i].lessons ?? [])];
    [lessons[j], lessons[k]] = [lessons[k], lessons[j]];
    list[i] = { ...list[i], lessons };
    return list;
  });
}

/* ------------------------------------------------------------------ */
/* Course Center (storefront manager)                                  */
/* ------------------------------------------------------------------ */

export type CourseCatalogRow = {
  id: string;
  title: string;
  code: string;
  category: string;
  thumbnail: string;
  published: boolean;
  isPaid: boolean;
  price: number;
  originalPrice: number;
  badge: string;
  rating: number;
  reviewsCount: number;
  modules: number;
  lessons: number;
  enrolled: number;
  revenue: number;
};

export type CourseCatalog = {
  stats: { total: number; published: number; paid: number; configuredValue: number };
  courses: CourseCatalogRow[];
};

/** Admin/staff: storefront manager — stats + every course's shop settings. */
export async function getCourseCatalog(): Promise<CourseCatalog> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const courses = await CourseModel.find().sort({ title: 1 }).lean();

  const rows: CourseCatalogRow[] = courses.map((c) => {
    const enrolled = c.enrolledStudents?.length ?? 0;
    return {
      id: String(c._id),
      title: c.title,
      code: c.code,
      category: c.category,
      thumbnail: c.thumbnail ?? "",
      published: !!c.published,
      isPaid: !!c.isPaid,
      price: c.price ?? 0,
      originalPrice: c.originalPrice ?? 0,
      badge: c.badge ?? "",
      rating: c.rating ?? 4.5,
      reviewsCount: c.reviewsCount ?? 0,
      modules: c.modules?.length ?? 0,
      lessons: (c.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0),
      enrolled,
      revenue: c.isPaid ? enrolled * (c.price ?? 0) : 0,
    };
  });

  return {
    stats: {
      total: courses.length,
      published: courses.filter((c) => c.published).length,
      paid: courses.filter((c) => c.isPaid).length,
      configuredValue: rows.reduce((sum, r) => sum + r.revenue, 0),
    },
    courses: rows,
  };
}

export type CourseStudentDTO = {
  id: string;
  name: string;
  admissionNo: string;
  course: string;
  batch: string;
};

/** Admin/staff: roster for a course's enrolled students (View Students modal). */
export async function getCourseStudents(courseId: string): Promise<CourseStudentDTO[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const course = await CourseModel.findById(courseId).select("enrolledStudents").lean();
  if (!course) return [];

  const ids = course.enrolledStudents ?? [];
  if (ids.length === 0) return [];

  const students = await UserModel.find({ _id: { $in: ids } }).sort({ name: 1 }).lean();
  return students.map((s) => ({
    id: String(s._id),
    name: s.name,
    admissionNo: s.admissionNo ?? "-",
    course: s.course ?? "-",
    batch: s.batch ?? "-",
  }));
}

export type CourseStoreSettings = {
  published: boolean;
  isPaid: boolean;
  price: number;
  originalPrice: number;
  badge: string;
};

/** Admin/staff: save a course's storefront settings (Center tab). */
export async function updateCourseStoreSettings(
  courseId: string,
  input: unknown,
): Promise<CourseOutcome> {
  const parsed = CourseStoreSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid store settings." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const course = await CourseModel.findById(courseId).lean();
  if (!course) return { ok: false, message: "Course not found." };

  await CourseModel.updateOne(
    { _id: course._id },
    {
      $set: {
        published: parsed.data.published,
        isPaid: parsed.data.isPaid,
        price: parsed.data.price,
        originalPrice: parsed.data.originalPrice,
        badge: parsed.data.badge ?? "",
      },
    },
  );

  return { ok: true, message: `Store settings saved for "${course.title}".` };
}
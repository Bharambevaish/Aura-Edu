"use server";

/**
 * Batches module (cohorts).
 *
 * A batch is a real document with its own details (course, capacity, dates,
 * description). Students join by exact string match on `users.batch` — the
 * same join tests/attempts/assignments already use — so this module's only
 * write to students is `User.batch` (+ a course sync on assignment), and every
 * derived view stays in sync with zero refactors.
 *
 *  getBatches             - list + headline stats (real counts), with derived
 *                           status (upcoming/active/completed) and soft capacity
 *  getBatchDetail         - one batch + its roster + assignable students
 *  createBatch / updateBatch
 *  assignStudentsToBatch  - set batch AND course (= batch course) on students
 *  removeStudentFromBatch - unset batch (course unchanged)
 *  deleteBatch            - refused while students are still enrolled
 *
 * Mirrors the Test/Assignment pattern: everything is computed at request time
 * from live MongoDB docs; nothing is hardcoded on the client.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { BatchModel } from "@/lib/models/Batch";
import { UserModel } from "@/lib/models/User";
import { CreateBatchSchema, AssignStudentsSchema } from "@/lib/validation";

export type BatchStatus = "upcoming" | "active" | "completed";

function derivedStatus(startDate: Date, endDate: Date, now = new Date()): BatchStatus {
  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "active";
}

export type AdminBatchRow = {
  id: string;
  name: string;
  course: string;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string;
  status: BatchStatus;
  enrolled: number;
  /** soft capacity — true when enrolled exceeds capacity (flagged, never blocked) */
  overfull: boolean;
};

export type BatchesOverview = {
  stats: {
    total: number;
    active: number;
    totalEnrolled: number;
    totalCapacity: number;
    unassigned: number;
    /** students whose batch string has no matching Batch doc */
    orphan: number;
  };
  batches: AdminBatchRow[];
};

/** Admin/staff: batch list + headline stats, all real numbers from the DB. */
/** New batch docs get this capacity until explicitly set (30 = schema default). */
const DEFAULT_BATCH_CAPACITY = 30;
const BATCH_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

export async function getBatches(): Promise<BatchesOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  // Students are the source of truth for which batches exist — their batch
  // string IS the assignment. Read them first so the collection can be synced
  // against them below.
  const students = await UserModel.find({ role: "student" })
    .select("batch course admissionDate")
    .lean();

  // Auto-sync: if a student carries a batch string with no matching Batch doc
  // (e.g. the DB was seeded before the Batches module existed), create it on
  // the spot with sensible derived values — course from those students, dates
  // from their admission. The seeded batches then appear in this tab with no
  // manual re-seed.
  let batches = await BatchModel.find().sort({ name: 1 }).lean();
  const known = new Set(batches.map((b) => b.name));

  const groups = new Map<string, { courseCounts: Map<string, number>; admissionDates: Date[] }>();
  for (const s of students) {
    const name = s.batch?.trim();
    if (!name) continue;
    const g = groups.get(name) ?? { courseCounts: new Map<string, number>(), admissionDates: [] };
    if (s.course?.trim()) g.courseCounts.set(s.course, (g.courseCounts.get(s.course) ?? 0) + 1);
    if (s.admissionDate) g.admissionDates.push(s.admissionDate);
    groups.set(name, g);
  }

  const missing = [...groups.keys()].filter((name) => !known.has(name));
  if (missing.length > 0) {
    await BatchModel.insertMany(
      missing.map((name) => {
        const g = groups.get(name)!;
        const course = [...g.courseCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? name;
        const start = g.admissionDates.length
          ? new Date(Math.min(...g.admissionDates.map((d) => d.getTime())))
          : new Date();
        return {
          name,
          course,
          capacity: DEFAULT_BATCH_CAPACITY,
          startDate: start,
          endDate: new Date(start.getTime() + BATCH_DURATION_MS),
          description: "Auto-created from existing student batch assignments.",
        };
      }),
    );
    batches = await BatchModel.find().sort({ name: 1 }).lean();
  }

  const enrolledByName = new Map<string, number>();
  let unassigned = 0;
  for (const s of students) {
    const name = s.batch?.trim();
    if (!name) {
      unassigned += 1;
      continue;
    }
    enrolledByName.set(name, (enrolledByName.get(name) ?? 0) + 1);
  }

  const rows: AdminBatchRow[] = batches.map((b) => {
    const enrolled = enrolledByName.get(b.name) ?? 0;
    return {
      id: String(b._id),
      name: b.name,
      course: b.course,
      capacity: b.capacity,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      description: b.description ?? "",
      status: derivedStatus(b.startDate, b.endDate),
      enrolled,
      overfull: enrolled > b.capacity,
    };
  });

  let totalEnrolled = 0;
  let orphan = 0;
  for (const [name, n] of enrolledByName) {
    totalEnrolled += n;
    if (!known.has(name)) orphan += n;
  }

  return {
    stats: {
      total: batches.length,
      active: rows.filter((r) => r.status === "active").length,
      totalEnrolled,
      totalCapacity: batches.reduce((sum, b) => sum + b.capacity, 0),
      unassigned,
      orphan,
    },
    batches: rows,
  };
}

export type BatchDetailDTO = {
  id: string;
  name: string;
  course: string;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string;
  status: BatchStatus;
  createdAt: string;
};

export type BatchStudentDTO = {
  id: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  course: string;
  batch: string;
  branch: string;
  admissionDate: string;
  status: string;
};

export type BatchDetail = {
  batch: BatchDetailDTO;
  /** students currently in this batch, sorted by name */
  students: BatchStudentDTO[];
  /** students with no batch at all — the natural assigns into this batch */
  unassigned: BatchStudentDTO[];
  /** students currently in another batch — adding them here MOVES them out */
  others: BatchStudentDTO[];
};

/** Admin/staff: one batch + its roster + assignable/movable students. */
export async function getBatchDetail(batchId: string): Promise<BatchDetail | null> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const batch = await BatchModel.findById(batchId).lean();
  if (!batch) return null;

  const [students, unassigned, others] = await Promise.all([
    UserModel.find({ role: "student", batch: batch.name }).sort({ name: 1 }).lean(),
    UserModel.find({ role: "student", batch: { $in: [null, ""] } }).sort({ name: 1 }).lean(),
    UserModel.find({ role: "student", batch: { $nin: [batch.name, null, ""] } }).sort({ name: 1 }).lean(),
  ]);

  const mapStudent = (s: (typeof students)[number]): BatchStudentDTO => ({
    id: String(s._id),
    name: s.name,
    admissionNo: s.admissionNo ?? "-",
    rollNo: s.rollNo ?? "-",
    course: s.course ?? "-",
    batch: s.batch ?? "-",
    branch: s.branch ?? "-",
    admissionDate: s.admissionDate ? s.admissionDate.toISOString().slice(0, 10) : "-",
    status: s.status ?? "Active",
  });

  return {
    batch: {
      id: String(batch._id),
      name: batch.name,
      course: batch.course,
      capacity: batch.capacity,
      startDate: batch.startDate.toISOString().slice(0, 10),
      endDate: batch.endDate.toISOString().slice(0, 10),
      description: batch.description ?? "",
      status: derivedStatus(batch.startDate, batch.endDate),
      createdAt: batch.createdAt.toISOString(),
    },
    students: students.map(mapStudent),
    unassigned: unassigned.map(mapStudent),
    others: others.map(mapStudent),
  };
}

export type BatchOutcome = {
  ok: boolean;
  id?: string;
  count?: number;
  message?: string;
};

/** Admin/staff: create a batch. Returns the new id for a client-side redirect. */
export async function createBatch(input: unknown): Promise<BatchOutcome> {
  const parsed = CreateBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid batch details." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const { name, course, capacity, startDate, endDate, description } = parsed.data;

  const existing = await BatchModel.findOne({ name }).select("_id").lean();
  if (existing) {
    return { ok: false, message: `A batch named "${name}" already exists.` };
  }

  const doc = await BatchModel.create({
    name,
    course,
    capacity,
    startDate: new Date(`${startDate}T00:00:00`),
    endDate: new Date(`${endDate}T00:00:00`),
    description: description ?? "",
  });

  return { ok: true, id: String(doc._id), message: `Batch "${name}" created.` };
}

/** Admin/staff: edit a batch's details (name must stay unique). */
export async function updateBatch(batchId: string, input: unknown): Promise<BatchOutcome> {
  const parsed = CreateBatchSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid batch details." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const batch = await BatchModel.findById(batchId).lean();
  if (!batch) return { ok: false, message: "Batch not found." };

  const { name, course, capacity, startDate, endDate, description } = parsed.data;

  if (name !== batch.name) {
    const clash = await BatchModel.findOne({ name, _id: { $ne: batch._id } }).select("_id").lean();
    if (clash) {
      return { ok: false, message: `A batch named "${name}" already exists.` };
    }
  }

  await BatchModel.updateOne(
    { _id: batch._id },
    {
      $set: {
        name,
        course,
        capacity,
        startDate: new Date(`${startDate}T00:00:00`),
        endDate: new Date(`${endDate}T00:00:00`),
        description: description ?? "",
      },
    },
  );

  // Keep the student↔batch string join in sync: renaming a batch or changing
  // its course propagates to the students enrolled in it, otherwise the old
  // string would orphan them from every derived view.
  if (name !== batch.name) {
    await UserModel.updateMany(
      { role: "student", batch: batch.name },
      { $set: { batch: name } },
    );
  }
  if (course !== batch.course) {
    await UserModel.updateMany(
      { role: "student", batch: name },
      { $set: { course } },
    );
  }

  return { ok: true, message: `Batch "${name}" updated.` };
}

/** Admin/staff: add studentIds into a batch (batch + course synced). */
export async function assignStudentsToBatch(input: unknown): Promise<BatchOutcome> {
  const parsed = AssignStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Select at least one student." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const batch = await BatchModel.findById(parsed.data.batchId).select("name course").lean();
  if (!batch) return { ok: false, message: "Batch not found." };

  const res = await UserModel.updateMany(
    { _id: { $in: parsed.data.studentIds }, role: "student" },
    { $set: { batch: batch.name, course: batch.course } },
  );

  return { ok: true, count: res.modifiedCount, message: `Added ${res.modifiedCount} student(s) to "${batch.name}".` };
}

/** Admin/staff: remove studentIds from their batch (course stays unchanged). */
export async function removeStudentFromBatch(input: unknown): Promise<BatchOutcome> {
  const parsed = AssignStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Select at least one student." };
  }

  await requireRole(["admin", "staff"]);
  await connectDB();

  const res = await UserModel.updateMany(
    { _id: { $in: parsed.data.studentIds }, role: "student" },
    { $unset: { batch: "" } },
  );

  return { ok: true, count: res.modifiedCount, message: `Removed ${res.modifiedCount} student(s) from their batch.` };
}

/** Admin/staff: delete an empty batch (refused while students are enrolled). */
export async function deleteBatch(batchId: string): Promise<BatchOutcome> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const batch = await BatchModel.findById(batchId).lean();
  if (!batch) return { ok: false, message: "Batch not found." };

  const enrolled = await UserModel.countDocuments({ role: "student", batch: batch.name });
  if (enrolled > 0) {
    return {
      ok: false,
      message: `Cannot delete "${batch.name}" — ${enrolled} student(s) are still enrolled. Move them out first.`,
    };
  }

  await BatchModel.deleteOne({ _id: batch._id });
  return { ok: true, message: `Batch "${batch.name}" deleted.` };
}
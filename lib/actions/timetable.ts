"use server";

/**
 * Timetable — recurring weekly classes per batch (TimetableSlot), plus a
 * date-wise view that merges that day's classes with live meetings and tests.
 *
 * Saving a slot refuses two clashes: the same batch in two classes at once,
 * and the same teacher in two places at once.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { TimetableSlotModel, type ClassMode, type TimetableSlotDoc } from "@/lib/models/TimetableSlot";
import { BatchModel } from "@/lib/models/Batch";
import { UserModel } from "@/lib/models/User";
import { MeetingModel } from "@/lib/models/Meeting";
import { TestModel } from "@/lib/models/Test";
import { TimetableSlotSchema } from "@/lib/validation";

export type SlotRow = {
  id: string;
  batch: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
  mode: ClassMode;
  meetingLink: string;
};

export type BatchTimetable = {
  name: string;
  course: string;
  active: boolean;
  slots: SlotRow[];
};

export type TimetableOverview = {
  stats: { batches: number; active: number; withSchedule: number; withoutSchedule: number; weeklyClasses: number };
  batches: BatchTimetable[];
  teachers: { id: string; name: string }[];
};

type SlotLean = TimetableSlotDoc & { _id: mongoose.Types.ObjectId };

function toRow(s: SlotLean): SlotRow {
  return {
    id: String(s._id),
    batch: s.batch,
    dayOfWeek: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    subject: s.subject,
    teacherId: s.teacherId ? String(s.teacherId) : "",
    teacherName: s.teacherName ?? "",
    room: s.room ?? "",
    mode: s.mode,
    meetingLink: s.meetingLink ?? "",
  };
}

const overlaps = (a: { startTime: string; endTime: string }, b: { startTime: string; endTime: string }) =>
  a.startTime < b.endTime && b.startTime < a.endTime;

/** Every batch with its weekly slots, plus the staff list for the teacher picker. */
export async function getTimetableOverview(): Promise<TimetableOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const [batches, slots, staff] = await Promise.all([
    BatchModel.find().sort({ name: 1 }).lean(),
    TimetableSlotModel.find().sort({ dayOfWeek: 1, startTime: 1 }).lean<SlotLean[]>(),
    UserModel.find({ role: "staff" }).select("name").sort({ name: 1 }).lean(),
  ]);
  const now = new Date();
  const rows: BatchTimetable[] = batches.map((b) => ({
    name: b.name,
    course: b.course,
    active: new Date(b.startDate) <= now && now <= new Date(b.endDate),
    slots: slots.filter((s) => s.batch === b.name).map(toRow),
  }));
  const withSchedule = rows.filter((r) => r.slots.length > 0).length;
  return {
    stats: {
      batches: rows.length,
      active: rows.filter((r) => r.active).length,
      withSchedule,
      withoutSchedule: rows.length - withSchedule,
      weeklyClasses: slots.length,
    },
    batches: rows,
    teachers: staff.map((s) => ({ id: String(s._id), name: s.name })),
  };
}

export type SlotOutcome = { ok: boolean; message: string };

/** Create (id = null) or update a weekly slot, refusing batch/teacher clashes. */
export async function saveTimetableSlot(id: string | null, input: unknown): Promise<SlotOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = TimetableSlotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid class." };
  if (id && !mongoose.isValidObjectId(id)) return { ok: false, message: "Class not found." };
  await connectDB();

  const d = parsed.data;
  if (!(await BatchModel.exists({ name: d.batch }))) return { ok: false, message: "Pick a valid batch." };

  let teacherId: mongoose.Types.ObjectId | null = null;
  let teacherName = d.teacherName;
  if (d.teacherId) {
    if (!mongoose.isValidObjectId(d.teacherId)) return { ok: false, message: "Pick a valid teacher." };
    const teacher = await UserModel.findOne({ _id: d.teacherId, role: "staff" }).select("name").lean();
    if (!teacher) return { ok: false, message: "Pick a valid teacher." };
    teacherId = teacher._id as mongoose.Types.ObjectId;
    teacherName = teacher.name;
  }

  const sameDay = await TimetableSlotModel.find({
    dayOfWeek: d.dayOfWeek,
    ...(id ? { _id: { $ne: id } } : {}),
  }).lean<SlotLean[]>();

  const batchClash = sameDay.find((s) => s.batch === d.batch && overlaps(s, d));
  if (batchClash) {
    return { ok: false, message: `${d.batch} already has ${batchClash.subject} ${batchClash.startTime}–${batchClash.endTime} that day.` };
  }
  const teacherClash = sameDay.find(
    (s) =>
      overlaps(s, d) &&
      ((teacherId && s.teacherId && String(s.teacherId) === String(teacherId)) ||
        (!teacherId && teacherName && !s.teacherId && s.teacherName.toLowerCase() === teacherName.toLowerCase())),
  );
  if (teacherClash) {
    return { ok: false, message: `${teacherName} is already teaching ${teacherClash.batch} ${teacherClash.startTime}–${teacherClash.endTime} that day.` };
  }

  const doc = {
    batch: d.batch,
    dayOfWeek: d.dayOfWeek,
    startTime: d.startTime,
    endTime: d.endTime,
    subject: d.subject,
    teacherId,
    teacherName,
    room: d.room,
    mode: d.mode,
    meetingLink: d.mode === "offline" ? "" : d.meetingLink,
  };
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const label = `${d.batch} · ${days[d.dayOfWeek]} ${d.startTime}–${d.endTime} ${d.subject}`;
  if (id) {
    const res = await TimetableSlotModel.updateOne({ _id: id }, { $set: doc });
    if (res.matchedCount === 0) return { ok: false, message: "Class not found." };
    await writeAudit(user, "updated timetable class", label);
    return { ok: true, message: "Class updated." };
  }
  await TimetableSlotModel.create(doc);
  await writeAudit(user, "added timetable class", label);
  return { ok: true, message: "Class added to the timetable." };
}

export async function deleteTimetableSlot(id: string): Promise<SlotOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Class not found." };
  await connectDB();
  const slot = await TimetableSlotModel.findByIdAndDelete(id).lean<SlotLean>();
  if (!slot) return { ok: false, message: "Class not found." };
  await writeAudit(user, "removed timetable class", `${slot.batch} · ${slot.subject} ${slot.startTime}–${slot.endTime}`);
  return { ok: true, message: "Class removed." };
}

export type DayItem = {
  id: string;
  kind: "class" | "meeting" | "test";
  title: string;
  batches: string;
  start: string;
  end: string;
  who: string;
  where: string;
  mode: string;
  link: string;
};

/** Everything happening on one date (YYYY-MM-DD) across all batches. */
export async function getDaySchedule(isoDate: string): Promise<{ date: string; items: DayItem[] }> {
  await requireRole(["admin", "staff"]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) isoDate = new Date().toISOString().slice(0, 10);
  await connectDB();

  const [y, m, d] = isoDate.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d);
  const dayEnd = new Date(y, m - 1, d + 1);
  const utcStart = new Date(Date.UTC(y, m - 1, d));
  const utcEnd = new Date(Date.UTC(y, m - 1, d + 1));

  const [slots, meetings, tests] = await Promise.all([
    TimetableSlotModel.find({ dayOfWeek: dayStart.getDay() }).lean<SlotLean[]>(),
    // Meetings store their date at UTC midnight; accept either convention.
    MeetingModel.find({ status: { $ne: "cancelled" }, date: { $gte: new Date(Math.min(+dayStart, +utcStart)), $lt: new Date(Math.max(+dayEnd, +utcEnd)) } }).lean(),
    TestModel.find({ startAt: { $gte: dayStart, $lt: dayEnd } }).lean(),
  ]);

  const hm = (dt: Date) => `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  const items: DayItem[] = [
    ...slots.map((s) => ({
      id: `slot-${s._id}`,
      kind: "class" as const,
      title: s.subject,
      batches: s.batch,
      start: s.startTime,
      end: s.endTime,
      who: s.teacherName || "—",
      where: s.room || (s.mode === "online" ? "Online" : "—"),
      mode: s.mode,
      link: s.meetingLink ?? "",
    })),
    ...meetings
      .filter((mt) => {
        const md = new Date(mt.date);
        return md.toISOString().slice(0, 10) === isoDate || (md >= dayStart && md < dayEnd);
      })
      .map((mt) => ({
        id: `meeting-${mt._id}`,
        kind: "meeting" as const,
        title: mt.title,
        batches: mt.batchNames?.length ? mt.batchNames.join(", ") : mt.type === "internal" ? "Staff" : "All batches",
        start: mt.startHour,
        end: mt.endHour,
        who: mt.type === "internal" ? "Staff meeting" : mt.type === "webinar" ? "Webinar" : "Live class",
        where: "Online",
        mode: "online",
        link: mt.link,
      })),
    ...tests.map((t) => {
      const start = new Date(t.startAt);
      return {
        id: `test-${t._id}`,
        kind: "test" as const,
        title: t.title,
        batches: t.batch,
        start: hm(start),
        end: hm(new Date(start.getTime() + t.durationMinutes * 60000)),
        who: `${t.subject} · ${t.totalMarks} marks`,
        where: "Online test",
        mode: "online",
        link: `/admin-dashboard/lms/students/tests/${t._id}`,
      };
    }),
  ].sort((a, b) => a.start.localeCompare(b.start));

  return { date: isoDate, items };
}

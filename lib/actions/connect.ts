"use server";

/**
 * Connect — the Communications backend for the admin panel.
 *
 * One spine: admin authors a Notice (or a batch broadcast, a meeting, a
 * calendar event) → the mutation fans out per-user Notification rows that the
 * student portal hub already renders, so the demo's read side needs zero code.
 * Every mutation writes an AuditLog row, mirroring the finance module.
 *
 * Audience targeting uses the product-wide string join (`User.batch ===
 * Batch.name`), same as attendance/assignments/tests.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import type { SessionUser } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";
import { BatchModel } from "@/lib/models/Batch";
import { NoticeModel } from "@/lib/models/Notice";
import type { NoticeDoc } from "@/lib/models/Notice";
import { MeetingModel } from "@/lib/models/Meeting";
import type { MeetingDoc } from "@/lib/models/Meeting";
import { CalendarEventModel } from "@/lib/models/CalendarEvent";
import type { CalendarEventDoc } from "@/lib/models/CalendarEvent";
import { NotificationModel } from "@/lib/models/Notification";
import { AuditLogModel } from "@/lib/models/AuditLog";
import {
  CreateNoticeSchema,
  SendBroadcastSchema,
  CreateMeetingSchema,
  CreateCalendarEventSchema,
} from "@/lib/validation";

type ResultOk<T> = T & { ok: true };
type ResultFail = { ok: false; message: string };
type Outcome<T = unknown> = ResultOk<T> | ResultFail;

const pad = (n: number, width: number) => String(n).padStart(width, "0");

type Countable = { countDocuments: () => Promise<number> };

async function nextDocNumber(model: Countable, prefix: string, width: number) {
  const count = await model.countDocuments();
  return `${prefix}${pad(count + 1, width)}`;
}

/* ------------------------------ Audit -------------------------------- */

async function writeAudit(user: SessionUser, action: string, target: string) {
  const eventNo = await nextDocNumber(AuditLogModel, "AUD-", 4);
  await AuditLogModel.create({
    eventNo,
    userId: new mongoose.Types.ObjectId(user.id),
    userName: user.name,
    userRole: user.role,
    action,
    target,
    ip: "-",
    isSystem: false,
  });
}

const dayKey = (d: Date) =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1, 2)}-${pad(d.getUTCDate(), 2)}`;

const meetingWindow = (m: { date: Date; startHour: string; endHour: string }) => {
  const t = dayKey(m.date);
  const start = new Date(`${t}T${m.startHour || "09:00"}:00`).getTime();
  const end = new Date(`${t}T${m.endHour || m.startHour || "10:00"}:00`).getTime();
  return { start, end };
};

/* ---------------------------- Batch lookups --------------------------- */

export type BroadcastBatchRow = {
  name: string;
  course: string;
  capacity: number;
  enrolled: number;
  /** unread *broadcast* notifications among students in this batch */
  unread: number;
};

/** Real batches + enrollment + unread broadcast counts (Groups tab + pickers). */
export async function getBroadcastBatches(): Promise<BroadcastBatchRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const [batches, students, unreadRows] = await Promise.all([
    BatchModel.find().sort({ name: 1 }).lean(),
    UserModel.find({ role: "student" }).select("_id batch").lean(),
    NotificationModel.find({ read: false, sourceId: { $ne: null } }).select("userId").lean(),
  ]);

  const unreadByUser = new Map<string, number>();
  for (const row of unreadRows) {
    const key = String(row.userId);
    unreadByUser.set(key, (unreadByUser.get(key) ?? 0) + 1);
  }

  const unreadByBatch = new Map<string, number>();
  const enrolledByBatch = new Map<string, number>();
  for (const s of students) {
    const name = s.batch?.trim();
    if (!name) continue;
    enrolledByBatch.set(name, (enrolledByBatch.get(name) ?? 0) + 1);
    unreadByBatch.set(name, (unreadByBatch.get(name) ?? 0) + (unreadByUser.get(String(s._id)) ?? 0));
  }

  return batches.map((b) => ({
    name: b.name,
    course: b.course,
    capacity: b.capacity,
    enrolled: enrolledByBatch.get(b.name) ?? 0,
    unread: unreadByBatch.get(b.name) ?? 0,
  }));
}

const audienceLabel = (a: { kind: string; batchNames: string[]; studentIds: { length: number } }): string => {
  if (a.kind === "all") return "All Students";
  if (a.kind === "staff") return "All Staff";
  if (a.kind === "batches") return a.batchNames.join(", ") || "Selected batches";
  return `${a.studentIds.length} student(s)`;
};

async function resolveAudience(audience: {
  kind: "all" | "batches" | "staff" | "students";
  batchNames: string[];
  studentIds: string[];
}): Promise<{ _id: unknown; name: string }[]> {
  const { kind, batchNames, studentIds } = audience;
  if (kind === "all") {
    return UserModel.find({ role: "student" }).select("_id name").lean();
  }
  if (kind === "batches") {
    return UserModel.find({ role: "student", batch: { $in: batchNames } }).select("_id name").lean();
  }
  if (kind === "staff") {
    return UserModel.find({ role: "staff" }).select("_id name").lean();
  }
  const ids = studentIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  return UserModel.find({ _id: { $in: ids } }).select("_id name").lean();
}

/** Fan a Notice out into one Notification row per targeted user. */
async function fanOut(
  noticeId: mongoose.Types.ObjectId,
  sender: string,
  title: string,
  message: string,
  category: string,
  important: boolean,
  targets: { _id: unknown; name: string }[],
) {
  const rows = targets.map((u) => ({
    userId: u._id,
    title,
    message,
    category,
    sender,
    important,
    read: false,
    link: "/student-portal/notifications",
    ip: "-",
    os: "-",
    device: "-",
    sourceId: noticeId,
  }));
  await NotificationModel.insertMany(rows);
  return rows.length;
}

/* ------------------------------- Notices ------------------------------ */

export type NoticeSlice = {
  id: string;
  title: string;
  message: string;
  category: string;
  important: boolean;
  pinned: boolean;
  sender: string;
  sentAt: string;
  audienceLabel: string;
  audienceKind: NoticeDoc["audience"]["kind"];
  delivered: number;
  read: number;
};

/** Admin/staff: full broadcast list, newest first (pinned on top). */
export async function getNotices(): Promise<NoticeSlice[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const [notices, stats] = await Promise.all([
    NoticeModel.find().sort({ pinnedAt: -1, sentAt: -1 }).lean(),
    NotificationModel.aggregate<{ _id: mongoose.Types.ObjectId; delivered: number; read: number }>([
      { $match: { sourceId: { $ne: null } } },
      { $group: { _id: "$sourceId", delivered: { $sum: 1 }, read: { $sum: { $cond: ["$read", 1, 0] } } } },
    ]),
  ]);

  const byId = new Map(stats.map((s) => [String(s._id), { delivered: s.delivered, read: s.read }]));
  return notices.map((n) => {
    const st = byId.get(String(n._id)) ?? { delivered: 0, read: 0 };
    return {
      id: String(n._id),
      title: n.title,
      message: n.message,
      category: n.category,
      important: n.important,
      pinned: Boolean(n.pinnedAt),
      sender: n.sender,
      sentAt: n.sentAt.toISOString(),
      audienceLabel: audienceLabel(n.audience),
      audienceKind: n.audience.kind,
      delivered: st.delivered,
      read: st.read,
    };
  });
}

/** Read-receipt detail for one broadcast. */
export async function getNoticeStats(id: string): Promise<{ delivered: number; read: number; readers: string[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const rows = await NotificationModel.find({ sourceId: id }).select("userId read").lean();
  const runnerIds = rows.filter((r) => r.read).map((r) => r.userId);
  const runners = await UserModel.find({ _id: { $in: runnerIds } }).select("name batch").lean();
  return {
    delivered: rows.length,
    read: runnerIds.length,
    readers: runners.map((r) => `${r.name}${r.batch ? ` · ${r.batch}` : ""}`).slice(0, 6),
  };
}

export async function createNotice(input: unknown): Promise<Outcome<{ id: string; delivered: number }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = CreateNoticeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid broadcast." };
  await connectDB();

  const targets = await resolveAudience(parsed.data.audience);
  if (targets.length === 0) return { ok: false, message: "No recipients found for this audience." };

  const doc = await NoticeModel.create({
    title: parsed.data.title,
    message: parsed.data.message,
    category: parsed.data.category,
    important: parsed.data.important,
    audience: {
      kind: parsed.data.audience.kind,
      batchNames: parsed.data.audience.batchNames,
      studentIds: parsed.data.audience.studentIds.filter((id) => mongoose.Types.ObjectId.isValid(id)),
    },
    sender: user.name,
    senderId: new mongoose.Types.ObjectId(user.id),
    sentAt: new Date(),
  });

  const delivered = await fanOut(
    doc._id,
    user.name,
    parsed.data.title,
    parsed.data.message,
    parsed.data.category,
    parsed.data.important,
    targets,
  );
  await writeAudit(user, "broadcast sent", `${parsed.data.title} → ${audienceLabel(parsed.data.audience)} (${delivered})`);

  return { ok: true, id: String(doc._id), delivered };
}

export async function togglePinNotice(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return { ok: false, message: "Broadcast not found." };
  const notice = await NoticeModel.findById(id).lean();
  if (!notice) return { ok: false, message: "Broadcast not found." };
  await NoticeModel.updateOne({ _id: id }, { $set: { pinnedAt: notice.pinnedAt ? null : new Date() } });
  await writeAudit(user, notice.pinnedAt ? "unpinned broadcast" : "pinned broadcast", notice.title);
  return { ok: true };
}

export async function deleteNotice(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return { ok: false, message: "Broadcast not found." };
  const notice = await NoticeModel.findById(id).lean();
  if (!notice) return { ok: false, message: "Broadcast not found." };
  await NoticeModel.deleteOne({ _id: id });
  await NotificationModel.deleteMany({ sourceId: id });
  await writeAudit(user, "deleted broadcast", notice.title);
  return { ok: true };
}

/* ------------------------------ Broadcast ----------------------------- */

/** Groups tab: send one message to a batch — students get it in their hub. */
export async function sendBatchBroadcast(input: unknown): Promise<Outcome<{ id: string; delivered: number }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = SendBroadcastSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Message is required." };
  await connectDB();

  const batch = await BatchModel.findOne({ name: parsed.data.batchName }).lean();
  if (!batch) return { ok: false, message: `Batch "${parsed.data.batchName}" not found.` };

  const targets = await UserModel.find({ role: "student", batch: parsed.data.batchName }).select("_id name").lean();
  if (targets.length === 0) return { ok: false, message: "No students are in this batch yet." };

  const title = `Broadcast — ${batch.name}`;
  const doc = await NoticeModel.create({
    title,
    message: parsed.data.message,
    category: parsed.data.category,
    important: false,
    audience: { kind: "batches", batchNames: [batch.name], studentIds: [] },
    sender: user.name,
    senderId: new mongoose.Types.ObjectId(user.id),
    sentAt: new Date(),
  });

  const delivered = await fanOut(doc._id, user.name, title, parsed.data.message, parsed.data.category, false, targets);
  await writeAudit(user, "broadcast sent", `${title} (${delivered})`);

  return { ok: true, id: String(doc._id), delivered };
}

/* ---------------------------- Connect overview ------------------------ */

export type ConnectOverview = {
  stats: {
    noticesSent: number;
    unreadByStudents: number;
    meetingsUpcoming: number;
    eventsThisMonth: number;
  };
  notices: NoticeSlice[];
  meetings: MeetingRow[];
  batches: BroadcastBatchRow[];
};

/** Dashboard: everything the Connect landing page needs in one call. */
export async function getConnectOverview(): Promise<ConnectOverview> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [noticesSent, unreadByStudents, eventsThisMonth, meetingDocs, notices, batches] = await Promise.all([
    NoticeModel.countDocuments(),
    NotificationModel.countDocuments({ read: false, sourceId: { $ne: null } }),
    CalendarEventModel.countDocuments({ date: { $gte: startOfMonth, $lt: endOfMonth } }),
    MeetingModel.find().sort({ date: 1 }).lean(),
    getNotices(),
    getBroadcastBatches(),
  ]);

  const meetings = meetingDocs.map((m) => toMeetingRow(m));
  const upcoming = meetings
    .filter((m) => !m.ended)
    .sort((a, b) => a.start - b.start);

  return {
    stats: {
      noticesSent,
      unreadByStudents,
      meetingsUpcoming: upcoming.length,
      eventsThisMonth,
    },
    notices: notices.slice(0, 5),
    meetings: upcoming.slice(0, 5),
    batches,
  };
}

/* ------------------------------- Meetings ----------------------------- */

export type MeetingRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  startHour: string;
  endHour: string;
  type: MeetingDoc["type"];
  status: MeetingDoc["status"];
  batchNames: string[];
  link: string;
  security: MeetingDoc["security"];
  ended: boolean;
  start: number;
};

function toMeetingRow(m: MeetingDoc & { _id: mongoose.Types.ObjectId }): MeetingRow {
  const win = meetingWindow(m);
  return {
    id: String(m._id),
    title: m.title,
    description: m.description ?? "",
    date: dayKey(m.date),
    startHour: m.startHour || "09:00",
    endHour: m.endHour || "10:00",
    type: m.type,
    status: m.status,
    batchNames: m.batchNames ?? [],
    link: m.link ?? "",
    security: m.security,
    ended: m.status === "completed" || m.status === "cancelled" || win.end <= Date.now(),
    start: win.start,
  };
}

function newMeetingLink(title: string): string {
  const slug =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "meeting";
  return `https://meet.myedou.com/${slug}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function createMeeting(input: unknown): Promise<Outcome<{ id: string; link: string }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = CreateMeetingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid meeting details." };
  await connectDB();

  const [y, m, d] = parsed.data.date.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return { ok: false, message: "Pick a valid date." };

  const link = newMeetingLink(parsed.data.title);
  const doc = await MeetingModel.create({
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    date,
    startHour: parsed.data.startHour,
    endHour: parsed.data.endHour,
    type: parsed.data.type,
    batchNames: parsed.data.batchNames,
    link,
    security: parsed.data.security,
    status: "upcoming",
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  await writeAudit(user, "scheduled meeting", `${parsed.data.title} (${dayKey(date)}, ${parsed.data.startHour})`);
  return { ok: true, id: String(doc._id), link };
}

export async function listMeetings(): Promise<MeetingRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const docs = await MeetingModel.find().sort({ date: -1, startHour: -1 }).lean();
  return docs.map((m) => toMeetingRow(m));
}

export async function updateMeetingStatus(id: string, status: MeetingDoc["status"]): Promise<Outcome> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return { ok: false, message: "Meeting not found." };
  const meeting = await MeetingModel.findById(id).lean();
  if (!meeting) return { ok: false, message: "Meeting not found." };
  await MeetingModel.updateOne({ _id: id }, { $set: { status } });
  await writeAudit(user, `meeting ${status}`, meeting.title);
  return { ok: true };
}

export async function deleteMeeting(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return { ok: false, message: "Meeting not found." };
  const meeting = await MeetingModel.findById(id).lean();
  if (!meeting) return { ok: false, message: "Meeting not found." };
  await MeetingModel.deleteOne({ _id: id });
  await writeAudit(user, "deleted meeting", meeting.title);
  return { ok: true };
}

/* ---------------------------- Calendar events ------------------------- */

export type CalendarEventRow = {
  id: string;
  title: string;
  date: string;
  day: number;
  time: string;
  type: CalendarEventDoc["type"];
  description: string;
  batchNames: string[];
};

export async function createCalendarEvent(input: unknown): Promise<Outcome<{ id: string }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = CreateCalendarEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid event details." };
  await connectDB();

  const [y, m, d] = parsed.data.date.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return { ok: false, message: "Pick a valid date." };

  const doc = await CalendarEventModel.create({
    title: parsed.data.title,
    date,
    time: parsed.data.time,
    type: parsed.data.type,
    description: parsed.data.description ?? "",
    batchNames: parsed.data.batchNames,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  await writeAudit(user, "created event", `${parsed.data.title} (${dayKey(date)})`);
  return { ok: true, id: String(doc._id) };
}

/** Events for one calendar month ("YYYY-MM"), sorted by day then time. */
export async function listCalendarEvents(month: string): Promise<CalendarEventRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(Date.UTC(year, mon - 1, 1));
  const end = new Date(Date.UTC(year, mon, 1));
  const docs = await CalendarEventModel.find({ date: { $gte: start, $lt: end } }).sort({ date: 1, time: 1 }).lean();
  return docs.map((e) => ({
    id: String(e._id),
    title: e.title,
    date: dayKey(e.date),
    day: e.date.getUTCDate(),
    time: e.time || "10:00",
    type: e.type,
    description: e.description ?? "",
    batchNames: e.batchNames ?? [],
  }));
}

export async function deleteCalendarEvent(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) return { ok: false, message: "Event not found." };
  const ev = await CalendarEventModel.findById(id).lean();
  if (!ev) return { ok: false, message: "Event not found." };
  await CalendarEventModel.deleteOne({ _id: id });
  await writeAudit(user, "deleted event", ev.title);
  return { ok: true };
}
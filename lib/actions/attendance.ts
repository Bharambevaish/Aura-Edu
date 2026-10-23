"use server";

/**
 * Attendance module (daily per-batch registers).
 *
 * One `Attendance` doc per (batch, date): the roster's marks for that day,
 * embedded and matched by studentId. The roster itself is never stored — it is
 * derived at read time from `users.batch` (the exact string join the whole
 * product uses), so students moving batches never leave stale rows behind.
 *
 *  ADMIN/STAFF
 *    getAttendanceOverview  - stats + one line per day for a (batch, month)
 *    getAttendanceRegister  - the day's roster with any stored marks
 *    saveAttendanceRegister - upsert a whole day (generic grid save)
 *
 *  STUDENT
 *    getStudentAttendance   - that student's overall % + history logs
 *
 * Status is a simple three-state mark (present / absent / late); aggregate % is
 * computed at request time, never stored. Everything is live MongoDB data —
 * nothing is hardcoded on the client.
 */

import { connectDB } from "@/lib/db";
import { getBranchScope, scopedStudentIds } from "@/lib/branch-scope";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { Types } from "mongoose";
import { AttendanceModel } from "@/lib/models/Attendance";
import { UserModel } from "@/lib/models/User";
import { SaveAttendanceSchema } from "@/lib/validation";

export type AttendanceStatus = "present" | "absent" | "late";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Local date helpers — registers are keyed by local midnight (same timezone). */
const isoDay = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const dayStart = (iso: string) => new Date(`${iso}T00:00:00`);

const monthRange = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
};

export type AttendanceRegisterRow = {
  studentId: string;
  name: string;
  admissionNo: string;
  rollNo: string;
  status: AttendanceStatus | null;
  checkIn: string;
  remark: string;
};

export type AttendanceRegister = {
  date: string;
  batch: string;
  subject: string;
  /** whether a register already exists for this day (vs a fresh unsaved sheet) */
  saved: boolean;
  rows: AttendanceRegisterRow[];
};

export type AttendanceDaySummary = {
  date: string;
  subject: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number | null;
};

export type AttendanceOverview = {
  batch: string;
  month: string;
  stats: {
    present: number;
    absent: number;
    late: number;
    totalEntries: number;
    daysCovered: number;
    percentage: number | null;
  };
  days: AttendanceDaySummary[];
};

/** Admin/staff: month stats + a per-day line for the selected batch. */
export async function getAttendanceOverview(batch: string, month: string): Promise<AttendanceOverview> {
  await requireRole(["admin", "staff"]);
  const { start, end } = monthRange(month);
  await connectDB();

  // Branch switcher: count only the selected branch's students.
  const ids = await scopedStudentIds(await getBranchScope());
  const inScope = ids ? new Set(ids.map(String)) : null;
  const registers = (
    await AttendanceModel.find({ batch, date: { $gte: start, $lte: end } })
      .sort({ date: 1 })
      .lean()
  ).map((r) => (inScope ? { ...r, entries: r.entries.filter((e) => inScope.has(String(e.studentId))) } : r));

  let present = 0;
  let absent = 0;
  let late = 0;

  const days: AttendanceDaySummary[] = registers.map((r) => {
    let p = 0;
    let a = 0;
    let l = 0;
    for (const e of r.entries) {
      if (e.status === "present") p += 1;
      else if (e.status === "absent") a += 1;
      else l += 1;
    }
    present += p;
    absent += a;
    late += l;
    const total = p + a + l;
    return {
      date: isoDay(r.date),
      subject: r.subject ?? "Regular Session",
      present: p,
      absent: a,
      late: l,
      total,
      percentage: total > 0 ? Math.round((p / total) * 100) : null,
    };
  });

  const totalEntries = present + absent + late;
  return {
    batch,
    month,
    stats: {
      present,
      absent,
      late,
      totalEntries,
      daysCovered: registers.length,
      percentage: totalEntries > 0 ? Math.round((present / totalEntries) * 100) : null,
    },
    days,
  };
}

function mapStoredStatus(status: string | undefined): AttendanceStatus | null {
  if (status === "present" || status === "absent" || status === "late") return status;
  return null;
}

/** Admin/staff: the selected day's roster with any stored marks for that date. */
export async function getAttendanceRegister(batch: string, date: string): Promise<AttendanceRegister> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const scope = await getBranchScope();
  const [students, reg] = await Promise.all([
    UserModel.find({ role: "student", batch, ...scope.students }).sort({ name: 1 }).select("name admissionNo rollNo").lean(),
    AttendanceModel.findOne({ batch, date: dayStart(date) }).lean(),
  ]);

  const byId = new Map<string, AttendanceRegisterRow>();
  for (const e of reg?.entries ?? []) {
    byId.set(String(e.studentId), {
      studentId: String(e.studentId),
      name: "",
      admissionNo: "",
      rollNo: "",
      status: mapStoredStatus(e.status),
      checkIn: e.checkIn ?? "",
      remark: e.remark ?? "",
    });
  }

  return {
    date,
    batch,
    subject: reg?.subject ?? "Regular Session",
    saved: !!reg,
    rows: students.map((s) => {
      const id = String(s._id);
      const stored = byId.get(id);
      return {
        studentId: id,
        name: s.name,
        admissionNo: s.admissionNo ?? "-",
        rollNo: s.rollNo ?? "-",
        status: stored?.status ?? null,
        checkIn: stored?.checkIn ?? "",
        remark: stored?.remark ?? "",
      };
    }),
  };
}

export type AttendanceOutcome = {
  ok: boolean;
  message?: string;
  counts?: { present: number; absent: number; late: number };
};

/** Admin/staff: upsert a whole day's register (generic grid save). */
export async function saveAttendanceRegister(input: unknown): Promise<AttendanceOutcome> {
  const parsed = SaveAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid register details." };
  }

  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();

  const { batch, date, subject, entries } = parsed.data;

  // Branch switcher: only the selected branch's students can be marked here;
  // the other branches' marks on the same register are kept as they are.
  const scope = await getBranchScope();
  const roster = await UserModel.find({ role: "student", batch, ...scope.students }).select("_id").lean();
  if (roster.length === 0) {
    return { ok: false, message: `No students are enrolled in "${batch}" yet — assign students first.` };
  }

  // Drop any studentId the client shouldn't be able to inject (not in the batch).
  const rosterIds = new Set(roster.map((s) => String(s._id)));
  const valid = entries
    .filter((e) => rosterIds.has(e.studentId))
    .map((e) => ({
      studentId: new Types.ObjectId(e.studentId),
      status: e.status,
      checkIn: e.checkIn ?? "",
      remark: e.remark ?? "",
    }));

  let present = 0;
  let absent = 0;
  let late = 0;
  for (const e of valid) {
    if (e.status === "present") present += 1;
    else if (e.status === "absent") absent += 1;
    else late += 1;
  }

  const kept = scope.branch
    ? ((await AttendanceModel.findOne({ batch, date: dayStart(date) }).select("entries").lean())?.entries ?? []).filter(
        (e) => !rosterIds.has(String(e.studentId)),
      )
    : [];

  await AttendanceModel.updateOne(
    { batch, date: dayStart(date) },
    {
      $set: {
        batch,
        date: dayStart(date),
        subject: subject || "Regular Session",
        entries: [...kept, ...valid],
        updatedBy: new Types.ObjectId(user.id),
      },
    },
    { upsert: true },
  );

  await writeAudit(user, "saved attendance", `${batch} · ${date} (P${present}/A${absent}/L${late})`);
  return { ok: true, counts: { present, absent, late } };
}

export type StudentAttendanceLog = {
  id: string;
  date: string;
  day: string;
  batch: string;
  subject: string;
  status: "Present" | "Absent" | "Late";
  checkIn: string;
  remarks: string;
};

export type StudentAttendance = {
  overallPercentage: number;
  present: number;
  absent: number;
  late: number;
  totalSessions: number;
  logs: StudentAttendanceLog[];
};

const emptyAttendance: StudentAttendance = { overallPercentage: 100, present: 0, absent: 0, late: 0, totalSessions: 0, logs: [] };

/** Student: their batch's registers flattened to this student's logs + aggregate. */
export async function getStudentAttendance(): Promise<StudentAttendance> {
  const { user } = await requireRole(["student"]);
  await connectDB();

  const me = await UserModel.findById(user.id).select("batch").lean();
  const batch = me?.batch ?? "";
  if (!batch) return emptyAttendance;

  const registers = await AttendanceModel.find({ batch }).sort({ date: 1 }).lean();

  let present = 0;
  let absent = 0;
  let late = 0;
  const logs: StudentAttendanceLog[] = [];

  for (const r of registers) {
    const mine = r.entries.find((e) => String(e.studentId) === user.id);
    if (!mine) continue;

    if (mine.status === "present") present += 1;
    else if (mine.status === "absent") absent += 1;
    else late += 1;

    logs.push({
      id: `${String(r._id)}-${user.id}`,
      date: `${r.date.getDate()} ${MONTH_ABBR[r.date.getMonth()]} ${r.date.getFullYear()}`,
      day: WEEKDAYS[r.date.getDay()],
      batch,
      subject: r.subject ?? "Regular Session",
      status: mine.status === "present" ? "Present" : mine.status === "absent" ? "Absent" : "Late",
      checkIn: mine.checkIn ?? "",
      remarks: mine.remark ?? "",
    });
  }

  const total = present + absent + late;
  return {
    overallPercentage: total > 0 ? Math.round((present / total) * 100) : 100,
    present,
    absent,
    late,
    totalSessions: total,
    logs: logs.reverse(),
  };
}
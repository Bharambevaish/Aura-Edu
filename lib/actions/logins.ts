"use server";

/**
 * Server actions for the Student Logins tab — real session + login-activity
 * management on the `sessions` and `users` collections.
 *
 * Status semantics (derived, never stored):
 *   Blocked  → users.isBlocked is true (login + access denied by requireRole).
 *   Active   → has at least one live session (active && not expired).
 *   Offline  → otherwise.
 */

import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { SessionModel, type SessionDoc } from "@/lib/models/Session";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";

export type SessionStatus = "Active" | "Offline" | "Blocked";

export interface LoginSessionDTO {
  sessionId: string;
  browser: string;
  os: string;
  deviceType: string;
  ip: string;
  active: boolean;
  startedAt: string;
  expiresAt: string;
}

export interface LoginStudentDTO {
  id: string;
  name: string;
  email: string;
  admissionNo: string;
  status: SessionStatus;
  course: string;
  branch: string;
  batch: string;
  device: { browser: string; os: string; deviceType: string } | null;
  lastLoginAt: string | null;
  activeSessions: number;
  sessions: LoginSessionDTO[];
}

export interface LoginOverview {
  students: LoginStudentDTO[];
  metrics: { active: number; multiDevice: number; blocked: number; total: number };
  generatedAt: string;
}

function toDTO(s: SessionDoc, now: Date): LoginSessionDTO {
  return {
    sessionId: s.sessionId,
    browser: s.device?.browser ?? "N/A",
    os: s.device?.os ?? "N/A",
    deviceType: s.device?.deviceType || "Desktop",
    ip: s.ip || "local",
    active: Boolean(s.active) && s.expiresAt > now,
    startedAt: s.startedAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
  };
}

/** Full overview for the page: every student + their sessions + derived metrics. */
export async function getLoginOverview(): Promise<LoginOverview> {
  await requireRole(["admin"]);
  await connectDB();

  const students = await UserModel.find({ role: "student" }).sort({ name: 1 }).lean();
  const sessions = await SessionModel.find({
    userId: { $in: students.map((s) => s._id) },
  })
    .sort({ startedAt: -1 })
    .lean();

  const now = new Date();
  const byUser = new Map<string, SessionDoc[]>();
  for (const s of sessions) {
    const key = String(s.userId);
    const list = byUser.get(key);
    if (list) list.push(s);
    else byUser.set(key, [s]);
  }

  let active = 0;
  let multiDevice = 0;
  let blocked = 0;

  const out: LoginStudentDTO[] = students.map((st) => {
    const list = byUser.get(String(st._id)) ?? [];
    const live = list.filter((s) => s.active && s.expiresAt > now);
    const status: SessionStatus = st.isBlocked ? "Blocked" : live.length > 0 ? "Active" : "Offline";

    if (st.isBlocked) blocked++;
    if (live.length > 0) active++;
    if (live.length >= 2) multiDevice++;

    const latest = list[0];
    const usableLatest =
      latest && latest.device?.browser && latest.device.browser !== "Other" ? latest.device : st.lastDevice;

    return {
      id: String(st._id),
      name: st.name,
      email: st.email,
      admissionNo: st.admissionNo ?? "-",
      status,
      course: st.course ?? "-",
      branch: st.branch ?? "-",
      batch: st.batch ?? "-",
      device: usableLatest
        ? {
            browser: usableLatest.browser ?? "N/A",
            os: usableLatest.os ?? "N/A",
            deviceType: usableLatest.deviceType || "Desktop",
          }
        : null,
      lastLoginAt: st.lastLoginAt ? st.lastLoginAt.toISOString() : null,
      activeSessions: live.length,
      sessions: list.map((s) => toDTO(s, now)),
    };
  });

  return {
    students: out,
    metrics: { active, multiDevice, blocked, total: out.length },
    generatedAt: now.toISOString(),
  };
}

/** Block an account (prevents future login, deactivates live sessions, bounces on next request). */
export async function toggleBlockUser(
  userId: string,
): Promise<{ ok: boolean; blocked?: boolean; message?: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();

  const student = await UserModel.findById(userId)
    .select("name role isBlocked")
    .lean();
  if (!student || student.role !== "student") {
    return { ok: false, message: "Student not found." };
  }

  const blocked = !student.isBlocked;
  await UserModel.updateOne({ _id: student._id }, { $set: { isBlocked: blocked } });
  if (blocked) {
    await SessionModel.updateMany(
      { userId: student._id, active: true },
      { $set: { active: false } },
    );
  }

  await writeAudit(user, blocked ? "blocked student" : "unblocked student", student.name);
  return {
    ok: true,
    blocked,
    message: blocked ? `${student.name} is now blocked.` : `${student.name} is unblocked.`,
  };
}

/** Sign a student out of every active device. */
export async function forceLogoutUser(
  userId: string,
): Promise<{ ok: boolean; count?: number; message?: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();

  const res = await SessionModel.updateMany(
    { userId, active: true },
    { $set: { active: false } },
  );
  await writeAudit(user, "force-logged-out student", `${userId} (${res.modifiedCount} session(s))`);
  return {
    ok: true,
    count: res.modifiedCount,
    message: `Signed out ${res.modifiedCount} active session(s).`,
  };
}

/** Sign a student out of one specific device/session. */
export async function forceLogoutSession(
  sessionId: string,
): Promise<{ ok: boolean; message?: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();

  const res = await SessionModel.updateOne(
    { sessionId, active: true },
    { $set: { active: false } },
  );
  if (!res.modifiedCount) return { ok: false, message: "Session already ended." };
  await writeAudit(user, "signed out a device", sessionId);
  return { ok: true, message: "Device signed out." };
}
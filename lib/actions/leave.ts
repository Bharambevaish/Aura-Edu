"use server";

/**
 * Leave management. Staff and admins request leave for themselves; admins
 * approve or reject. Allowances (lib/hr.ts) are checked against approved
 * leave in the same calendar year; overlapping requests are refused.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { LeaveRequestModel, type LeaveRequestDoc, type LeaveStatus, type LeaveType } from "@/lib/models/LeaveRequest";
import { LEAVE_ALLOWANCE, LEAVE_LABEL, workingDaysBetween } from "@/lib/hr";
import { LeaveRequestSchema, LeaveDecisionSchema } from "@/lib/validation";

export type LeaveRow = {
  id: string;
  userName: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  decidedByName: string;
  decisionNote: string;
  createdAt: string;
};

export type LeaveBalance = { type: LeaveType; allowance: number | null; used: number; pending: number; remaining: number | null };

type LeaveLean = LeaveRequestDoc & { _id: mongoose.Types.ObjectId };

function toRow(l: LeaveLean): LeaveRow {
  return {
    id: String(l._id),
    userName: l.userName,
    type: l.type,
    from: new Date(l.from).toISOString(),
    to: new Date(l.to).toISOString(),
    days: l.days,
    reason: l.reason ?? "",
    status: l.status,
    decidedByName: l.decidedByName ?? "",
    decisionNote: l.decisionNote ?? "",
    createdAt: new Date(l.createdAt).toISOString(),
  };
}

async function balancesFor(userId: string, year: number): Promise<LeaveBalance[]> {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const rows = await LeaveRequestModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: { $in: ["approved", "pending"] },
    from: { $gte: start, $lt: end },
  })
    .select("type days status")
    .lean();
  return (["casual", "sick", "earned", "unpaid"] as LeaveType[]).map((type) => {
    const used = rows.filter((r) => r.type === type && r.status === "approved").reduce((n, r) => n + r.days, 0);
    const pending = rows.filter((r) => r.type === type && r.status === "pending").reduce((n, r) => n + r.days, 0);
    const allowance = type === "unpaid" ? null : LEAVE_ALLOWANCE[type];
    return { type, allowance, used, pending, remaining: allowance === null ? null : Math.max(0, allowance - used) };
  });
}

/** The signed-in user's balances and requests (this year). */
export async function getMyLeave(): Promise<{ balances: LeaveBalance[]; requests: LeaveRow[] }> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const [balances, requests] = await Promise.all([
    balancesFor(user.id, new Date().getFullYear()),
    LeaveRequestModel.find({ userId: new mongoose.Types.ObjectId(user.id) }).sort({ from: -1 }).limit(50).lean<LeaveLean[]>(),
  ]);
  return { balances, requests: requests.map(toRow) };
}

export type LeaveOutcome = { ok: boolean; message: string };

export async function requestLeave(input: unknown): Promise<LeaveOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = LeaveRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request." };
  const d = parsed.data;
  const from = new Date(`${d.from}T00:00:00`);
  const to = new Date(`${d.to}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) {
    return { ok: false, message: "Pick a valid date range." };
  }
  if (from.getFullYear() !== to.getFullYear()) return { ok: false, message: "Split leave that crosses a new year into two requests." };
  const days = workingDaysBetween(from, to);
  if (days === 0) return { ok: false, message: "That range has no working days (Sundays are off)." };

  await connectDB();
  const me = new mongoose.Types.ObjectId(user.id);
  const overlap = await LeaveRequestModel.findOne({
    userId: me,
    status: { $in: ["pending", "approved"] },
    from: { $lte: to },
    to: { $gte: from },
  }).lean();
  if (overlap) return { ok: false, message: "You already have leave requested for some of those days." };

  if (d.type !== "unpaid") {
    const balance = (await balancesFor(user.id, from.getFullYear())).find((b) => b.type === d.type)!;
    const available = (balance.remaining ?? 0) - balance.pending;
    if (days > available) {
      return { ok: false, message: `Only ${available} ${LEAVE_LABEL[d.type].toLowerCase()} day(s) left this year — request unpaid leave for the rest.` };
    }
  }

  await LeaveRequestModel.create({ userId: me, userName: user.name, type: d.type, from, to, days, reason: d.reason });
  await writeAudit(user, "requested leave", `${LEAVE_LABEL[d.type]} · ${d.from} → ${d.to} (${days} day(s))`);
  return { ok: true, message: `Leave requested for ${days} working day(s).` };
}

export async function cancelMyLeave(id: string): Promise<LeaveOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Request not found." };
  await connectDB();
  const res = await LeaveRequestModel.updateOne(
    { _id: id, userId: new mongoose.Types.ObjectId(user.id), status: "pending" },
    { $set: { status: "cancelled" } },
  );
  if (res.modifiedCount === 0) return { ok: false, message: "Only your own pending requests can be cancelled." };
  await writeAudit(user, "cancelled leave request", id);
  return { ok: true, message: "Request cancelled." };
}

/** Admin: every request (pending first) + headline numbers. */
export async function getLeaveQueue(): Promise<{
  stats: { pending: number; approvedThisMonth: number; onLeaveToday: string[] };
  requests: LeaveRow[];
}> {
  await requireRole(["admin"]);
  await connectDB();
  const rows = await LeaveRequestModel.find().sort({ createdAt: -1 }).limit(200).lean<LeaveLean[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const order: Record<LeaveStatus, number> = { pending: 0, approved: 1, rejected: 2, cancelled: 3 };
  return {
    stats: {
      pending: rows.filter((r) => r.status === "pending").length,
      approvedThisMonth: rows.filter((r) => r.status === "approved" && r.decidedAt && r.decidedAt >= monthStart).length,
      onLeaveToday: rows.filter((r) => r.status === "approved" && r.from <= today && r.to >= today).map((r) => r.userName),
    },
    requests: rows.sort((a, b) => order[a.status] - order[b.status]).map(toRow),
  };
}

/** Admin: approve or reject a pending request. */
export async function decideLeave(id: string, input: unknown): Promise<LeaveOutcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Request not found." };
  const parsed = LeaveDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid decision." };
  await connectDB();
  const leave = await LeaveRequestModel.findOneAndUpdate(
    { _id: id, status: "pending" },
    {
      $set: {
        status: parsed.data.approve ? "approved" : "rejected",
        decidedByName: user.name,
        decidedAt: new Date(),
        decisionNote: parsed.data.note,
      },
    },
    { returnDocument: "after" },
  ).lean<LeaveLean>();
  if (!leave) return { ok: false, message: "This request was already decided." };
  await writeAudit(
    user,
    parsed.data.approve ? "approved leave" : "rejected leave",
    `${leave.userName} · ${LEAVE_LABEL[leave.type]} ${leave.days} day(s)`,
  );
  return { ok: true, message: parsed.data.approve ? "Leave approved." : "Leave rejected." };
}

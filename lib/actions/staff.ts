"use server";

/**
 * Staff Corner (admin-only): staff accounts on the `users` collection
 * (role: "staff") — create, edit, deactivate/reactivate and password reset.
 * What each person teaches is derived from the timetable, never stored twice.
 * New and reset accounts get a one-time password and must change it at first
 * sign-in. Every change is audit-logged.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { randomPassword } from "@/lib/student-accounts";
import { UserModel } from "@/lib/models/User";
import { SessionModel } from "@/lib/models/Session";
import { TimetableSlotModel } from "@/lib/models/TimetableSlot";
import { StaffSchema } from "@/lib/validation";

export type StaffUserDTO = {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string | null;
  monthlySalary: number;
  active: boolean;
  isDemo: boolean;
  lastLoginAt: string | null;
  /** From the timetable. */
  batches: string[];
  classesPerWeek: number;
};

export async function getStaffUsers(): Promise<StaffUserDTO[]> {
  await requireRole(["admin"]);
  await connectDB();
  const [staff, slots] = await Promise.all([
    UserModel.find({ role: "staff" }).sort({ name: 1 }).lean(),
    TimetableSlotModel.find({ teacherId: { $ne: null } }).select("teacherId batch").lean(),
  ]);
  return staff.map((s) => {
    const mine = slots.filter((x) => String(x.teacherId) === String(s._id));
    return {
      id: String(s._id),
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      employeeId: s.employeeId ?? "",
      designation: s.designation ?? "",
      department: s.department ?? "",
      joiningDate: s.joiningDate ? new Date(s.joiningDate).toISOString() : null,
      monthlySalary: s.monthlySalary ?? 0,
      active: !s.isBlocked,
      isDemo: !!s.isDemo,
      lastLoginAt: s.lastLoginAt ? s.lastLoginAt.toISOString() : null,
      batches: [...new Set(mine.map((x) => x.batch))].sort(),
      classesPerWeek: mine.length,
    };
  });
}

export type StaffOutcome = { ok: boolean; message: string; credentials?: { email: string; password: string } };

function toDoc(d: ReturnType<typeof StaffSchema.parse>) {
  const joining = d.joiningDate ? new Date(d.joiningDate) : undefined;
  return {
    name: d.name,
    phone: d.phone || undefined,
    employeeId: d.employeeId || undefined,
    designation: d.designation || undefined,
    department: d.department || undefined,
    joiningDate: joining && !Number.isNaN(joining.getTime()) ? joining : undefined,
    monthlySalary: d.monthlySalary,
  };
}

export async function createStaff(input: unknown): Promise<StaffOutcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = StaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid staff details." };
  await connectDB();
  if (await UserModel.exists({ email: parsed.data.email })) {
    return { ok: false, message: `An account with ${parsed.data.email} already exists.` };
  }
  const password = randomPassword();
  const count = await UserModel.countDocuments({ role: "staff" });
  await UserModel.create({
    ...toDoc(parsed.data),
    email: parsed.data.email,
    employeeId: parsed.data.employeeId || `EMP-${String(count + 101).padStart(4, "0")}`,
    passwordHash: await bcrypt.hash(password, 12),
    role: "staff",
    isDemo: false,
    mustChangePassword: true,
  });
  await writeAudit(user, "created staff account", `${parsed.data.name} (${parsed.data.email})`);
  return { ok: true, message: `${parsed.data.name} added.`, credentials: { email: parsed.data.email, password } };
}

export async function updateStaff(id: string, input: unknown): Promise<StaffOutcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Staff member not found." };
  const parsed = StaffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid staff details." };
  await connectDB();
  const staff = await UserModel.findOne({ _id: id, role: "staff" }).select("email").lean();
  if (!staff) return { ok: false, message: "Staff member not found." };
  if (parsed.data.email !== staff.email && (await UserModel.exists({ email: parsed.data.email, _id: { $ne: id } }))) {
    return { ok: false, message: `An account with ${parsed.data.email} already exists.` };
  }
  await UserModel.updateOne({ _id: id }, { $set: { ...toDoc(parsed.data), email: parsed.data.email } });
  // Keep the teacher's name on their timetable classes in sync.
  await TimetableSlotModel.updateMany({ teacherId: id }, { $set: { teacherName: parsed.data.name } });
  await writeAudit(user, "updated staff account", `${parsed.data.name} (${parsed.data.email})`);
  return { ok: true, message: "Staff details saved." };
}

/** Deactivate (signs them out everywhere, blocks sign-in) or reactivate. */
export async function setStaffActive(id: string, active: boolean): Promise<StaffOutcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Staff member not found." };
  await connectDB();
  const staff = await UserModel.findOne({ _id: id, role: "staff" }).select("name").lean();
  if (!staff) return { ok: false, message: "Staff member not found." };
  await UserModel.updateOne({ _id: id }, { $set: { isBlocked: !active } });
  if (!active) await SessionModel.updateMany({ userId: staff._id, active: true }, { $set: { active: false } });
  await writeAudit(user, active ? "reactivated staff account" : "deactivated staff account", staff.name);
  return { ok: true, message: active ? `${staff.name} can sign in again.` : `${staff.name} is deactivated and signed out.` };
}

/** Issue a new one-time password (forced change at next sign-in). */
export async function resetStaffPassword(id: string): Promise<StaffOutcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Staff member not found." };
  await connectDB();
  const staff = await UserModel.findOne({ _id: id, role: "staff" }).select("name email").lean();
  if (!staff) return { ok: false, message: "Staff member not found." };
  const password = randomPassword();
  await UserModel.updateOne({ _id: id }, { $set: { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true } });
  await SessionModel.updateMany({ userId: staff._id, active: true }, { $set: { active: false } });
  await writeAudit(user, "reset staff password", staff.name);
  return { ok: true, message: `New one-time password issued for ${staff.name}.`, credentials: { email: staff.email, password } };
}

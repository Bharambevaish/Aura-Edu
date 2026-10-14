"use server";

/**
 * Self-service for the signed-in user (admin, staff or student): read own
 * account, update own phone, change own password. The user id always comes
 * from the session.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { UserModel, type Role } from "@/lib/models/User";
import { TimetableSlotModel } from "@/lib/models/TimetableSlot";
import { ChangePasswordSchema, UpdateOwnAccountSchema } from "@/lib/validation";

export type MyAccount = {
  name: string;
  email: string;
  role: Role;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string | null;
  lastLoginAt: string | null;
  /** Weekly classes this person teaches (timetable). */
  classes: { batch: string; dayOfWeek: number; startTime: string; endTime: string; subject: string; room: string }[];
};

export async function getMyAccount(): Promise<MyAccount> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const [doc, slots] = await Promise.all([
    UserModel.findById(user.id).select("name email role phone employeeId designation department joiningDate lastLoginAt").lean(),
    TimetableSlotModel.find({ teacherId: new mongoose.Types.ObjectId(user.id) }).sort({ dayOfWeek: 1, startTime: 1 }).lean(),
  ]);
  return {
    name: doc?.name ?? user.name,
    email: doc?.email ?? user.email,
    role: user.role,
    phone: doc?.phone ?? "",
    employeeId: doc?.employeeId ?? "",
    designation: doc?.designation ?? "",
    department: doc?.department ?? "",
    joiningDate: doc?.joiningDate ? new Date(doc.joiningDate).toISOString() : null,
    lastLoginAt: doc?.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : null,
    classes: slots.map((s) => ({
      batch: s.batch,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subject,
      room: s.room ?? "",
    })),
  };
}

export type AccountOutcome = { ok: boolean; message: string };

export async function updateMyAccount(input: unknown): Promise<AccountOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = UpdateOwnAccountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  await connectDB();
  await UserModel.updateOne({ _id: user.id }, { $set: { phone: parsed.data.phone } });
  return { ok: true, message: "Contact details saved." };
}

/** Any signed-in role: verify the current password, set a new one, clear the forced-change flag. */
export async function changeOwnPassword(input: unknown): Promise<AccountOutcome> {
  const { user } = await requireRole(["admin", "staff", "student"]);
  const parsed = ChangePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid password." };
  await connectDB();
  const doc = await UserModel.findById(user.id).select("passwordHash").lean();
  if (!doc) return { ok: false, message: "Account not found." };
  if (!(await bcrypt.compare(parsed.data.currentPassword, doc.passwordHash))) {
    return { ok: false, message: "Current password is incorrect." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await UserModel.updateOne({ _id: doc._id }, { $set: { passwordHash, mustChangePassword: false } });
  await writeAudit(user, "changed own password", user.email);
  return { ok: true, message: "Password updated." };
}

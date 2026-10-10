"use server";

/**
 * Staff directory used by the Staff Corner page (Administration).
 *
 * Reads the real `users` collection (role: "staff") built by the seed —
 * a light, auth-level data read (no separate staff collection yet).
 * Requiring admin keeps the staff roster an admin-only view.
 */

import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";

export type StaffUserDTO = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  batch?: string;
  isDemo?: boolean;
  lastLoginAt?: string | null;
};

export async function getStaffUsers(): Promise<StaffUserDTO[]> {
  await requireRole(["admin"]);
  await connectDB();

  const staff = await UserModel.find({ role: "staff" }).sort({ name: 1 }).lean();

  return staff.map((s) => ({
    id: String(s._id),
    name: s.name,
    email: s.email,
    employeeId: s.employeeId ?? "—",
    batch: s.batch,
    isDemo: s.isDemo,
    lastLoginAt: s.lastLoginAt ? s.lastLoginAt.toISOString() : null,
  }));
}
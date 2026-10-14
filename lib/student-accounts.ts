/**
 * Shared helpers for creating student accounts (Student Corner, import, lead
 * conversion). Server-only; the "use server" action files may only export
 * async functions, so plain helpers live here.
 */
import "server-only";
import { UserModel } from "@/lib/models/User";

/** Random one-time password, e.g. "KfR8mQ2x@HTWZ" (no look-alike characters). */
export function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const rnd = new Uint8Array(12);
  crypto.getRandomValues(rnd);
  for (const b of rnd) out += chars[b % chars.length];
  return `${out.slice(0, 8)}@${out.slice(8).toUpperCase()}`;
}

/** Generates the next ADM-YYYY-#### admission number (rough but monotonic). */
export async function nextAdmissionNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await UserModel.countDocuments({ role: "student" });
  return `ADM-${year}-${String(1000 + count + 1).padStart(4, "0")}`;
}

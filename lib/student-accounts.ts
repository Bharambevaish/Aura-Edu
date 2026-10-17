/**
 * Shared helpers for creating student accounts (Student Corner, import, lead
 * conversion). Server-only; the "use server" action files may only export
 * async functions, so plain helpers live here.
 */
import "server-only";
import { UserModel } from "@/lib/models/User";
import { nextDocNo } from "@/lib/doc-numbers";

// Lives in a plain module so CLI scripts (setup:institute) can use it too.
export { randomPassword } from "@/lib/password";

/** Next ADM-YYYY-#### admission number; generated ones start at 1001. */
export async function nextAdmissionNo(): Promise<string> {
  return nextDocNo(UserModel, "admissionNo", `ADM-${new Date().getFullYear()}-`, 4, 1001);
}

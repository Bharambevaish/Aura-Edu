/**
 * Append-only audit trail (AuditLog collection), shared by every module that
 * records money or account changes — finance, leads/admissions, conversions.
 * Server-only: called from server actions after their own role check.
 */
import "server-only";
import mongoose from "mongoose";
import { AuditLogModel } from "@/lib/models/AuditLog";
import type { SessionUser } from "@/lib/dal";

const SYSTEM_USER_ID = "000000000000000000000001";

async function nextEventNo(): Promise<string> {
  const count = await AuditLogModel.countDocuments();
  return `AUD-${String(count + 1).padStart(4, "0")}`;
}

/** Record an action performed by a signed-in user. */
export async function writeAudit(user: SessionUser, action: string, target: string): Promise<void> {
  await AuditLogModel.create({
    eventNo: await nextEventNo(),
    userId: new mongoose.Types.ObjectId(user.id),
    userName: user.name,
    userRole: user.role,
    action,
    target,
    ip: "-",
    isSystem: false,
  });
}

/** Record an action with no signed-in actor (sync jobs, public admission form). */
export async function writeSystemAudit(action: string, target: string): Promise<void> {
  await AuditLogModel.create({
    eventNo: await nextEventNo(),
    userId: new mongoose.Types.ObjectId(SYSTEM_USER_ID),
    userName: "System",
    userRole: "System",
    action,
    target,
    ip: "-",
    isSystem: true,
  });
}

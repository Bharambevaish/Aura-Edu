/**
 * Server-side session registry — the revocation layer behind the Auth.js JWT.
 *
 * The JWT alone cannot be revoked before it expires, so every sign-in also
 * writes a `sessions` row and the JWT carries its `sessionId`. `requireRole()`
 * (lib/dal.ts) re-validates that row and the user on every request, which is
 * what makes Block / Force logout / account deletion take effect immediately.
 */
import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { UserModel, type Role } from "@/lib/models/User";
import { SessionModel } from "@/lib/models/Session";
import { parseUA } from "@/lib/ua";

/** Single source of truth for session lifetime (JWT maxAge and session rows). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** lastSeenAt is refreshed at most this often, to avoid a write per request. */
const HEARTBEAT_MS = 5 * 60 * 1000;

/**
 * Login gate. Auth.js also exposes POST /api/auth/callback/credentials, which
 * would let a client skip the `login` server action and with it the rate
 * limiter + lockout. The action passes this secret-derived token and
 * `authorize()` rejects any attempt without it.
 */
export function loginGateToken(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  return createHmac("sha256", secret).update("auraedu:login-gate").digest("hex");
}

export function isValidLoginGate(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const expected = Buffer.from(loginGateToken());
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Record a successful sign-in; returns the new sessionId for the JWT. */
export async function createLoginSession(input: {
  userId: string;
  email: string;
  userAgent: string | null;
  ip: string;
}): Promise<string> {
  await connectDB();
  const now = new Date();
  const sessionId = randomUUID();
  const device = parseUA(input.userAgent);

  await SessionModel.create({
    sessionId,
    userId: new mongoose.Types.ObjectId(input.userId),
    email: input.email,
    device,
    ip: input.ip,
    active: true,
    startedAt: now,
    lastSeenAt: now,
    expiresAt: new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000),
  });
  await UserModel.updateOne(
    { _id: input.userId },
    { $set: { lastLoginAt: now, lastDevice: device } },
  );
  return sessionId;
}

/** Mark one session as ended (user logout). */
export async function endSession(sessionId: string): Promise<void> {
  await connectDB();
  await SessionModel.updateOne({ sessionId, active: true }, { $set: { active: false } });
}

export type AccessCheck = { name: string; email: string; role: Role; mustChangePassword: boolean };

/**
 * Is this (user, session) pair still allowed in? Returns the user's *current*
 * identity from the DB (so role changes apply without re-login), or null when
 * the user is gone or blocked, or the session is missing, ended or expired.
 */
export async function checkAccess(userId: string, sessionId: string | undefined): Promise<AccessCheck | null> {
  if (!sessionId || !mongoose.isValidObjectId(userId)) return null;
  await connectDB();

  const [user, session] = await Promise.all([
    UserModel.findById(userId).select("name email role isBlocked mustChangePassword").lean(),
    SessionModel.findOne({ sessionId, userId }).select("active expiresAt lastSeenAt").lean(),
  ]);

  const now = Date.now();
  if (!user || user.isBlocked) return null;
  if (!session || !session.active || session.expiresAt.getTime() <= now) return null;

  if (now - session.lastSeenAt.getTime() > HEARTBEAT_MS) {
    // Best-effort heartbeat for the Logins screen; never blocks the request.
    SessionModel.updateOne({ sessionId }, { $set: { lastSeenAt: new Date(now) } }).catch(() => {});
  }

  return { name: user.name, email: user.email, role: user.role, mustChangePassword: !!user.mustChangePassword };
}

/** End every active session of a user (Block, erase); they are signed out on their next request. */
export async function endAllSessions(userId: string): Promise<number> {
  await connectDB();
  const res = await SessionModel.updateMany({ userId, active: true }, { $set: { active: false } });
  return res.modifiedCount;
}

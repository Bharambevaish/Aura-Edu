"use server";

/**
 * Server actions for authentication (login / logout).
 *
 * Auth trust model:
 *  - `login` validates + rate-limits, then delegates to Auth.js `signIn`
 *    (same action the /login page form posts to — one place, one policy).
 *  - Every internal gate re-checks the session/role from the server side via
 *    lib/dal.ts `requireRole`; these actions never trust the client.
 *
 * Demo-day reset lives in its own file (lib/actions/demo.ts) so auth keeps a
 * single, reviewable responsibility.
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import { endSession, loginGateToken } from "@/lib/session-registry";
import { canAccessPath } from "@/lib/permissions";
import type { Role } from "@/lib/models/User";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { LoginSchema, type LoginState } from "@/lib/validation";
import {
  checkRateLimit,
  recordFailure,
  clearRateLimit,
  MAX_ATTEMPTS,
  LOCK_MS,
} from "@/lib/rate-limit";

/**
 * Build the rate-limit identity for the current request: best-effort client
 * IP from the reverse/proxy headers, combined with the target email so one
 * bot cannot lock out every account by guessing across emails a priori.
 */
async function identityFor(email: string): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || // Vercel/nginx style
    h.get("x-real-ip") ||
    "local";
  return `${email}|${ip}`;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const { email, password } = validated.data;
  const identity = await identityFor(email);

  // Brute-force gate — reject early and generically (one indexed lookup in the
  // shared limiter), so attackers cannot even reach bcrypt while locked.
  const limit = await checkRateLimit(identity);
  if (!limit.ok) {
    return {
      message: `Too many failed attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  await connectDB();

  try {
    await signIn("credentials", { email, password, gate: loginGateToken(), redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Blocked accounts get a direct, honest message (no attempt counting —
      // it's an admin decision, not a brute-force failure).
      const user = await UserModel.findOne({ email }).select("failedAttempts isBlocked").lean();
      if (user?.isBlocked) {
        return { message: "This account is temporarily blocked. Contact your institute." };
      }

      // Track the failure in the shared limiter (active lockout) and on the user doc
      // (light audit trail that survives restarts).
      await recordFailure(identity);
      const nextFails = (user?.failedAttempts ?? 0) + 1;
      const userLocked = nextFails >= MAX_ATTEMPTS;
      await UserModel.updateOne(
        { email },
        {
          $inc: { failedAttempts: 1 },
          // Reflect the limiter lockout as an absolute timestamp so the doc
          // tells a coherent story; cleared again on a successful login.
          $set: { lockoutUntil: userLocked ? new Date(Date.now() + LOCK_MS) : null },
        },
      );

      // Generic message regardless of the real cause (wrong password vs.
      // unknown email) — never leak which.
      return { message: "Invalid email or password." };
    }
    // Unrecognized error shape (e.g. MongoDB hiccup): let it propagate so it
    // surfaces in logs/error UI instead of being swallowed.
    throw error;
  }

  // Success: reset the limiter + the audit counters for this identity.
  await clearRateLimit(identity);
  await UserModel.updateOne(
    { email },
    { $set: { failedAttempts: 0, lockoutUntil: null } },
  );

  // Send the user to the portal matching their role. The redirect target is
  // derived server-side from the DB — never taken from a client parameter.
  const user = await UserModel.findOne({ email }).select("role").lean();
  const role = (user?.role ?? "student") as Role;
  const home = role === "student" ? "/student-portal" : "/admin-dashboard";
  const destination = safeCallback(formData.get("callbackUrl"), role) ?? home;

  redirect(destination);
}

/**
 * Accept a post-login redirect only if it is a local path inside the user's
 * own portal and allowed for their role — never an absolute or
 * protocol-relative URL (open-redirect protection).
 */
function safeCallback(value: FormDataEntryValue | null, role: Role): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  const path = value.split(/[?#]/)[0];
  if (role === "student") return path === "/student-portal" || path.startsWith("/student-portal/") ? value : null;
  const inDashboard = path === "/admin-dashboard" || path.startsWith("/admin-dashboard/");
  return inDashboard && canAccessPath(role, path) ? value : null;
}

export async function logoutAction(): Promise<void> {
  // End the server-side session row too, so the Logins screen shows it closed.
  const session = await auth();
  if (session?.user?.sessionId) await endSession(session.user.sessionId);
  await signOut({ redirect: false });
  redirect("/login");
}
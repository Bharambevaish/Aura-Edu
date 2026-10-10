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
import { signIn, signOut } from "@/auth";
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

  // Brute-force gate — reject early, generically, without touching the DB, so
  // attackers cannot even reach bcrypt while an identity is locked.
  const limit = checkRateLimit(identity);
  if (!limit.ok) {
    return {
      message: `Too many failed attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  await connectDB();

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      // Blocked accounts get a direct, honest message (no attempt counting —
      // it's an admin decision, not a brute-force failure).
      const user = await UserModel.findOne({ email }).select("failedAttempts isBlocked").lean();
      if (user?.isBlocked) {
        return { message: "This account is temporarily blocked. Contact your institute." };
      }

      // Track the failure in memory (active lockout) and on the user doc
      // (light audit trail that survives restarts).
      recordFailure(identity);
      const nextFails = (user?.failedAttempts ?? 0) + 1;
      const userLocked = nextFails >= MAX_ATTEMPTS;
      await UserModel.updateOne(
        { email },
        {
          $inc: { failedAttempts: 1 },
          // Reflect the in-memory lockout as an absolute timestamp so the doc
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
  clearRateLimit(identity);
  await UserModel.updateOne(
    { email },
    { $set: { failedAttempts: 0, lockoutUntil: null } },
  );

  // Send the user to the portal matching their role. The redirect target is
  // derived server-side from the DB — never taken from a client parameter.
  const user = await UserModel.findOne({ email }).select("role").lean();
  const destination = user?.role === "student" ? "/student-portal" : "/admin-dashboard";

  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/login");
}
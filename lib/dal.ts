/**
 * DAL (Data Access Layer) — the request-side choke points for auth.
 *
 * Every layout, page and server action that needs "who am I?" goes through
 * here instead of calling next-auth directly. Centralizing has two payoffs:
 *  1. One place to change policy (session shape, redirect targets, role rules).
 *  2. Server components are cached per-request by React's `cache()`, so the
 *     JWT cookie is decoded at most once per HTTP request even if several
 *     components/actions ask for the user.
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Role } from "@/lib/models/User";
import { checkAccess } from "@/lib/session-registry";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Returns the Auth.js session (reads the signed JWT cookie). Memoized
 * per-request via React `cache()` — see file header.
 */
export const getSession = cache(async () => {
  return await auth();
});

/**
 * DB re-validation of the signed-in session, memoized per request so several
 * gates in one render cost a single round-trip.
 */
const getAccess = cache(async (userId: string, sessionId: string | undefined) => {
  return checkAccess(userId, sessionId);
});

/**
 * The universal authorization gate. Usage:
 *
 *   const { user } = await requireRole(["admin", "staff"]);
 *
 * Fails closed:
 *  - no session                         -> redirect to /login
 *  - session revoked, expired, user
 *    blocked or deleted (checked in DB) -> redirect to /session-ended, which
 *                                          clears the cookie, then /login
 *  - wrong role (role read from the DB) -> redirect to "/"
 *
 * The JWT is only trusted to say *which* session this is; whether that session
 * is still allowed in — and with which role — is decided by the database on
 * every request, so Block / Force logout take effect immediately.
 */
export async function requireRole(
  roles: Role[],
): Promise<{ user: SessionUser }> {
  const session = await getSession();
  const token = session?.user;

  if (!token?.email || !token.id) {
    redirect("/login");
  }

  const access = await getAccess(token.id, token.sessionId);
  if (!access) {
    redirect("/session-ended");
  }

  if (!roles.includes(access.role)) {
    redirect("/");
  }

  return {
    user: {
      id: token.id,
      name: access.name,
      email: access.email,
      role: access.role,
    },
  };
}

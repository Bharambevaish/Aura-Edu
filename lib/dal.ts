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
 * The universal authorization gate. Usage:
 *
 *   const { user } = await requireRole(["admin", "staff"]);
 *
 * Fails closed:
 *  - no session            -> redirect to /login
 *  - session, wrong role    -> redirect to "/"
 *
 * Redirect (not throw/403) is deliberate for this app: it gives demo visitors
 * the same clean UX as a real product while the data actions behind these
 * gates are also individually role-checked, so nothing leaks on partial
 * renders.
 */
export async function requireRole(
  roles: Role[],
): Promise<{ user: SessionUser }> {
  const session = await getSession();
  const user = session?.user;

  if (!user?.email) {
    redirect("/login");
  }

  const role = user.role ?? "student";
  if (!roles.includes(role)) {
    redirect("/");
  }

  return {
    user: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      role,
    },
  };
}
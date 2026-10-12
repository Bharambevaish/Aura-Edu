import { signOut } from "@/auth";

/**
 * Landing point when requireRole() finds the session revoked (force logout),
 * the account blocked/deleted, or the session expired. Clears the Auth.js
 * cookie here (route handlers may write cookies; layouts may not) and sends
 * the user to /login. Without this, /login would bounce a still-cookied user
 * back to their portal (proxy.ts) and loop.
 */
export async function GET() {
  await signOut({ redirectTo: "/login?reason=session-ended" });
}

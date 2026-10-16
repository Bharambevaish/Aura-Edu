/**
 * DEMO_MODE switch, read on the server at request time (never baked into the
 * client bundle). Only the exact value "true" (any case) turns it on, so a
 * client institute's deployment is a real install unless someone opts in.
 *
 * When on: one-click demo logins on /login, the demo banner and the admin's
 * "Reset demo data" button. When off, `resetDemoData()` refuses server-side.
 */
export function isDemoMode(env: Record<string, string | undefined> = process.env): boolean {
  return env.DEMO_MODE?.trim().toLowerCase() === "true";
}

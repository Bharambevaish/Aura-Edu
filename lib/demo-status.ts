/**
 * Is the demo data loaded? (server-only, DEMO_MODE deployments)
 *
 * A demo deployment whose database was never seeded answers every login,
 * including the one-click buttons, with "Invalid email or password", which
 * looks like a broken login. The login page and /api/health use this to say
 * what is really wrong. The demo accounts are public, so reporting whether
 * they exist reveals nothing.
 */
import "server-only";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";

export const DEMO_ADMIN_EMAIL = "admin@demo.auraedu.com";

export type DemoDataStatus = "ready" | "missing" | "unknown";

/** Never hold up the login page for long: answer "unknown" after this. */
const CHECK_TIMEOUT_MS = 3_000;

export async function demoDataStatus(): Promise<DemoDataStatus> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async (): Promise<DemoDataStatus> => {
        await connectDB();
        return (await UserModel.exists({ email: DEMO_ADMIN_EMAIL })) ? "ready" : "missing";
      })(),
      new Promise<DemoDataStatus>((resolve) => {
        timer = setTimeout(() => resolve("unknown"), CHECK_TIMEOUT_MS);
      }),
    ]);
  } catch {
    // Database unreachable: /api/health reports that separately.
    return "unknown";
  } finally {
    clearTimeout(timer);
  }
}

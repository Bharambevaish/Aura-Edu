/**
 * GET /api/admin/export — "Download all institute data" (Settings → Security).
 *
 * Streams every collection as one JSON file (relaxed EJSON documents) so an
 * institute can take its data with it. Admin only. The proxy matcher skips
 * /api/, so the session is checked here the same way requireRole() does it:
 * signed JWT for which session, then the database for whether that session
 * and its admin role are still valid.
 *
 * Excluded (see lib/backup.ts): the sessions collection and any other
 * session / `__Secure` / rate-limit store, and passwordHash, password and
 * *token / *secret fields at any depth. This is a data export, not a backup:
 * restore uses `npm run backup` folders, which keep everything.
 *
 * One JSON file instead of a ZIP: a ZIP needs a new dependency (or a
 * hand-written zip encoder) and buys only compression; the browser download
 * plus any zip tool covers that.
 */
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { checkAccess } from "@/lib/session-registry";
import { exportChunks, backupStamp } from "@/lib/backup";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const deny = (status: number, message: string) =>
  Response.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const token = (await auth())?.user;
  if (!token?.id || !token.email) return deny(401, "Sign in first.");
  const access = await checkAccess(token.id, token.sessionId);
  if (!access) return deny(401, "Your session has ended. Sign in again.");
  if (access.role !== "admin") return deny(403, "Only an admin can export institute data.");

  const conn = (await connectDB()).connection;
  const user = { id: token.id, name: access.name, email: access.email, role: access.role, mustChangePassword: access.mustChangePassword };
  const now = new Date();
  // Recorded before streaming: a download that is cancelled half-way was still started.
  await writeAudit(user, "exported all institute data", `${conn.db!.databaseName} (download)`);

  const chunks = exportChunks(conn, { now });
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await chunks.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (error) {
        console.error("[export] failed:", error instanceof Error ? error.message : error);
        controller.error(error);
      }
    },
    async cancel() {
      await chunks.return(undefined);
    },
  });

  const filename = `auraedu-export-${backupStamp(now)}.json`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

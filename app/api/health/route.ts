/**
 * GET /api/health — uptime check for Vercel / monitors.
 *
 * 200 `{ ok: true, db: "up" }` after a database ping, otherwise 503
 * `{ ok: false }`. Deliberately says nothing else: no host, database name or
 * error text (the cause goes to the server log only). Not cached. The proxy
 * matcher skips /api/, so no session or CSP work runs here.
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";

/** Fail fast instead of hanging the function on an unreachable cluster. */
const PING_TIMEOUT_MS = 5_000;

const json = (body: object, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      (async () => {
        await connectDB();
        await mongoose.connection.db!.admin().command({ ping: 1 });
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("database ping timed out")), PING_TIMEOUT_MS);
      }),
    ]);
    return json({ ok: true, db: "up" }, 200);
  } catch (error) {
    console.error("[health] database check failed:", error instanceof Error ? error.message : error);
    return json({ ok: false }, 503);
  } finally {
    clearTimeout(timer);
  }
}

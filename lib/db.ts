/**
 * MongoDB connection helper (mongoose).
 *
 * Next.js hot-reloads modules in dev, which would open a new connection pool
 * on every import. This module reuses a single cached connection (attached to
 * `globalThis` so it survives module reloads) and hands out the same promise
 * to every pending caller — the standard pattern for App Router projects.
 *
 * Connection string source: `MONGODB_URI` (see .env / .env.example). Local
 * dev uses a memory/port server via `npm run mongo`; swap the URI for the
 * Atlas string to go live (nothing else changes).
 *
 * Database name: the URI path (`.../AuraEdu?...`), else MONGODB_DB, else
 * "auraedu". Passing a `dbName` that differs from the URI only in case is a
 * hard error on Atlas, so the URI always wins.
 */
import mongoose from "mongoose";
import { resolveDbName, uriPlaceholderProblem } from "@/lib/mongo-uri";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

/** Global so the cache survives Vite/Next dev hot-reloads. */
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  // Already connected: return the live connection.
  if (cached.conn) return cached.conn;

  // Not connected yet, but a connect attempt is in flight: share that promise
  // so concurrent callers don't each open their own pool.
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing. Copy .env.example to .env and paste your Atlas connection string.",
      );
    }
    const placeholder = uriPlaceholderProblem(MONGODB_URI);
    if (placeholder) throw new Error(placeholder);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: resolveDbName(MONGODB_URI, process.env.MONGODB_DB),
        // Don't buffer model operations while connecting — fail fast in dev
        // instead of hanging a request on an unconfigured database.
        bufferCommands: false,
        // Give up on an unreachable cluster in 10s (driver default 30s) so a
        // request fails with a clear message instead of hanging the function.
        // A serverSelectionTimeoutMS in the URI itself still wins.
        ...(/[?&]serverSelectionTimeoutMS=/i.test(MONGODB_URI) ? {} : { serverSelectionTimeoutMS: 10_000 }),
      })
      .catch((error) => {
        // Forget the failed attempt so the next request retries instead of
        // a warm serverless instance failing until it is recycled.
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
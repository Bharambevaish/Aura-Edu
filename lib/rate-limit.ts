/**
 * Shared brute-force / abuse protection, backed by MongoDB.
 *
 * Keeps a window of failed attempts per identity (login: email + IP; public
 * forms: IP) and locks the identity out after too many failures. Buckets live
 * in the `ratelimits` collection (lib/models/RateLimit.ts), so every Vercel
 * function instance sees the same count and the "5 attempts, then a 15-minute
 * lock" rule holds no matter which instance serves a request. A TTL index
 * removes buckets once their window and lock have both passed.
 *
 * Layout:
 *  - `checkBucket` / `applyFailure` are the pure rules (bucket + now → verdict
 *    / next bucket), unit-tested without a database.
 *  - `checkRateLimit` / `recordFailure` / `clearRateLimit` are the async,
 *    DB-backed API the server actions call. `recordFailure` is ONE atomic
 *    updateOne (upsert + update pipeline) that expresses the same rules
 *    as `applyFailure`, so parallel failures on different instances can't
 *    both read "4" and both write "5"; Mongo serializes updates to one doc.
 *    tests/integration/rate-limit.db.test.ts checks the pipeline against the
 *    pure rules step by step.
 *
 * Fails OPEN: if the database is unreachable the limiter allows the attempt
 * and logs a warning rather than locking everyone out. Login can't succeed
 * without the database anyway, so this opens no real brute-force path.
 *
 * Known limit: check-then-record is not a reservation, so a burst of parallel
 * attempts that all pass `checkRateLimit` before any failure lands are all
 * tried; the lock still engages right after the burst.
 *
 * This file intentionally has NO "use server" directive: it exposes plain
 * constants + functions and is only imported from server code, so it never
 * reaches the client.
 */
import { connectDB } from "@/lib/db";
import { RateLimitModel } from "@/lib/models/RateLimit";

/** Max failed attempts before the identity is locked out. */
export const MAX_ATTEMPTS = 5;

/** Window: attempts are counted across 10 minutes from the first failure. */
export const WINDOW_MS = 10 * 60 * 1000;

/** Lock duration after the attempt limit is hit. */
export const LOCK_MS = 15 * 60 * 1000;

export type Bucket = {
  /** Number of failures recorded inside the current window. */
  count: number;
  /** Timestamp (ms) after which the window resets; failure 1 sets it. */
  resetAt: number;
  /** Timestamp (ms) until which the identity is blocked, if locked out. */
  lockedUntil: number | null;
};

/**
 * Result of checking an identity before an attempt.
 * `ok: false` always comes with `retryAfterSeconds` (the caller is locked out).
 */
export type RateLimitCheck = {
  ok: boolean;
  retryAfterSeconds?: number;
};

// ---------------------------------------------------------------------------
// Pure rules
// ---------------------------------------------------------------------------

/** Is this bucket locked at `now`? No bucket, an expired lock or an expired window all mean free. */
export function checkBucket(bucket: Bucket | null, now: number): RateLimitCheck {
  if (bucket && bucket.lockedUntil !== null && now < bucket.lockedUntil) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }
  return { ok: true };
}

/**
 * The bucket after one more failure at `now`:
 *  - still locked → unchanged (the lock timestamp is never extended);
 *  - no bucket or window expired → a fresh window with count 1;
 *  - otherwise count + 1, and reaching MAX_ATTEMPTS locks for LOCK_MS and
 *    restarts the window so the count can't spill into the next one.
 */
export function applyFailure(bucket: Bucket | null, now: number): Bucket {
  if (bucket && bucket.lockedUntil !== null && now < bucket.lockedUntil) return bucket;
  if (!bucket || now > bucket.resetAt) {
    return { count: 1, resetAt: now + WINDOW_MS, lockedUntil: null };
  }
  const count = bucket.count + 1;
  if (count >= MAX_ATTEMPTS) {
    return { count, resetAt: now + WINDOW_MS, lockedUntil: now + LOCK_MS };
  }
  return { count, resetAt: bucket.resetAt, lockedUntil: null };
}

// ---------------------------------------------------------------------------
// DB-backed API
// ---------------------------------------------------------------------------

function failOpen(action: string, error: unknown): void {
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(`[rate-limit] ${action} failed, allowing the attempt (fail open): ${reason}`);
}

/**
 * Ask whether an identity is currently locked out.
 * Returns `ok: true` when free to attempt, including when the DB is down.
 */
export async function checkRateLimit(key: string, now: number = Date.now()): Promise<RateLimitCheck> {
  try {
    await connectDB();
    const doc = await RateLimitModel.findOne({ key }).select("count resetAt lockedUntil").lean();
    const bucket: Bucket | null = doc
      ? {
          count: doc.count,
          resetAt: new Date(doc.resetAt).getTime(),
          lockedUntil: doc.lockedUntil ? new Date(doc.lockedUntil).getTime() : null,
        }
      : null;
    return checkBucket(bucket, now);
  } catch (error) {
    failOpen("check", error);
    return { ok: true };
  }
}

/**
 * The `applyFailure` rules as an update pipeline, so read-decide-write happens
 * inside one atomic single-document update on the server. Missing fields (a
 * fresh upsert) are normalized to null; null sorts below every date, so
 * "now < null" is false (not locked) and "now > null" is true (window over).
 */
function failurePipeline(now: number) {
  const at = new Date(now);
  return [
    {
      $set: {
        _locked: { $lt: [at, { $ifNull: ["$lockedUntil", null] }] },
        _fresh: { $gt: [at, { $ifNull: ["$resetAt", null] }] },
      },
    },
    {
      $set: {
        count: {
          $cond: ["$_locked", "$count", { $cond: ["$_fresh", 1, { $add: ["$count", 1] }] }],
        },
      },
    },
    {
      $set: {
        _lockNow: {
          $and: [{ $not: ["$_locked"] }, { $not: ["$_fresh"] }, { $gte: ["$count", MAX_ATTEMPTS] }],
        },
      },
    },
    {
      $set: {
        resetAt: {
          $cond: [
            "$_locked",
            "$resetAt",
            { $cond: [{ $or: ["$_fresh", "$_lockNow"] }, new Date(now + WINDOW_MS), "$resetAt"] },
          ],
        },
        lockedUntil: {
          $cond: ["$_locked", "$lockedUntil", { $cond: ["$_lockNow", new Date(now + LOCK_MS), null] }],
        },
      },
    },
    // $max ignores null, so this is resetAt unless a later lock is active.
    { $set: { expiresAt: { $max: ["$resetAt", "$lockedUntil"] } } },
    { $unset: ["_locked", "_fresh", "_lockNow"] },
  ];
}

/**
 * Record a failed attempt (or, for the public forms, an accepted submission).
 * On a DB error the failure is dropped with a warning (fail open).
 */
export async function recordFailure(key: string, now: number = Date.now()): Promise<void> {
  try {
    await connectDB();
    const run = () =>
      RateLimitModel.updateOne({ key }, failurePipeline(now), { upsert: true, updatePipeline: true });
    try {
      await run();
    } catch (error) {
      // Two first-ever failures for one key can race to insert; the unique
      // index rejects the loser, whose retry then updates the winner's doc.
      if ((error as { code?: number }).code !== 11000) throw error;
      await run();
    }
  } catch (error) {
    failOpen("record", error);
  }
}

/** Called after a successful login so a clean identity starts fresh. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await connectDB();
    await RateLimitModel.deleteOne({ key });
  } catch (error) {
    failOpen("clear", error);
  }
}

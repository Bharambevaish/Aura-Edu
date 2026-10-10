/**
 * In-memory brute-force protection for the credentials login.
 *
 * Keeps a sliding window of failed attempts per (email + IP) identity and
 * temporarily locks the identity out after too many consecutive failures.
 *
 * Scope note (POC):
 *  - State lives in a plain Map, so it resets on process restart and does not
 *    scale across Vercel serverless instances. For a single-node local dev
 *    server (how the demo runs) this is the right trade-off.
 *  - The upgrade path to a distributed store is to swap these functions for a
 *    similar API backed by Upstash Redis / a Mongo collection.
 *
 * This file intentionally has NO "use server" directive: it exposes plain
 * constants + sync functions and is only ever imported from server code
 * (lib/actions/auth.ts `"use server"`), so it never reaches the client.
 */

/** Max failed attempts before the identity is locked out. */
export const MAX_ATTEMPTS = 5;

/** Sliding window: attempts are counted across a rolling 10 minutes. */
export const WINDOW_MS = 10 * 60 * 1000;

/** Lock duration after the attempt limit is hit. */
export const LOCK_MS = 15 * 60 * 1000;

type Bucket = {
  /** Number of failures recorded inside the current window. */
  count: number;
  /** Timestamp after which the window resets; failure 1 sets it. */
  resetAt: number;
  /** Timestamp until which the identity is blocked, if locked out. */
  lockedUntil: number | null;
};

const buckets = new Map<string, Bucket>();

/**
 * Result of checking an identity before attempting a login.
 * `ok: false` together with `retryAfterSeconds` means the caller is locked out.
 * `ok: false` without retryAfterSeconds means the window simply has no history
 * yet — i.e. it is allowed to proceed (see `checkLimit`).
 */
export type RateLimitCheck = {
  ok: boolean;
  retryAfterSeconds?: number;
};

/**
 * Ask whether an identity is currently locked out.
 * Returns `ok: true` when free to attempt (including the "no history" case).
 */
export function checkRateLimit(key: string): RateLimitCheck {
  const bucket = buckets.get(key);
  if (!bucket) return { ok: true };

  const now = Date.now();

  // Locked out: block until the lock expires.
  if (bucket.lockedUntil !== null && now < bucket.lockedUntil) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  // Lock expired: drop the bucket entirely so a fresh window starts.
  if (bucket.lockedUntil !== null) {
    buckets.delete(key);
    return { ok: true };
  }

  // Window expired: same thing, start fresh.
  if (now > bucket.resetAt) {
    buckets.delete(key);
  }

  return { ok: true };
}

/**
 * Record a failed attempt. When the count inside the current window reaches
 * MAX_ATTEMPTS the identity is locked out for LOCK_MS (the window also resets
 * so the count cannot keep accumulating into the next window).
 */
export function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS, lockedUntil: null });
    return;
  }

  if (now < (bucket.lockedUntil ?? 0)) {
    return; // already locked; keep the lock timestamp untouched
  }

  const count = bucket.count + 1;
  if (count >= MAX_ATTEMPTS) {
    buckets.set(key, { count, resetAt: now + WINDOW_MS, lockedUntil: now + LOCK_MS });
  } else {
    buckets.set(key, { count, resetAt: bucket.resetAt, lockedUntil: null });
  }
}

/** Called after a successful login so a clean identity starts fresh. */
export function clearRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Periodic cleanup so the Map does not grow forever with stale identities.
 * Windows/locks are short-lived (<= 15 min), so worn-out entries are only
 * removed when the window naturally expires on read; this cheap sweep just
 * prevents unbounded growth from abuse that never returns.
 */
const CLEANUP_MS = 60 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    const locked = bucket.lockedUntil !== null && now < bucket.lockedUntil;
    const fresh = now <= bucket.resetAt;
    if (!locked && !fresh) buckets.delete(key);
  }
}, CLEANUP_MS).unref();
import mongoose from "mongoose";

/**
 * One brute-force / abuse bucket for lib/rate-limit.ts, shared by every
 * server instance (on Vercel each warm function has its own memory, so the
 * count has to live here to hold across instances).
 *
 * `key` is the caller's identity (e.g. `email|ip` for login, `admission|ip`
 * for the public admission form). `expiresAt` is the later of `resetAt` and
 * `lockedUntil`; the TTL index removes the doc once neither matters any more,
 * so stale buckets clean themselves up without a sweep job.
 */
export interface RateLimitDoc {
  key: string;
  /** Failures recorded inside the current window. */
  count: number;
  /** End of the current window; the first failure sets it. */
  resetAt: Date;
  /** Blocked until this time, or null when not locked. */
  lockedUntil: Date | null;
  /** TTL anchor: the bucket is meaningless after this. */
  expiresAt: Date;
}

const rateLimitSchema = new mongoose.Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetAt: { type: Date, required: true },
  lockedUntil: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
});

rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel =
  (mongoose.models.RateLimit as mongoose.Model<RateLimitDoc>) ??
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);

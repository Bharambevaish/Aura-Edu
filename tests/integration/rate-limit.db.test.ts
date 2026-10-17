import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  LOCK_MS,
  MAX_ATTEMPTS,
  WINDOW_MS,
  applyFailure,
  checkBucket,
  checkRateLimit,
  clearRateLimit,
  recordFailure,
  type Bucket,
} from "@/lib/rate-limit";
import { RateLimitModel } from "@/lib/models/RateLimit";

// The DB-backed limiter against a throwaway in-memory MongoDB. Two server
// "instances" are simply two callers going through the same collection.
let mongod: MongoMemoryServer;
const T0 = Date.parse("2026-10-15T10:00:00Z");

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  // connectDB reads MONGODB_URI lazily, so this never reaches the real .env DB.
  process.env.MONGODB_URI = mongod.getUri("ratelimit_test");
  globalThis.mongooseCache = { conn: null, promise: null };
  await mongoose.connect(process.env.MONGODB_URI);
  globalThis.mongooseCache.conn = mongoose;
  await RateLimitModel.syncIndexes();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongod?.stop();
});

beforeEach(async () => {
  await RateLimitModel.deleteMany({});
});

describe("shared rate limit (MongoDB)", () => {
  it("shares one lock between two instances with interleaved failures", async () => {
    const key = "victim@example.com|203.0.113.7";
    const instanceA = { fail: (t: number) => recordFailure(key, t), check: (t: number) => checkRateLimit(key, t) };
    const instanceB = { fail: (t: number) => recordFailure(key, t), check: (t: number) => checkRateLimit(key, t) };

    // A, B, A, B: four failures spread over both instances, still allowed.
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      await (i % 2 ? instanceB : instanceA).fail(T0 + i * 1000);
    }
    expect((await instanceA.check(T0 + 5000)).ok).toBe(true);
    expect((await instanceB.check(T0 + 5000)).ok).toBe(true);

    // The fifth failure on A locks the identity for B too.
    await instanceA.fail(T0 + 5000);
    const blocked = await instanceB.check(T0 + 5000);
    expect(blocked).toEqual({ ok: false, retryAfterSeconds: LOCK_MS / 1000 });
    expect((await instanceA.check(T0 + 5000 + LOCK_MS - 1000)).ok).toBe(false);

    // After the lock period both see it unlocked.
    expect((await instanceA.check(T0 + 5000 + LOCK_MS)).ok).toBe(true);
    expect((await instanceB.check(T0 + 5000 + LOCK_MS)).ok).toBe(true);
  });

  it("counts parallel failures exactly (no lost updates)", async () => {
    const key = "parallel@example.com|198.51.100.1";
    await Promise.all(Array.from({ length: MAX_ATTEMPTS }, () => recordFailure(key, T0)));
    const doc = await RateLimitModel.findOne({ key }).lean();
    expect(doc?.count).toBe(MAX_ATTEMPTS);
    expect((await checkRateLimit(key, T0)).ok).toBe(false);
    expect(await RateLimitModel.countDocuments({ key })).toBe(1);
  });

  it("starts a fresh window after WINDOW_MS and clears on success", async () => {
    const key = "window@example.com|local";
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) await recordFailure(key, T0);
    await recordFailure(key, T0 + WINDOW_MS + 1);
    expect((await checkRateLimit(key, T0 + WINDOW_MS + 1)).ok).toBe(true);
    expect((await RateLimitModel.findOne({ key }).lean())?.count).toBe(1);

    for (let i = 0; i < MAX_ATTEMPTS; i++) await recordFailure(key, T0 + WINDOW_MS + 2);
    expect((await checkRateLimit(key, T0 + WINDOW_MS + 2)).ok).toBe(false);
    await clearRateLimit(key);
    expect((await checkRateLimit(key, T0 + WINDOW_MS + 2)).ok).toBe(true);
    expect(await RateLimitModel.countDocuments({ key })).toBe(0);
  });

  it("sets a TTL anchor covering both the window and the lock", async () => {
    const key = "ttl@example.com|local";
    await recordFailure(key, T0);
    expect((await RateLimitModel.findOne({ key }).lean())?.expiresAt.getTime()).toBe(T0 + WINDOW_MS);
    for (let i = 1; i < MAX_ATTEMPTS; i++) await recordFailure(key, T0);
    expect((await RateLimitModel.findOne({ key }).lean())?.expiresAt.getTime()).toBe(T0 + LOCK_MS);

    const indexes = await RateLimitModel.collection.indexes();
    expect(indexes.find((i) => i.key.expiresAt === 1)?.expireAfterSeconds).toBe(0);
    expect(indexes.find((i) => i.key.key === 1)?.unique).toBe(true);
  });

  it("matches the pure rules step by step", async () => {
    // A deterministic walk mixing short gaps, window expiries and lock expiries.
    const gaps = [0, 1000, 1000, 1000, 1000, 1000, WINDOW_MS + 1, 500, LOCK_MS, 2000, WINDOW_MS, 1, 1, 1, 1, 1, 1];
    const key = "parity@example.com|local";
    let model: Bucket | null = null;
    let now = T0;
    for (const gap of gaps) {
      now += gap;
      expect(await checkRateLimit(key, now)).toEqual(checkBucket(model, now));
      model = applyFailure(model, now);
      await recordFailure(key, now);
      const doc = await RateLimitModel.findOne({ key }).lean();
      expect({
        count: doc?.count,
        resetAt: doc?.resetAt.getTime(),
        lockedUntil: doc?.lockedUntil ? doc.lockedUntil.getTime() : null,
      }).toEqual(model);
    }
  });
});

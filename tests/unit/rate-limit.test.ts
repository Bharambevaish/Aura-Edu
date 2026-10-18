import { describe, expect, it } from "vitest";
import { LOCK_MS, MAX_ATTEMPTS, WINDOW_MS, applyFailure, checkBucket, type Bucket } from "@/lib/rate-limit";

// The pure rules behind the DB-backed limiter. A tiny in-memory store with an
// explicit clock plays the part of the `ratelimits` collection.
function store(start = Date.parse("2026-10-15T10:00:00Z")) {
  const buckets = new Map<string, Bucket>();
  let now = start;
  return {
    advance: (ms: number) => (now += ms),
    fail: (key: string) => buckets.set(key, applyFailure(buckets.get(key) ?? null, now)),
    check: (key: string) => checkBucket(buckets.get(key) ?? null, now),
    clear: (key: string) => buckets.delete(key),
  };
}

describe("login rate limit", () => {
  it(`locks an identity after ${MAX_ATTEMPTS} failures and unlocks after the lock period`, () => {
    const s = store();
    const key = "lock@example.com";
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) s.fail(key);
    expect(s.check(key).ok).toBe(true);
    s.fail(key);
    const blocked = s.check(key);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSeconds).toBe(LOCK_MS / 1000);
    s.advance(LOCK_MS + 1);
    expect(s.check(key).ok).toBe(true);
  });

  it("starts a fresh window once the old one expires", () => {
    const s = store();
    const key = "window@example.com";
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) s.fail(key);
    s.advance(WINDOW_MS + 1);
    s.fail(key);
    expect(s.check(key).ok).toBe(true);
  });

  it("clears an identity after a successful login", () => {
    const s = store();
    const key = "clear@example.com";
    for (let i = 0; i < MAX_ATTEMPTS; i++) s.fail(key);
    s.clear(key);
    expect(s.check(key).ok).toBe(true);
  });

  it("keeps identities independent", () => {
    const s = store();
    for (let i = 0; i < MAX_ATTEMPTS; i++) s.fail("a@example.com");
    expect(s.check("a@example.com").ok).toBe(false);
    expect(s.check("b@example.com").ok).toBe(true);
  });

  it("does not extend a lock when failures keep arriving while locked", () => {
    const at = 1_000_000;
    const locked: Bucket = { count: MAX_ATTEMPTS, resetAt: at + WINDOW_MS, lockedUntil: at + LOCK_MS };
    // Even past resetAt (window 10 min < lock 15 min) the lock stands.
    expect(applyFailure(locked, at + WINDOW_MS + 1)).toBe(locked);
    expect(checkBucket(locked, at + LOCK_MS - 1).ok).toBe(false);
    expect(checkBucket(locked, at + LOCK_MS).ok).toBe(true);
  });

  it("starts fresh after a lock expires", () => {
    const at = 1_000_000;
    const locked: Bucket = { count: MAX_ATTEMPTS, resetAt: at + WINDOW_MS, lockedUntil: at + LOCK_MS };
    expect(applyFailure(locked, at + LOCK_MS + 1)).toEqual({
      count: 1,
      resetAt: at + LOCK_MS + 1 + WINDOW_MS,
      lockedUntil: null,
    });
  });
});

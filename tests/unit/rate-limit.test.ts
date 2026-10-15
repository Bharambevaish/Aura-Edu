import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOCK_MS, MAX_ATTEMPTS, WINDOW_MS, checkRateLimit, clearRateLimit, recordFailure } from "@/lib/rate-limit";

describe("login rate limit", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2026-10-15T10:00:00Z") });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it(`locks an identity after ${MAX_ATTEMPTS} failures and unlocks after the lock period`, () => {
    const key = "lock@example.com";
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailure(key);
    expect(checkRateLimit(key).ok).toBe(true);
    recordFailure(key);
    const blocked = checkRateLimit(key);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSeconds).toBe(LOCK_MS / 1000);
    vi.advanceTimersByTime(LOCK_MS + 1);
    expect(checkRateLimit(key).ok).toBe(true);
  });

  it("starts a fresh window once the old one expires", () => {
    const key = "window@example.com";
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) recordFailure(key);
    vi.advanceTimersByTime(WINDOW_MS + 1);
    recordFailure(key);
    expect(checkRateLimit(key).ok).toBe(true);
  });

  it("clears an identity after a successful login", () => {
    const key = "clear@example.com";
    for (let i = 0; i < MAX_ATTEMPTS; i++) recordFailure(key);
    clearRateLimit(key);
    expect(checkRateLimit(key).ok).toBe(true);
  });
});

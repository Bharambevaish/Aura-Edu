import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { checkRateLimit, clearRateLimit, recordFailure } from "@/lib/rate-limit";

// With the database unreachable the limiter must allow the attempt (and warn),
// never lock everyone out. Port 1 refuses connections; selection gives up fast.
const savedUri = process.env.MONGODB_URI;

beforeAll(() => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:1/ratelimit_down?serverSelectionTimeoutMS=300";
  globalThis.mongooseCache = { conn: null, promise: null };
});

afterAll(async () => {
  process.env.MONGODB_URI = savedUri;
  await mongoose.disconnect();
});

describe("rate limit with the database down", () => {
  it("fails open with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(recordFailure("down@example.com|local")).resolves.toBeUndefined();
    await expect(checkRateLimit("down@example.com|local")).resolves.toEqual({ ok: true });
    await expect(clearRateLimit("down@example.com|local")).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(3);
    expect(String(warn.mock.calls[0][0])).toMatch(/fail open/);
    warn.mockRestore();
  }, 30_000);
});

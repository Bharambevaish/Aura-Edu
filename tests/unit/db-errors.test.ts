import { describe, expect, it } from "vitest";
import { isDatabaseError } from "@/lib/db-errors";

const named = (name: string, cause?: unknown) => Object.assign(new Error(name), { name, cause });

describe("isDatabaseError", () => {
  it("recognises driver and Mongoose errors", () => {
    expect(isDatabaseError(named("MongoServerError"))).toBe(true); // e.g. "bad auth"
    expect(isDatabaseError(named("MongooseServerSelectionError"))).toBe(true); // IP not allowed
    expect(isDatabaseError(named("MongoNetworkError"))).toBe(true);
  });
  it("finds a database error wrapped by Auth.js", () => {
    expect(isDatabaseError(named("CallbackRouteError", named("MongoServerSelectionError")))).toBe(true);
  });
  it("leaves ordinary auth failures alone", () => {
    expect(isDatabaseError(named("CredentialsSignin"))).toBe(false);
    expect(isDatabaseError(new Error("boom"))).toBe(false);
    expect(isDatabaseError(null)).toBe(false);
  });
});

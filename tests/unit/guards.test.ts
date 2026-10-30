import { describe, expect, it } from "vitest";
import { assertStrings, InvalidInputError } from "@/lib/guards";

describe("assertStrings (NoSQL operator injection guard)", () => {
  it("accepts strings and omitted optional values", () => {
    expect(() => assertStrings("65f0c0ffee0000000000abcd", "", undefined)).not.toThrow();
  });

  it("rejects query-operator objects and other non-strings", () => {
    for (const bad of [{ $ne: null }, { $gt: "" }, ["a"], 42, null, true]) {
      expect(() => assertStrings("ok", bad)).toThrow(InvalidInputError);
    }
  });
});

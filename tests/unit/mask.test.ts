import { describe, expect, it } from "vitest";
import { maskIdNumber } from "@/lib/mask";

describe("maskIdNumber", () => {
  it("keeps only the last four characters", () => {
    expect(maskIdNumber("5031 0555 8896")).toBe("•••• •••• 8896");
    expect(maskIdNumber("ABCDE1234F")).toBe("•••• •••• 234F");
  });
  it("hides very short values entirely", () => {
    expect(maskIdNumber("123")).toBe("••••");
  });
  it("passes through empty values", () => {
    expect(maskIdNumber("")).toBe("-");
    expect(maskIdNumber(undefined)).toBe("-");
    expect(maskIdNumber("-")).toBe("-");
  });
});

import { describe, expect, it } from "vitest";
import { nextInSequence } from "@/lib/doc-numbers";

describe("nextInSequence", () => {
  it("starts at 1 for a new prefix", () => {
    expect(nextInSequence(null, "INV-2027-", 5)).toBe("INV-2027-00001");
  });

  it("follows the highest number issued, so gaps from deletions never repeat a number", () => {
    // 00001–00005 issued, then 00003 deleted: 4 documents remain, so counting
    // would issue 00005 a second time.
    expect(nextInSequence("INV-2026-00005", "INV-2026-", 5)).toBe("INV-2026-00006");
  });

  it("respects a starting floor (admission numbers start at 1001)", () => {
    expect(nextInSequence(null, "ADM-2026-", 4, 1001)).toBe("ADM-2026-1001");
    expect(nextInSequence("ADM-2026-0010", "ADM-2026-", 4, 1001)).toBe("ADM-2026-1001");
    expect(nextInSequence("ADM-2026-1011", "ADM-2026-", 4, 1001)).toBe("ADM-2026-1012");
  });

  it("ignores a last value from a different prefix", () => {
    expect(nextInSequence("RCP-202609-0007", "RCP-202610-", 4)).toBe("RCP-202610-0001");
  });
});

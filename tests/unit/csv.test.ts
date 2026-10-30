import { describe, expect, it } from "vitest";
import { csvCell, neutralizeFormula, sanitizeRecords, toCsv } from "@/lib/csv";

describe("CSV formula-injection defence", () => {
  it("defuses cells a spreadsheet would run as formulas", () => {
    for (const bad of ['=HYPERLINK("http://evil","x")', "+1+1", "-2+3", "@SUM(A1)", "\t=1", "\r=1"]) {
      expect(neutralizeFormula(bad).startsWith("'"), bad).toBe(true);
    }
  });
  it("leaves ordinary text and numbers alone", () => {
    expect(neutralizeFormula("Riya Sharma")).toBe("Riya Sharma");
    expect(neutralizeFormula(42)).toBe("42");
    expect(neutralizeFormula(null)).toBe("");
  });
  it("quotes cells and escapes quotes", () => {
    expect(csvCell('say "hi", ok')).toBe('"say ""hi"", ok"');
    expect(toCsv([["a", "=1"], ["b", "c"]])).toBe('"a","\'=1"\n"b","c"');
  });
  it("sanitises object rows for spreadsheet libraries", () => {
    expect(sanitizeRecords([{ name: "=cmd", n: 5 }])).toEqual([{ name: "'=cmd", n: 5 }]);
  });
});

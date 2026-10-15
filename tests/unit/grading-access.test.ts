import { describe, expect, it } from "vitest";
import { canGradeWritten, PERMISSION_MATRIX } from "@/lib/permissions";

describe("canGradeWritten", () => {
  it("always lets admins grade", () => {
    expect(canGradeWritten("admin", true)).toBe(true);
    expect(canGradeWritten("admin", false)).toBe(true);
  });

  it("lets staff grade only while the setting is on", () => {
    expect(canGradeWritten("staff", true)).toBe(true);
    expect(canGradeWritten("staff", false)).toBe(false);
  });

  it("never lets students or signed-out users grade", () => {
    expect(canGradeWritten("student", true)).toBe(false);
    expect(canGradeWritten(null, true)).toBe(false);
    expect(canGradeWritten(undefined, true)).toBe(false);
  });
});

describe("PERMISSION_MATRIX — Tests row", () => {
  it("describes the live grading rule", () => {
    const row = PERMISSION_MATRIX.find((r) => r.area === "Tests")!;
    expect(row.admin).toBe("full");
    expect(row.dependsOnStaffGrading).toBe(true);
    expect(row.note).toMatch(/Admins can always grade/);
    expect(row.note).not.toMatch(/staff only/i);
  });
});

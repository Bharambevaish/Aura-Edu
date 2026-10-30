import { describe, expect, it } from "vitest";
import { isSafeLink, LessonSchema } from "@/lib/validation";

describe("isSafeLink (stored-XSS guard for staff-entered links)", () => {
  it("allows web links, site paths and blanks", () => {
    for (const ok of ["https://meet.google.com/abc", "http://example.com/a?b=1", "/videos/intro.mp4", ""]) {
      expect(isSafeLink(ok), ok).toBe(true);
    }
  });
  it("blocks script and data URLs and protocol-relative links", () => {
    for (const bad of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,<script>x</script>", "vbscript:x", "//evil.example", "ftp://x"]) {
      expect(isSafeLink(bad), bad).toBe(false);
    }
  });
  it("is enforced on lessons", () => {
    expect(LessonSchema.safeParse({ title: "L1", type: "video", url: "javascript:alert(1)" }).success).toBe(false);
    expect(LessonSchema.safeParse({ title: "L1", type: "video", url: "https://youtu.be/x" }).success).toBe(true);
  });
});

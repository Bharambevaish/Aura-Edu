import { describe, expect, it } from "vitest";
import { canAccessPath, isAdminOnlyPath } from "@/lib/permissions";

describe("canAccessPath", () => {
  it("lets admins in everywhere", () => {
    expect(canAccessPath("admin", "/admin-dashboard/settings/tax")).toBe(true);
  });

  it("keeps staff out of admin-only sections and their sub-pages", () => {
    for (const p of [
      "/admin-dashboard/settings",
      "/admin-dashboard/settings/config/branch",
      "/admin-dashboard/administration/payroll",
      "/admin-dashboard/finance/audit-trail",
      "/admin-dashboard/lms/students/logins",
    ]) {
      expect(canAccessPath("staff", p), p).toBe(false);
    }
  });

  it("lets staff use day-to-day screens", () => {
    for (const p of ["/admin-dashboard", "/admin-dashboard/lms/leads", "/admin-dashboard/finance/payments", "/admin-dashboard/lms/students"]) {
      expect(canAccessPath("staff", p), p).toBe(true);
    }
  });

  it("matches whole path segments, not prefixes of names", () => {
    expect(isAdminOnlyPath("/admin-dashboard/settings-preview")).toBe(false);
  });

  it("never lets students into the admin dashboard", () => {
    expect(canAccessPath("student", "/admin-dashboard")).toBe(false);
  });
});

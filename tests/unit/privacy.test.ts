import { describe, expect, it } from "vitest";
import {
  ageOn,
  anonymisedLeadFields,
  anonymisedUserFields,
  buildConsent,
  isMinor,
  PRIVACY_NOTICE_VERSION,
} from "@/lib/privacy";
import {
  AdmissionSchema,
  CONSENT_REQUIRED_MESSAGE,
  FormSubmitSchema,
  GUARDIAN_CONSENT_REQUIRED_MESSAGE,
} from "@/lib/validation";

/** YYYY-MM-DD for someone `years` old today. */
function dobYearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const application = {
  firstName: "Riya",
  lastName: "Sharma",
  dateOfBirth: dobYearsAgo(25),
  gender: "Female",
  email: "riya@example.com",
  phone: "9812345670",
  course: "NEET Foundation",
  guardianName: "Sunil Sharma",
  guardianPhone: "9812345671",
  address: "12 MG Road, Pune",
};

function messages(input: unknown): string[] {
  const r = AdmissionSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("isMinor / ageOn", () => {
  const now = new Date(2026, 9, 18);

  it("counts a birthday not yet reached this year", () => {
    expect(ageOn(new Date(2008, 9, 19), now)).toBe(17);
    expect(ageOn(new Date(2008, 9, 18), now)).toBe(18);
  });

  it("treats under-18s as minors and ignores bad input", () => {
    expect(isMinor("2008-05-14", now)).toBe(false);
    expect(isMinor("2010-05-14", now)).toBe(true);
    expect(isMinor("", now)).toBe(false);
    expect(isMinor("not a date", now)).toBe(false);
  });
});

describe("AdmissionSchema consent rules", () => {
  it("accepts an adult who consents", () => {
    expect(AdmissionSchema.safeParse({ ...application, consent: true }).success).toBe(true);
  });

  it("rejects a submission without consent", () => {
    expect(messages(application)).toContain(CONSENT_REQUIRED_MESSAGE);
    expect(messages({ ...application, consent: false })).toContain(CONSENT_REQUIRED_MESSAGE);
    expect(messages({ ...application, consent: "true" })).toContain(CONSENT_REQUIRED_MESSAGE);
  });

  it("requires guardian consent for a minor", () => {
    const minor = { ...application, dateOfBirth: dobYearsAgo(15), consent: true };
    expect(messages(minor)).toEqual([GUARDIAN_CONSENT_REQUIRED_MESSAGE]);
    expect(AdmissionSchema.safeParse({ ...minor, guardianConsent: true }).success).toBe(true);
  });

  it("does not need guardian consent for an adult", () => {
    const r = AdmissionSchema.safeParse({ ...application, consent: true, guardianConsent: false });
    expect(r.success).toBe(true);
  });
});

describe("FormSubmitSchema consent", () => {
  it("requires the consent box", () => {
    expect(FormSubmitSchema.safeParse({ answers: { name: "A" } }).success).toBe(false);
    expect(FormSubmitSchema.safeParse({ answers: { name: "A" }, consent: false }).success).toBe(false);
    const ok = FormSubmitSchema.safeParse({ answers: { name: "A" }, consent: true });
    expect(ok.success && ok.data.byGuardian).toBe(false);
  });
});

describe("buildConsent", () => {
  it("stamps the current notice version", () => {
    const at = new Date("2026-10-18T10:00:00Z");
    expect(buildConsent({ byGuardian: true, ip: "1.2.3.4", at })).toEqual({
      given: true,
      at,
      version: PRIVACY_NOTICE_VERSION,
      byGuardian: true,
      ip: "1.2.3.4",
    });
  });
});

describe("anonymisedUserFields", () => {
  const id = "64b000000000000000000abc";
  const now = new Date("2026-10-18T10:00:00Z");
  const { $set, $unset } = anonymisedUserFields({ _id: id }, now);

  it("replaces the name and email and blocks sign-in", () => {
    expect($set.name).toBe(`Erased student #${id}`);
    expect($set.email).toBe(`erased-${id}@erased.invalid`);
    expect($set.isBlocked).toBe(true);
    expect($set.status).toBe("Inactive");
    expect($set.erasedAt).toBe(now);
    // Not a bcrypt hash, so nothing can ever match it.
    expect(String($set.passwordHash).startsWith("$2")).toBe(false);
  });

  it("removes contact, guardian, address and ID-proof fields", () => {
    for (const f of [
      "phone",
      "alternatePhone",
      "dateOfBirth",
      "guardianName",
      "guardianPhone",
      "guardianEmail",
      "address",
      "idProofType",
      "idProofNumber",
    ]) {
      expect($unset, f).toHaveProperty(f, "");
    }
  });

  it("never touches fee or academic links", () => {
    for (const f of ["batch", "course", "branch", "admissionNo", "role"]) {
      expect($set).not.toHaveProperty(f);
      expect($unset).not.toHaveProperty(f);
    }
  });

  it("anonymises linked leads the same way", () => {
    const lead = anonymisedLeadFields(id);
    expect(lead.$set).toMatchObject({ name: `Erased student #${id}`, email: "", phone: "", notes: [] });
    expect(lead.$unset).toHaveProperty("guardianName", "");
    expect(lead.$unset).toHaveProperty("address", "");
  });
});

import { beforeAll, describe, expect, it } from "vitest";
import { signedCertificateQuery, verifyCertificate } from "@/lib/certificate-signing";

const fields = {
  student: "Aarav Sharma",
  course: "NEET Comprehensive 2026",
  batch: "NEET Batch A",
  template: "modern_clean",
  date: "15 Oct 2026",
  credential: "AURA-2026-0001",
};
const params = (q: string) => Object.fromEntries(new URLSearchParams(q));

describe("certificate signing", () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = "unit-test-secret";
  });

  it("verifies a link it signed", () => {
    expect(verifyCertificate(params(signedCertificateQuery(fields))).valid).toBe(true);
  });

  it("rejects a link whose name was edited", () => {
    const p = params(signedCertificateQuery(fields));
    expect(verifyCertificate({ ...p, student: "Someone Else" }).valid).toBe(false);
  });

  it("rejects a missing signature", () => {
    const p = params(signedCertificateQuery(fields));
    delete p.sig;
    expect(verifyCertificate(p).valid).toBe(false);
  });
});

/**
 * Certificate links are signed so a printed certificate can be trusted.
 *
 * Certificates are stateless (rendered from query params), so anyone could
 * otherwise type any name into /certificates/render. Every link is issued by
 * the server with an HMAC over the normalised fields (key derived from
 * AUTH_SECRET); the render route refuses links whose signature doesn't match,
 * and the public /verify page checks the same signature.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { isCertificateTemplate, type CertificateTemplate } from "@/lib/certificates";

export type CertificateFields = {
  student: string;
  course: string;
  batch: string;
  template: CertificateTemplate;
  date: string;
  credential: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function clean(value: string | string[] | undefined, max: number): string {
  if (Array.isArray(value)) value = value[0];
  if (typeof value !== "string") return "";
  return value.slice(0, max).replace(/[\u0000-\u001f\u007f]/g, "").trim();
}

/** The exact normalisation used for signing, rendering and verifying. */
export function normalizeCertificate(p: RawParams): CertificateFields {
  const template = clean(p.template, 30);
  return {
    student: clean(p.student, 120),
    course: clean(p.course, 120),
    batch: clean(p.batch, 80),
    template: isCertificateTemplate(template) ? template : "modern_clean",
    date: clean(p.date, 60),
    credential: clean(p.credential, 40),
  };
}

function signatureFor(f: CertificateFields): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set.");
  const payload = [f.student, f.course, f.batch, f.template, f.date, f.credential].join("\u001f");
  return createHmac("sha256", secret).update(`auraedu:certificate:${payload}`).digest("base64url").slice(0, 32);
}

/** Query string (with signature) for /certificates/render and /verify. */
export function signedCertificateQuery(fields: Omit<CertificateFields, "template"> & { template: string }): string {
  const f = normalizeCertificate(fields);
  const params = new URLSearchParams({
    student: f.student,
    course: f.course,
    template: f.template,
    date: f.date,
    credential: f.credential,
  });
  if (f.batch) params.set("batch", f.batch);
  params.set("sig", signatureFor(f));
  return params.toString();
}

/** True when the params carry a valid signature over their own values. */
export function verifyCertificate(p: RawParams): { valid: boolean; fields: CertificateFields } {
  const fields = normalizeCertificate(p);
  const sig = clean(p.sig, 64);
  if (!sig || !fields.student || !fields.course || !fields.credential) return { valid: false, fields };
  const expected = Buffer.from(signatureFor(fields));
  const given = Buffer.from(sig);
  return { valid: expected.length === given.length && timingSafeEqual(expected, given), fields };
}

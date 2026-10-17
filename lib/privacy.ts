/**
 * Privacy (DPDP Act 2023) helpers shared by the public forms, the server
 * actions and the admin data-subject tools. Pure — no DB or server-only
 * imports — so the rules are unit-tested directly.
 */

/**
 * Version of the notice at /privacy-policy. Stored with every consent record,
 * so bump it whenever the notice's substance changes.
 */
export const PRIVACY_NOTICE_VERSION = "2026-10-18";

/**
 * Per-deployment facts the notice states. `null` shows a visible
 * "[to be filled in]" placeholder — the institute sets these before go-live.
 */
export const PRIVACY_SETTINGS: {
  /** Years fee receipts, invoices and payments are kept after the course ends (tax law). */
  feeRecordRetentionYears: number | null;
  /** MongoDB Atlas region this deployment's database runs in, e.g. "Mumbai (ap-south-1)". */
  dataRegion: string | null;
} = {
  feeRecordRetentionYears: null,
  dataRegion: null,
};

/** What is stored on a Lead, FormSubmission or User when consent is captured. */
export type ConsentRecord = {
  given: boolean;
  at: Date;
  version: string;
  /** A parent/guardian consented on behalf of a minor. */
  byGuardian: boolean;
  ip: string;
};

export const ADULT_AGE = 18;

/** Age in whole years on `now` (birthday not yet reached this year → one less). */
export function ageOn(dob: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

/** True when the date of birth (Date or YYYY-MM-DD) makes the person under 18. Invalid dates → false. */
export function isMinor(dob: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!dob) return false;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return false;
  return ageOn(d, now) < ADULT_AGE;
}

export function buildConsent(input: { byGuardian: boolean; ip: string; at?: Date }): ConsentRecord {
  return {
    given: true,
    at: input.at ?? new Date(),
    version: PRIVACY_NOTICE_VERSION,
    byGuardian: input.byGuardian,
    ip: input.ip,
  };
}

/** The label every erased record carries in place of the person's name. */
export function erasedLabel(id: string): string {
  return `Erased student #${id}`;
}

/**
 * The `$set` / `$unset` for erasing a student's personal data from their
 * User document. Fee/tax records elsewhere stay; this only rewrites identity
 * fields, blocks sign-in and voids the password.
 *
 * The email stays unique (users.email has a unique index) but routes nowhere.
 */
export function anonymisedUserFields(
  user: { _id: unknown },
  now: Date = new Date(),
): { $set: Record<string, unknown>; $unset: Record<string, ""> } {
  const id = String(user._id);
  return {
    $set: {
      name: erasedLabel(id),
      email: `erased-${id}@erased.invalid`,
      // Not a bcrypt hash, so no password can ever match it.
      passwordHash: "!erased",
      isBlocked: true,
      status: "Inactive",
      mustChangePassword: false,
      erasedAt: now,
    },
    $unset: {
      phone: "",
      alternatePhone: "",
      gender: "",
      dateOfBirth: "",
      guardianName: "",
      guardianPhone: "",
      guardianEmail: "",
      address: "",
      idProofType: "",
      idProofNumber: "",
      lastDevice: "",
    },
  };
}

/** Identity fields on a linked Lead, replaced the same way. */
export function anonymisedLeadFields(studentId: string): { $set: Record<string, unknown>; $unset: Record<string, ""> } {
  return {
    $set: {
      name: erasedLabel(studentId),
      email: "",
      phone: "",
      notes: [],
    },
    $unset: {
      gender: "",
      dateOfBirth: "",
      guardianName: "",
      guardianRelation: "",
      guardianPhone: "",
      address: "",
    },
  };
}

"use server";

/**
 * Student Management (LMS — Student Corner): the first genuinely functional
 * admin module. Full CRUD on the real `users` collection (role: "student"),
 * plus spreadsheet import/export, bulk operations and per-student analytics.
 *
 *  getStudents          - paginated, filtered, sortable roster + headline stats
 *  getStudentDetail     - one student's full profile + derived test metrics
 *  createStudent        - add a student (wizard / import single row)
 *  updateStudent        - edit profile fields (never password via this path)
 *  deleteStudent        - remove a student and their attempts/results
 *  bulkAssignStudents   - assign branch / course / batch to selected rows
 *  bulkGenerateLogins   - set a fresh temp password per selected student
 *  bulkSendCredentials  - simulated delivery (POC; no email/SMS service)
 *  importStudents       - upsert many rows from a parsed spreadsheet
 */

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { nextAdmissionNo, randomPassword } from "@/lib/student-accounts";
import { UserModel } from "@/lib/models/User";
import { BranchModel } from "@/lib/models/Branch";
import { getBranchScope } from "@/lib/branch-scope";
import { SessionModel } from "@/lib/models/Session";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  BulkAssignSchema,
  BulkLoginSchema,
  ImportStudentRowSchema,
} from "@/lib/validation";
import { fmtDate } from "@/lib/services/tests";

const PAGE_SIZE = 20;

export type SortField = "name" | "email" | "admissionNo" | "phone" | "batch" | "status";
export type SortDir = "asc" | "desc";

export type StudentRowDTO = {
  id: string;
  name: string;
  email: string;
  admissionNo: string;
  rollNo: string;
  batch: string;
  phone: string;
  status: string;
  admissionStatus: string;
  course: string;
  branch: string;
  isDemo: boolean;
};

export type StudentStats = {
  totalStudents: number;
  active: number;
  inactive: number;
  batchCount: number;
  batches: string[];
};

/** Field whitelist for sorting (+ "sr" handled client-side). */
const SORTABLE: Record<SortField, string> = {
  name: "name",
  email: "email",
  admissionNo: "admissionNo",
  phone: "phone",
  batch: "batch",
  status: "status",
};

function buildSearchRegex(search: string) {
  const esc = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(esc, "i");
}

/** Paginated roster with headline stats; search/batch/status are optional filters. */
export async function getStudents(input: {
  search?: string;
  batch?: string;
  status?: string;
  page?: number;
  sortCol?: SortField;
  sortDir?: SortDir;
  /** Override page size (used by spreadsheet exports to fetch the full filtered set). */
  limit?: number;
}): Promise<{
  stats: StudentStats;
  students: StudentRowDTO[];
  totalPages: number;
  currentPage: number;
  total: number;
}> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const limit = input.limit && input.limit > 0 ? input.limit : PAGE_SIZE;
  const page = Math.max(1, input.page ?? 1);
  const sortCol = SORTABLE[input.sortCol ?? "name"] ?? "name";
  const sortDir = input.sortDir === "desc" ? -1 : 1;

  // Header branch switcher: roster and stats follow the selected branch.
  const scope = await getBranchScope();
  const filter: Record<string, unknown> = { role: "student", ...scope.students };
  const ors: Record<string, unknown>[] = [];

  const search = input.search?.trim();
  if (search) {
    const rx = buildSearchRegex(search);
    ors.push({ name: rx }, { email: rx }, { phone: rx }, { admissionNo: rx }, { rollNo: rx });
  }
  if (input.batch?.trim()) filter.batch = input.batch.trim();
  if (input.status?.trim() && ["Active", "Inactive"].includes(input.status.trim())) {
    filter.status = input.status.trim();
  }
  if (ors.length) filter.$or = ors;

  const [rows, allStudents] = await Promise.all([
    UserModel.find(filter)
      .sort({ [sortCol]: sortDir, name: 1 })
      .skip(limit === PAGE_SIZE ? (page - 1) * PAGE_SIZE : 0)
      .limit(limit)
      .lean(),
    UserModel.find({ role: "student", ...scope.students }).lean(),
  ]);

  const total = await UserModel.countDocuments(filter);
  const totalStudents = allStudents.length;
  const active = allStudents.filter((s) => s.status === "Active").length;
  const batches = [...new Set(allStudents.map((s) => s.batch).filter(Boolean))].sort() as string[];

  const students: StudentRowDTO[] = rows.map((s) => ({
    id: String(s._id),
    name: s.name,
    email: s.email,
    admissionNo: s.admissionNo ?? "-",
    rollNo: s.rollNo ?? "-",
    batch: s.batch ?? "-",
    phone: s.phone ?? "-",
    status: s.status ?? "Active",
    admissionStatus: s.admissionStatus ?? "Active",
    course: s.course ?? "-",
    branch: s.branch ?? "-",
    isDemo: s.isDemo ?? false,
  }));

  return {
    stats: {
      totalStudents,
      active,
      inactive: totalStudents - active,
      batchCount: batches.length,
      batches,
    },
    students,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    currentPage: page,
    total,
  };
}

export type StudentDetailDTO = StudentRowDTO & {
  gender: string;
  dateOfBirth: string;
  alternatePhone: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  admissionDate: string;
  idProofType: string;
  idProofNumber: string;
  testsTaken: number;
  avgPct: number | null;
  lastTestDate: string | null;
};

/** Full profile + derived test metrics for the View-detail modal. */
export async function getStudentDetail(id: string): Promise<StudentDetailDTO | null> {
  await requireRole(["admin", "staff"]);
  await connectDB();

  const student = await UserModel.findById(id).lean();
  if (!student || student.role !== "student") return null;

  const [results, attempts] = await Promise.all([
    ResultModel.find({ userId: student._id }).lean(),
    AttemptModel.find({ userId: student._id, status: "submitted" }).lean(),
  ]);

  const pcts = results.map((r) => (r.totalMarks > 0 ? (r.obtained / r.totalMarks) * 100 : 0));
  const avgPct = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100) / 100 : null;

  return {
    id: String(student._id),
    name: student.name,
    email: student.email,
    admissionNo: student.admissionNo ?? "-",
    rollNo: student.rollNo ?? "-",
    batch: student.batch ?? "-",
    phone: student.phone ?? "-",
    status: student.status ?? "Active",
    admissionStatus: student.admissionStatus ?? "Active",
    course: student.course ?? "-",
    branch: student.branch ?? "-",
    isDemo: student.isDemo ?? false,
    gender: student.gender ?? "-",
    dateOfBirth: student.dateOfBirth ? fmtDate(student.dateOfBirth) : "-",
    alternatePhone: student.alternatePhone ?? "-",
    guardianName: student.guardianName ?? "-",
    guardianPhone: student.guardianPhone ?? "-",
    guardianEmail: student.guardianEmail ?? "-",
    street: student.address?.street ?? "-",
    city: student.address?.city ?? "-",
    state: student.address?.state ?? "-",
    pincode: student.address?.pincode ?? "-",
    country: student.address?.country ?? "-",
    admissionDate: student.admissionDate ? fmtDate(student.admissionDate) : "-",
    idProofType: student.idProofType ?? "-",
    idProofNumber: student.idProofNumber ?? "-",
    testsTaken: attempts.length,
    avgPct,
    lastTestDate: attempts.length
      ? fmtDate(attempts[attempts.length - 1].submittedAt ?? new Date())
      : null,
  };
}

export type StudentOutcome = {
  ok: boolean;
  studentId?: string;
  message?: string;
};

/** Returns a valid Date, or undefined when the string isn't parseable. */
function safeDate(value: string): Date | undefined {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** A student's branch must be one of the institute's branches (Settings → Branches). */
async function unknownBranch(branch: unknown): Promise<string | null> {
  if (typeof branch !== "string" || !branch.trim()) return null;
  const exists = await BranchModel.exists({ name: branch.trim() });
  return exists ? null : `“${branch}” is not a branch — add it under Settings → Branches first.`;
}

function toStudentDoc(input: Record<string, unknown>) {
  const {
    gender, dateOfBirth, phone, alternatePhone, guardianName, guardianPhone,
    guardianEmail, street, city, state, pincode, country, rollNo, admissionDate,
    batch, branch, course, status, admissionStatus, idProofType, idProofNumber,
  } = input;

  const doc: Record<string, unknown> = {
    gender: (gender as string) || undefined,
    dateOfBirth: (dateOfBirth as string)
      ? safeDate(dateOfBirth as string)
      : undefined,
    phone: (phone as string) || undefined,
    alternatePhone: (alternatePhone as string) || undefined,
    guardianName: (guardianName as string) || undefined,
    guardianPhone: (guardianPhone as string) || undefined,
    guardianEmail: (guardianEmail as string) || undefined,
    address: {
      street: (street as string) || undefined,
      city: (city as string) || undefined,
      state: (state as string) || undefined,
      pincode: (pincode as string) || undefined,
      country: (country as string) || undefined,
    },
    rollNo: (rollNo as string) || undefined,
    admissionDate: (admissionDate as string)
      ? safeDate(admissionDate as string)
      : undefined,
    batch: (batch as string) || undefined,
    branch: (branch as string) || undefined,
    course: (course as string) || undefined,
    idProofType: (idProofType as string) || undefined,
    idProofNumber: (idProofNumber as string) || undefined,
  };

  if (status === "Active" || status === "Inactive") doc.status = status;
  if (admissionStatus === "Active" || admissionStatus === "Pending" || admissionStatus === "Graduated" || admissionStatus === "Transferred") {
    doc.admissionStatus = admissionStatus;
  }

  return doc;
}

export async function createStudent(input: Record<string, unknown>): Promise<StudentOutcome> {
  const { user } = await requireRole(["admin", "staff"]);

  const parsed = CreateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid student data." };
  }

  await connectDB();

  const badBranch = await unknownBranch(parsed.data.branch);
  if (badBranch) return { ok: false, message: badBranch };

  const existing = await UserModel.findOne({ email: parsed.data.email }).lean();
  if (existing) {
    return { ok: false, message: `A user with ${parsed.data.email} already exists.` };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const admissionNo = await nextAdmissionNo();

  const profile = toStudentDoc(parsed.data);
  const student = await UserModel.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: "student",
    admissionNo,
    isDemo: false,
    // The admin chose this password, so the student must replace it on first sign-in.
    mustChangePassword: true,
    ...profile,
  });

  await writeAudit(user, "created student", `${parsed.data.name} (${admissionNo})`);
  return { ok: true, studentId: String(student._id), message: "Student added successfully." };
}

export async function updateStudent(id: string, input: Record<string, unknown>): Promise<StudentOutcome> {
  const { user } = await requireRole(["admin", "staff"]);

  const parsed = UpdateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid student data." };
  }

  await connectDB();

  const student = await UserModel.findById(id).lean();
  if (!student || student.role !== "student") {
    return { ok: false, message: "Student not found." };
  }

  if (parsed.data.branch && parsed.data.branch !== student.branch) {
    const badBranch = await unknownBranch(parsed.data.branch);
    if (badBranch) return { ok: false, message: badBranch };
  }

  const { name, email, ...profileInput } = parsed.data;
  const profile = toStudentDoc(profileInput);

  // Check for an email clash *before* writing (the unique index would throw).
  if (email && email !== student.email) {
    const clash = await UserModel.findOne({ email, _id: { $ne: student._id } }).lean();
    if (clash) return { ok: false, message: `A user with ${email} already exists.` };
  }

  await UserModel.updateOne(
    { _id: id },
    {
      $set: {
        ...(name ? { name } : {}),
        ...(email && email !== student.email
          ? { email }
          : {}),
        ...profile,
      },
    },
  );

  await writeAudit(user, "updated student", student.name);
  return { ok: true, message: "Student updated successfully." };
}

export async function deleteStudent(id: string): Promise<StudentOutcome> {
  const { user } = await requireRole(["admin"]);

  await connectDB();

  if (String(user.id) === id) {
    return { ok: false, message: "You cannot delete your own account." };
  }

  const student = await UserModel.findById(id).lean();
  if (!student || student.role !== "student") {
    return { ok: false, message: "Student not found." };
  }

  await UserModel.deleteOne({ _id: id });
  await AttemptModel.deleteMany({ userId: id });
  await ResultModel.deleteMany({ userId: id });
  await SessionModel.deleteMany({ userId: id });

  await writeAudit(user, "deleted student", `${student.name} (${student.email})`);
  return { ok: true, message: "Student deleted." };
}

export type BulkOutcome = {
  ok: boolean;
  count?: number;
  message?: string;
  credentials?: { email: string; password: string }[];
};

export async function bulkAssignStudents(input: unknown): Promise<BulkOutcome> {
  const parsed = BulkAssignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid bulk assignment." };
  }

  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();

  const { ids, field, value } = parsed.data;
  if (field === "branch") {
    const active = await BranchModel.exists({ name: value, active: true });
    if (!active) return { ok: false, message: `“${value}” is not an active branch.` };
  }
  const res = await UserModel.updateMany(
    { _id: { $in: ids }, role: "student" },
    { $set: { [field]: value } },
  );

  await writeAudit(user, "bulk-assigned students", `${field} = ${value} for ${res.modifiedCount} student(s)`);
  return { ok: true, count: res.modifiedCount, message: `Assigned ${field} to ${res.modifiedCount} student(s).` };
}

/** Sets a fresh temporary password for each selected student, returning one-time credentials. */
export async function bulkGenerateLogins(input: unknown): Promise<BulkOutcome> {
  const parsed = BulkLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Select at least one student." };
  }

  const { user } = await requireRole(["admin"]);
  await connectDB();

  const students = await UserModel.find({ _id: { $in: parsed.data.ids }, role: "student" }).lean();

  const credentials: { email: string; password: string }[] = [];
  for (const s of students) {
    const password = randomPassword();
    const passwordHash = await bcrypt.hash(password, 12);
    await UserModel.updateOne({ _id: s._id }, { $set: { passwordHash, mustChangePassword: true } });
    credentials.push({ email: s.email, password });
  }

  await writeAudit(user, "regenerated student logins", credentials.map((c) => c.email).join(", "));
  return { ok: true, count: credentials.length, credentials, message: `Generated logins for ${credentials.length} student(s).` };
}

/** Simulated credential delivery (POC — no email/SMS provider wired). */
export async function bulkSendCredentials(input: unknown): Promise<BulkOutcome> {
  const parsed = BulkLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Select at least one student." };
  }

  await requireRole(["admin"]);
  await connectDB();

  const count = await UserModel.countDocuments({ _id: { $in: parsed.data.ids }, role: "student" });
  return { ok: true, count, message: `Credentials sent to ${count} student(s) (simulated).` };
}

export type ImportResult = {
  ok: boolean;
  imported: number;
  updated: number;
  errors: { email: string; reason: string }[];
  /** One-time passwords for newly created students (shown once, never stored in plain). */
  credentials: { email: string; password: string }[];
};

/** Status enums accepted case-insensitively on import, mapped to canonical. */
const STATUS_LOOKUP: Record<string, "Active" | "Inactive"> = {
  active: "Active",
  inactive: "Inactive",
};
const ADMISSION_STATUS_LOOKUP: Record<string, "Active" | "Pending" | "Graduated" | "Transferred"> = {
  active: "Active",
  pending: "Pending",
  graduated: "Graduated",
  transferred: "Transferred",
};

/**
 * Sheet cells arrive as numbers (phone/roll/pincode/amount), booleans or
 * Date objects depending on how Excel stored the column. Coerce every value to
 * a trimmed string (or empty), map status fields to canonical casing, and
 * reject nothing up-front — let the zod schema do the real validation.
 */
function normalizeImportRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) continue;
    if (value instanceof Date) {
      out[key] = value.toISOString().slice(0, 10);
      continue;
    }
    const str = String(value).trim();
    if (str === "" || str.toLowerCase() === "n/a") continue;
    out[key] = str;
  }

  if (typeof raw.status === "string" || typeof raw.status === "number") {
    const s = String(raw.status).trim().toLowerCase();
    if (STATUS_LOOKUP[s]) out.status = STATUS_LOOKUP[s];
  }
  if (typeof raw.admissionStatus === "string" || typeof raw.admissionStatus === "number") {
    const a = String(raw.admissionStatus).trim().toLowerCase();
    if (ADMISSION_STATUS_LOOKUP[a]) out.admissionStatus = ADMISSION_STATUS_LOOKUP[a];
  }

  return out;
}

/** Bulk upsert from a parsed spreadsheet: create new students, update existing by email. */
export async function importStudents(rows: Record<string, unknown>[]): Promise<ImportResult> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, imported: 0, updated: 0, errors: [], credentials: [] };
  }

  const errors: ImportResult["errors"] = [];
  const credentials: ImportResult["credentials"] = [];
  let imported = 0;
  let updated = 0;

  for (const raw of rows) {
    const cleaned = normalizeImportRow(raw);
    const parsed = ImportStudentRowSchema.safeParse(cleaned);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const reason = issue?.message ?? "Invalid row.";
      errors.push({
        email: String(cleaned.email ?? raw.email ?? "(unknown)"),
        reason: issue?.path?.length ? `${reason} (field "${String(issue.path[0])}")` : reason,
      });
      continue;
    }

    const profile = toStudentDoc(parsed.data as unknown as Record<string, unknown>);

    const existing = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (existing && existing.role !== "student") {
      // Never let a spreadsheet row overwrite an admin/staff account.
      errors.push({ email: parsed.data.email, reason: "Email belongs to a non-student account." });
      continue;
    }
    if (existing) {
      await UserModel.updateOne(
        { _id: existing._id },
        { $set: { ...profile, name: parsed.data.name ?? existing.name, isDemo: existing.isDemo } },
      );
      updated++;
    } else {
      // Unique one-time password per student (previously everyone got the same one).
      const password = randomPassword();
      await UserModel.create({
        name: parsed.data.name ?? parsed.data.email.split("@")[0],
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "student",
        admissionNo: await nextAdmissionNo(),
        isDemo: false,
        mustChangePassword: true,
        ...profile,
      });
      credentials.push({ email: parsed.data.email, password });
      imported++;
    }
  }

  await writeAudit(user, "imported students", `${imported} new, ${updated} updated, ${errors.length} skipped`);
  return { ok: true, imported, updated, errors, credentials };
}
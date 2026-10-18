"use server";

/**
 * Leads + Online Admissions + lead → student conversion.
 *
 *   Admin/staff:  getLeads, getConversionOptions, createLead, updateLead,
 *                 convertLead (creates the student account, invoice, enrollment)
 *   Public:       getAdmissionOptions, submitAdmission (the /register form —
 *                 rate-limited, creates a *lead*, never an account)
 *
 * Every mutation is audit-logged.
 */

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { nextDocNo } from "@/lib/doc-numbers";
import { requireRole } from "@/lib/dal";
import { writeAudit, writeSystemAudit } from "@/lib/audit";
import { getInstitute, defaultTaxRule, inclusiveGst } from "@/lib/institute";
import { buildConsent } from "@/lib/privacy";
import { checkRateLimit, recordFailure } from "@/lib/rate-limit";
import { nextAdmissionNo, randomPassword } from "@/lib/student-accounts";
import { LeadModel, type LeadDoc, type LeadPriority, type LeadSource, type LeadStage, type LeadType } from "@/lib/models/Lead";
import { UserModel } from "@/lib/models/User";
import { BatchModel } from "@/lib/models/Batch";
import { CourseModel } from "@/lib/models/Course";
import { InvoiceModel } from "@/lib/models/Invoice";
import { AdmissionSchema, ConvertLeadSchema, CreateLeadSchema, UpdateLeadSchema } from "@/lib/validation";

export type LeadRow = {
  id: string;
  leadNo: string;
  name: string;
  email: string;
  phone: string;
  type: LeadType;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource;
  interestedCourse: string;
  preferredBatch: string;
  branch: string;
  guardianName: string;
  guardianPhone: string;
  ownerName: string;
  nextFollowUpAt: string | null;
  createdAt: string;
  lostReason: string;
  convertedStudentId: string | null;
  notes: { text: string; byName: string; at: string }[];
};

export type LeadStats = {
  total: number;
  byStage: Record<LeadStage, number>;
  followUpsDue: number;
  conversionRate: number;
};

type LeadLean = LeadDoc & { _id: mongoose.Types.ObjectId };

function toRow(l: LeadLean): LeadRow {
  return {
    id: String(l._id),
    leadNo: l.leadNo,
    name: l.name,
    email: l.email ?? "",
    phone: l.phone ?? "",
    type: l.type,
    stage: l.stage,
    priority: l.priority,
    source: l.source,
    interestedCourse: l.interestedCourse ?? "",
    preferredBatch: l.preferredBatch ?? "",
    branch: l.branch ?? "",
    guardianName: l.guardianName ?? "",
    guardianPhone: l.guardianPhone ?? "",
    ownerName: l.ownerName ?? "Unassigned",
    nextFollowUpAt: l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toISOString() : null,
    createdAt: new Date(l.createdAt).toISOString(),
    lostReason: l.lostReason ?? "",
    convertedStudentId: l.convertedStudentId ? String(l.convertedStudentId) : null,
    notes: (l.notes ?? [])
      .slice()
      .reverse()
      .map((n) => ({ text: n.text, byName: n.byName, at: new Date(n.at).toISOString() })),
  };
}

async function nextLeadNo(): Promise<string> {
  return nextDocNo(LeadModel, "leadNo", `LD-${new Date().getFullYear()}-`, 4);
}

/* ------------------------------------------------------------------ */
/* Admin / staff                                                       */
/* ------------------------------------------------------------------ */

/** Every lead (newest first) + pipeline stats. Filtering happens client-side. */
export async function getLeads(): Promise<{ stats: LeadStats; leads: LeadRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const leads = await LeadModel.find().sort({ createdAt: -1 }).limit(500).lean<LeadLean[]>();

  const byStage: Record<LeadStage, number> = {
    new: 0, contacted: 0, follow_up: 0, qualified: 0, converted: 0, lost: 0,
  };
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  let followUpsDue = 0;
  for (const l of leads) {
    byStage[l.stage] += 1;
    const open = l.stage !== "converted" && l.stage !== "lost";
    if (open && l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= endOfToday) followUpsDue += 1;
  }
  const closed = byStage.converted + byStage.lost;

  return {
    stats: {
      total: leads.length,
      byStage,
      followUpsDue,
      conversionRate: closed > 0 ? Math.round((byStage.converted / closed) * 100) : 0,
    },
    leads: leads.map(toRow),
  };
}

export type ConversionOptions = {
  batches: { name: string; course: string; enrolled: number; capacity: number }[];
  /** Default fee per course title (Course Center price), used to pre-fill. */
  feeByCourse: Record<string, number>;
};

/** Batches to place a converted student in, with live seat counts. */
export async function getConversionOptions(): Promise<ConversionOptions> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const [batches, counts, courses] = await Promise.all([
    BatchModel.find().sort({ name: 1 }).lean(),
    UserModel.aggregate<{ _id: string; n: number }>([
      { $match: { role: "student", batch: { $nin: [null, ""] } } },
      { $group: { _id: "$batch", n: { $sum: 1 } } },
    ]),
    CourseModel.find().select("title price").lean(),
  ]);
  const enrolled = new Map(counts.map((c) => [c._id, c.n]));
  return {
    batches: batches.map((b) => ({
      name: b.name,
      course: b.course,
      enrolled: enrolled.get(b.name) ?? 0,
      capacity: b.capacity,
    })),
    feeByCourse: Object.fromEntries(courses.map((c) => [c.title, c.price ?? 0])),
  };
}

export type LeadOutcome = { ok: boolean; message: string };

export async function createLead(input: unknown): Promise<LeadOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = CreateLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid lead." };
  await connectDB();

  const d = parsed.data;
  const leadNo = await nextLeadNo();
  await LeadModel.create({
    leadNo,
    name: d.name,
    email: d.email,
    phone: d.phone,
    type: d.type,
    priority: d.priority,
    source: d.source,
    interestedCourse: d.interestedCourse,
    stage: "new",
    ownerName: user.name,
    notes: d.note ? [{ text: d.note, byName: user.name, at: new Date() }] : [],
  });
  await writeAudit(user, "created lead", `${leadNo} — ${d.name}`);
  return { ok: true, message: `Lead ${leadNo} added.` };
}

/** Follow-up: change stage/priority, schedule the next follow-up, add a note. */
export async function updateLead(id: string, input: unknown): Promise<LeadOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Lead not found." };
  const parsed = UpdateLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid update." };
  await connectDB();

  const lead = await LeadModel.findById(id).lean<LeadLean>();
  if (!lead) return { ok: false, message: "Lead not found." };
  if (lead.stage === "converted") return { ok: false, message: "Converted leads can't be changed." };

  const d = parsed.data;
  let nextFollowUpAt: Date | null = null;
  if (d.nextFollowUpAt) {
    const parsedDate = new Date(d.nextFollowUpAt);
    if (Number.isNaN(parsedDate.getTime())) return { ok: false, message: "Invalid follow-up date." };
    nextFollowUpAt = parsedDate;
  }
  if (d.stage === "lost" && !d.lostReason) return { ok: false, message: "Add a reason when marking a lead lost." };

  const autoNote =
    d.stage !== lead.stage ? `Stage: ${lead.stage.replace("_", "-")} → ${d.stage.replace("_", "-")}` : "";
  const noteText = [autoNote, d.note].filter(Boolean).join(" · ");

  await LeadModel.updateOne(
    { _id: lead._id },
    {
      $set: {
        stage: d.stage,
        priority: d.priority,
        nextFollowUpAt: d.stage === "lost" ? null : nextFollowUpAt,
        lostReason: d.stage === "lost" ? d.lostReason : "",
        ...(lead.ownerName === "Unassigned" ? { ownerName: user.name } : {}),
      },
      ...(noteText ? { $push: { notes: { text: noteText, byName: user.name, at: new Date() } } } : {}),
    },
  );
  await writeAudit(user, "updated lead", `${lead.leadNo} — ${lead.name}${autoNote ? ` (${autoNote})` : ""}`);
  return { ok: true, message: "Lead updated." };
}

export type ConvertOutcome = LeadOutcome & {
  credentials?: { email: string; password: string };
  invoiceNo?: string;
};

/**
 * Lead → student: creates the student account (one-time password, forced
 * change at first sign-in), places them in a batch + course, raises the fee
 * invoice, enrolls them in the course and links the lead. Audit-logged.
 */
export async function convertLead(id: string, input: unknown): Promise<ConvertOutcome> {
  const { user } = await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Lead not found." };
  const parsed = ConvertLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid conversion." };
  await connectDB();

  const lead = await LeadModel.findById(id).lean<LeadLean>();
  if (!lead) return { ok: false, message: "Lead not found." };
  if (lead.type !== "student") return { ok: false, message: "Only student leads can become students." };
  if (lead.stage === "converted") return { ok: false, message: "This lead is already converted." };
  if (lead.stage === "lost") return { ok: false, message: "Reopen this lead before converting it." };
  if (!lead.email) return { ok: false, message: "Add an email to this lead first — it becomes the login." };
  if (await UserModel.exists({ email: lead.email })) {
    return { ok: false, message: `An account with ${lead.email} already exists.` };
  }

  const batch = await BatchModel.findOne({ name: parsed.data.batch }).lean();
  if (!batch) return { ok: false, message: "Pick a valid batch." };

  // Claim the lead first so a double-click can't create two accounts.
  const claimed = await LeadModel.updateOne(
    { _id: lead._id, stage: { $nin: ["converted", "lost"] }, convertedStudentId: null },
    { $set: { stage: "converted", convertedAt: new Date() } },
  );
  if (claimed.modifiedCount === 0) return { ok: false, message: "This lead was just converted by someone else." };

  const password = randomPassword();
  const now = new Date();
  let studentId: mongoose.Types.ObjectId;
  try {
    const student = await UserModel.create({
      name: lead.name,
      email: lead.email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "student",
      admissionNo: await nextAdmissionNo(),
      admissionDate: now,
      phone: lead.phone || undefined,
      gender: lead.gender,
      dateOfBirth: lead.dateOfBirth,
      guardianName: lead.guardianName,
      guardianPhone: lead.guardianPhone,
      address: lead.address ? { street: lead.address } : undefined,
      batch: batch.name,
      course: batch.course,
      branch: lead.branch || "Main Branch",
      status: "Active",
      admissionStatus: "Active",
      isDemo: false,
      mustChangePassword: true,
      // The applicant's privacy-notice consent follows them onto the account.
      consent: lead.consent?.given ? lead.consent : undefined,
    });
    studentId = student._id as mongoose.Types.ObjectId;
  } catch {
    // Roll the claim back so the lead can be converted again.
    await LeadModel.updateOne({ _id: lead._id }, { $set: { stage: lead.stage, convertedAt: null } });
    return { ok: false, message: "Could not create the student account. Please try again." };
  }

  let invoiceNo: string | undefined;
  if (parsed.data.feeTotal > 0) {
    invoiceNo = await nextDocNo(InvoiceModel, "invoiceNo", `INV-${now.getFullYear()}-`, 5);
    // Fees are GST-inclusive; record the GST portion from the default rule.
    const rule = defaultTaxRule(await getInstitute());
    await InvoiceModel.create({
      invoiceNo,
      studentId,
      course: batch.course,
      batch: batch.name,
      branch: lead.branch || "Main Branch",
      total: parsed.data.feeTotal,
      paid: 0,
      waived: 0,
      taxGst: rule ? inclusiveGst(parsed.data.feeTotal, rule.rate) : 0,
      issueDate: now,
      dueDate: new Date(now.getTime() + parsed.data.dueInDays * 24 * 60 * 60 * 1000),
      notes: `Admission fee — converted from lead ${lead.leadNo}`,
    });
  }

  // Enroll in the course (if it exists in the catalog) so My Courses shows it.
  await CourseModel.updateOne({ title: batch.course }, { $addToSet: { enrolledStudents: studentId } });

  await LeadModel.updateOne(
    { _id: lead._id },
    {
      $set: { convertedStudentId: studentId, nextFollowUpAt: null, ...(lead.ownerName === "Unassigned" ? { ownerName: user.name } : {}) },
      $push: {
        notes: {
          text: `Converted to student → ${batch.name}${invoiceNo ? `, invoice ${invoiceNo}` : ""}`,
          byName: user.name,
          at: now,
        },
      },
    },
  );
  await writeAudit(
    user,
    "converted lead to student",
    `${lead.leadNo} — ${lead.name} → ${batch.name}${invoiceNo ? ` (${invoiceNo}, ₹${parsed.data.feeTotal})` : ""}`,
  );

  return {
    ok: true,
    message: `${lead.name} is now a student in ${batch.name}.`,
    credentials: { email: lead.email, password },
    invoiceNo,
  };
}

/* ------------------------------------------------------------------ */
/* Public: Online Admissions (/register)                               */
/* ------------------------------------------------------------------ */

/** Published course titles + the institute name (for the consent text) for the admission form. */
export async function getAdmissionOptions(): Promise<{ courses: string[]; instituteName: string }> {
  await connectDB();
  const [courses, institute] = await Promise.all([
    CourseModel.find({ published: true }).select("title").sort({ title: 1 }).lean(),
    getInstitute(),
  ]);
  return { courses: courses.map((c) => c.title), instituteName: institute.name };
}

export type AdmissionOutcome = { ok: boolean; message: string; reference?: string };

/**
 * Public, unauthenticated. Creates (or refreshes) a *lead* — never an account;
 * staff review it on the Leads page and convert it. Rate-limited per IP and
 * protected by a honeypot field. Privacy-notice consent (and guardian consent
 * for a minor) is required by the schema and stored on the lead.
 */
export async function submitAdmission(input: unknown): Promise<AdmissionOutcome> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `admission|${ip}`;
  const limit = await checkRateLimit(key);
  if (!limit.ok) {
    return { ok: false, message: `Too many applications from this network. Try again in ${limit.retryAfterSeconds}s.` };
  }

  const parsed = AdmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  // Every accepted submission counts toward the per-IP limit (5 per 10 min).
  await recordFailure(key);

  const d = parsed.data;
  // Honeypot filled → a bot. Pretend success, store nothing.
  if (d.website) return { ok: true, message: "Application received.", reference: "LD-PENDING" };

  const dob = new Date(d.dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob > new Date()) return { ok: false, message: "Enter a valid date of birth." };

  await connectDB();
  const name = `${d.firstName} ${d.lastName}`.trim();
  const details = {
    name,
    phone: d.phone,
    interestedCourse: d.course,
    preferredBatch: d.preferredBatch,
    branch: d.branch,
    gender: d.gender,
    dateOfBirth: dob,
    guardianName: d.guardianName,
    guardianRelation: d.guardianRelation,
    guardianPhone: d.guardianPhone,
    address: d.address,
    consent: buildConsent({ byGuardian: d.guardianConsent, ip }),
  };

  // Re-application with the same email: refresh the open lead, don't duplicate.
  const open = await LeadModel.findOne({ email: d.email, stage: { $nin: ["converted", "lost"] } }).lean<LeadLean>();
  if (open) {
    await LeadModel.updateOne(
      { _id: open._id },
      { $set: details, $push: { notes: { text: "Re-submitted the online application.", byName: "Online Admission", at: new Date() } } },
    );
    await writeSystemAudit("online admission re-submitted", `${open.leadNo} — ${name}`);
    return { ok: true, message: "Application updated.", reference: open.leadNo };
  }

  const leadNo = await nextLeadNo();
  await LeadModel.create({
    leadNo,
    email: d.email,
    type: "student",
    stage: "new",
    priority: "medium",
    source: "web_register",
    ownerName: "Unassigned",
    notes: [{ text: "Applied through the online admission form.", byName: "Online Admission", at: new Date() }],
    ...details,
  });
  await writeSystemAudit("online admission received", `${leadNo} — ${name}`);
  return { ok: true, message: "Application received.", reference: leadNo };
}

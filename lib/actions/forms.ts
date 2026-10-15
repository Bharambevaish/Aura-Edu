"use server";

/**
 * Form Builder — embeddable lead-capture forms.
 *
 *   Admin:   getForms, getForm, createForm, updateForm, duplicateForm,
 *            deleteForm, toggleFormActive, getFormSubmissions
 *   Public:  getPublicForm, submitForm (the /f/[slug] page — rate-limited,
 *            validated against the stored schema, creates or refreshes a Lead)
 *
 * Every mutation is audit-logged.
 */

import mongoose from "mongoose";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit, writeSystemAudit } from "@/lib/audit";
import { checkRateLimit, recordFailure } from "@/lib/rate-limit";
import { FormModel, type FormDoc } from "@/lib/models/Form";
import { FormSubmissionModel, type FormSubmissionDoc } from "@/lib/models/FormSubmission";
import { LeadModel, type LeadDoc } from "@/lib/models/Lead";
import { DEFAULT_THANK_YOU, leadFieldMap, slugify, validateAnswers, type FormField, type PublicFormView } from "@/lib/forms";
import { FormInputSchema, FormSubmitSchema } from "@/lib/validation";

export type FormRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  fieldCount: number;
  submissionCount: number;
  active: boolean;
  createdByName: string;
  updatedAt: string;
};

export type FormDetail = PublicFormView & { id: string; slug: string; active: boolean; submissionCount: number };

export type FormSubmissionRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  leadId: string | null;
  leadNo: string;
  answers: { fieldId: string; label: string; value: string }[];
};

type Outcome = { ok: boolean; message: string; id?: string };
type FormLean = FormDoc & { _id: mongoose.Types.ObjectId };
type SubmissionLean = FormSubmissionDoc & { _id: mongoose.Types.ObjectId };
type LeadLean = LeadDoc & { _id: mongoose.Types.ObjectId };

const cleanFields = (fields: FormField[]): FormField[] =>
  fields.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    required: f.required,
    options: f.type === "select" ? f.options : [],
    placeholder: f.type === "checkbox" || f.type === "select" ? "" : f.placeholder,
  }));

function toDetail(f: FormLean): FormDetail {
  return {
    id: String(f._id),
    title: f.title,
    slug: f.slug,
    description: f.description ?? "",
    thankYouMessage: f.thankYouMessage ?? "",
    active: f.active,
    submissionCount: f.submissionCount ?? 0,
    fields: cleanFields(f.fields ?? []),
  };
}

/** `base`, else `base-2`, `base-3`… — the first slug no other form uses. */
async function freeSlug(base: string, exceptId?: mongoose.Types.ObjectId): Promise<string> {
  for (let n = 1; n < 100; n++) {
    const slug = n === 1 ? base : `${base.slice(0, 56)}-${n}`;
    if (!(await FormModel.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) }))) return slug;
  }
  return `${base.slice(0, 50)}-${Date.now().toString(36)}`;
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

export async function getForms(): Promise<FormRow[]> {
  await requireRole(["admin"]);
  await connectDB();
  const forms = await FormModel.find().sort({ updatedAt: -1 }).lean<FormLean[]>();
  return forms.map((f) => ({
    id: String(f._id),
    title: f.title,
    slug: f.slug,
    description: f.description ?? "",
    fieldCount: f.fields?.length ?? 0,
    submissionCount: f.submissionCount ?? 0,
    active: f.active,
    createdByName: f.createdByName ?? "System",
    updatedAt: new Date(f.updatedAt).toISOString(),
  }));
}

export async function getForm(id: string): Promise<FormDetail | null> {
  await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const form = await FormModel.findById(id).lean<FormLean>();
  return form ? toDetail(form) : null;
}

export async function createForm(input: unknown): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = FormInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form." };
  await connectDB();

  const d = parsed.data;
  if (d.slug && (await FormModel.exists({ slug: d.slug }))) {
    return { ok: false, message: `The link /f/${d.slug} is already used by another form.` };
  }
  const slug = d.slug || (await freeSlug(slugify(d.title)));
  const form = await FormModel.create({
    title: d.title,
    slug,
    description: d.description,
    thankYouMessage: d.thankYouMessage,
    active: d.active,
    fields: cleanFields(d.fields),
    createdByName: user.name,
  });
  await writeAudit(user, "created form", `${d.title} (/f/${slug})`);
  return { ok: true, message: "Form created.", id: String(form._id) };
}

export async function updateForm(id: string, input: unknown): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Form not found." };
  const parsed = FormInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form." };
  await connectDB();

  const form = await FormModel.findById(id).lean<FormLean>();
  if (!form) return { ok: false, message: "Form not found." };
  const d = parsed.data;
  const slug = d.slug || form.slug;
  if (slug !== form.slug && (await FormModel.exists({ slug, _id: { $ne: form._id } }))) {
    return { ok: false, message: `The link /f/${slug} is already used by another form.` };
  }
  await FormModel.updateOne(
    { _id: form._id },
    {
      $set: {
        title: d.title,
        slug,
        description: d.description,
        thankYouMessage: d.thankYouMessage,
        active: d.active,
        fields: cleanFields(d.fields),
      },
    },
  );
  await writeAudit(user, "updated form", `${d.title} (/f/${slug})${slug !== form.slug ? ` — link changed from /f/${form.slug}` : ""}`);
  return { ok: true, message: "Form saved.", id };
}

export async function duplicateForm(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Form not found." };
  await connectDB();
  const form = await FormModel.findById(id).lean<FormLean>();
  if (!form) return { ok: false, message: "Form not found." };

  const slug = await freeSlug(`${form.slug.slice(0, 55)}-copy`);
  const copy = await FormModel.create({
    title: `${form.title} (copy)`.slice(0, 120),
    slug,
    description: form.description,
    thankYouMessage: form.thankYouMessage,
    fields: cleanFields(form.fields ?? []),
    // A copy starts as a draft so it never goes live by accident.
    active: false,
    createdByName: user.name,
  });
  await writeAudit(user, "duplicated form", `${form.title} → /f/${slug}`);
  return { ok: true, message: "Copy created as an inactive draft.", id: String(copy._id) };
}

/** Deletes the form and its stored responses. Leads it created are kept. */
export async function deleteForm(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Form not found." };
  await connectDB();
  const form = await FormModel.findById(id).lean<FormLean>();
  if (!form) return { ok: false, message: "Form not found." };
  const { deletedCount } = await FormSubmissionModel.deleteMany({ formId: form._id });
  await FormModel.deleteOne({ _id: form._id });
  await writeAudit(user, "deleted form", `${form.title} (/f/${form.slug}, ${deletedCount} response${deletedCount === 1 ? "" : "s"})`);
  return { ok: true, message: "Form deleted. Leads it created are kept." };
}

export async function toggleFormActive(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Form not found." };
  await connectDB();
  const form = await FormModel.findById(id).lean<FormLean>();
  if (!form) return { ok: false, message: "Form not found." };
  await FormModel.updateOne({ _id: form._id }, { $set: { active: !form.active } });
  await writeAudit(user, form.active ? "deactivated form" : "activated form", `${form.title} (/f/${form.slug})`);
  return { ok: true, message: form.active ? "Form closed — the public link now says it isn't accepting responses." : "Form is live." };
}

export async function getFormSubmissions(id: string): Promise<{ form: FormDetail; submissions: FormSubmissionRow[] } | null> {
  await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const form = await FormModel.findById(id).lean<FormLean>();
  if (!form) return null;
  const subs = await FormSubmissionModel.find({ formId: form._id }).sort({ createdAt: -1 }).limit(1000).lean<SubmissionLean[]>();
  return {
    form: toDetail(form),
    submissions: subs.map((s) => ({
      id: String(s._id),
      createdAt: new Date(s.createdAt).toISOString(),
      name: s.name,
      email: s.email,
      phone: s.phone,
      leadId: s.leadId ? String(s.leadId) : null,
      leadNo: s.leadNo,
      answers: (s.answers ?? []).map((a) => ({ fieldId: a.fieldId, label: a.label, value: a.value })),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Public: /f/[slug]                                                   */
/* ------------------------------------------------------------------ */

export type PublicForm = PublicFormView & { slug: string; active: boolean };

/** Public storefront data: the form's schema, or null when it doesn't exist. */
export async function getPublicForm(slug: string): Promise<PublicForm | null> {
  if (typeof slug !== "string" || slug.length > 60) return null;
  await connectDB();
  const form = await FormModel.findOne({ slug: slug.toLowerCase() }).lean<FormLean>();
  if (!form) return null;
  const d = toDetail(form);
  return { slug: d.slug, active: d.active, title: d.title, description: d.description, thankYouMessage: d.thankYouMessage, fields: d.fields };
}

export type SubmitFormOutcome = { ok: boolean; message: string; errors?: Record<string, string> };

async function createLeadNo(): Promise<string> {
  const count = await LeadModel.countDocuments();
  return `LD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Public, unauthenticated. Validates the answers against the *stored* form
 * (never the browser's copy), stores them, and creates a Lead — or adds a note
 * to the open lead with the same email. Rate-limited per IP; honeypot-protected.
 */
export async function submitForm(slug: string, input: unknown): Promise<SubmitFormOutcome> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `form|${ip}`;
  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return { ok: false, message: `Too many submissions from this network. Try again in ${limit.retryAfterSeconds}s.` };
  }

  const parsed = FormSubmitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please check the form and try again." };

  await connectDB();
  const form = typeof slug === "string" ? await FormModel.findOne({ slug: slug.toLowerCase() }).lean<FormLean>() : null;
  if (!form) return { ok: false, message: "This form no longer exists." };
  if (!form.active) return { ok: false, message: "This form is not accepting responses right now." };

  const fields = cleanFields(form.fields ?? []);
  const { errors, values } = validateAnswers(fields, parsed.data.answers);
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  // Every accepted submission counts toward the per-IP limit (5 per 10 min).
  recordFailure(key);
  const thanks = form.thankYouMessage || DEFAULT_THANK_YOU;
  // Honeypot filled → a bot. Pretend success, store nothing.
  if (parsed.data.website) return { ok: true, message: thanks };

  const map = leadFieldMap(fields);
  const email = map.email ? values[map.email.id].toLowerCase() : "";
  const phone = map.phone ? values[map.phone.id] : "";
  const course = map.course ? values[map.course.id] : "";
  const name = (map.name ? values[map.name.id] : "") || email || phone || "Web form respondent";
  if (!email && !phone) {
    return { ok: false, message: "Please add an email or phone number so we can reach you." };
  }

  const now = new Date();
  const noteText = `Submitted the “${form.title}” form${course ? ` (${course})` : ""}.`;
  let leadId: mongoose.Types.ObjectId;
  let leadNo: string;

  // Same email with an open lead → refresh it, don't duplicate.
  const open = email
    ? await LeadModel.findOne({ email, stage: { $nin: ["converted", "lost"] } }).lean<LeadLean>()
    : null;
  if (open) {
    leadId = open._id;
    leadNo = open.leadNo;
    await LeadModel.updateOne(
      { _id: open._id },
      {
        $set: {
          ...(phone && !open.phone ? { phone } : {}),
          ...(course && !open.interestedCourse ? { interestedCourse: course } : {}),
        },
        $push: { notes: { text: noteText, byName: "Web Form", at: now } },
      },
    );
  } else {
    let created: { _id: mongoose.Types.ObjectId; leadNo: string } | null = null;
    // Lead numbers are count-based; retry if two submissions race for one.
    for (let attempt = 0; attempt < 3 && !created; attempt++) {
      try {
        const doc = await LeadModel.create({
          leadNo: await createLeadNo(),
          name,
          email,
          phone,
          type: "student",
          stage: "new",
          priority: "medium",
          source: "form",
          interestedCourse: course,
          ownerName: "Unassigned",
          notes: [{ text: noteText, byName: "Web Form", at: now }],
        });
        created = { _id: doc._id as mongoose.Types.ObjectId, leadNo: doc.leadNo };
      } catch (err) {
        if ((err as { code?: number }).code !== 11000) throw err;
      }
    }
    if (!created) return { ok: false, message: "Could not save your response. Please try again." };
    leadId = created._id;
    leadNo = created.leadNo;
  }

  await FormSubmissionModel.create({
    formId: form._id,
    formTitle: form.title,
    answers: fields.map((f) => ({ fieldId: f.id, label: f.label, value: values[f.id] ?? "" })),
    name,
    email,
    phone,
    leadId,
    leadNo,
  });
  await FormModel.updateOne({ _id: form._id }, { $inc: { submissionCount: 1 } });
  await writeSystemAudit(open ? "form response added to lead" : "form response received", `${form.title} → ${leadNo} — ${name}`);
  return { ok: true, message: thanks };
}

/**
 * Client-safe Form Builder helpers, shared by the builder, its live preview,
 * the public /f/[slug] page and the server-side submission check — so the
 * preview, the browser and the server all apply exactly the same rules.
 */

export type FormFieldType = "text" | "email" | "phone" | "number" | "select" | "textarea" | "checkbox" | "date";

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[];
  placeholder: string;
}

/** What the public page (and the builder preview) needs to render a form. */
export interface PublicFormView {
  title: string;
  description: string;
  thankYouMessage: string;
  fields: FormField[];
}

export type FormAnswers = Record<string, string>;

export const FIELD_TYPES: { value: FormFieldType; label: string; hint: string }[] = [
  { value: "text", label: "Short text", hint: "Name, city, school…" },
  { value: "email", label: "Email", hint: "Becomes the lead's email" },
  { value: "phone", label: "Phone", hint: "Becomes the lead's phone" },
  { value: "number", label: "Number", hint: "Marks, age, class…" },
  { value: "select", label: "Dropdown", hint: "Pick one option" },
  { value: "textarea", label: "Long text", hint: "Questions, comments" },
  { value: "checkbox", label: "Checkbox", hint: "Yes / no consent" },
  { value: "date", label: "Date", hint: "Preferred date, DOB" },
];

export const fieldTypeLabel = (t: FormFieldType) => FIELD_TYPES.find((f) => f.value === t)?.label ?? t;

export const MAX_FIELDS = 30;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const DEFAULT_THANK_YOU = "Thank you! Our team will get in touch with you shortly.";

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "form"
  );
}

export function newFieldId(): string {
  return `f_${Math.random().toString(36).slice(2, 10)}`;
}

export function blankField(type: FormFieldType): FormField {
  const label = type === "checkbox" ? "I agree to be contacted" : fieldTypeLabel(type);
  return {
    id: newFieldId(),
    label,
    type,
    required: false,
    options: type === "select" ? ["Option 1", "Option 2"] : [],
    placeholder: "",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9\s()-]{7,20}$/;

/**
 * Check answers against a form's fields. Returns per-field error messages
 * (empty object = valid) plus the cleaned answers, keyed by field id. Unknown
 * keys are dropped; checkbox answers are normalised to "Yes" / "No".
 */
export function validateAnswers(
  fields: FormField[],
  raw: Record<string, unknown>,
): { errors: Record<string, string>; values: FormAnswers } {
  const errors: Record<string, string> = {};
  const values: FormAnswers = {};
  for (const f of fields) {
    const input = raw[f.id];
    if (f.type === "checkbox") {
      const checked = input === true || input === "Yes" || input === "true" || input === "on";
      if (f.required && !checked) errors[f.id] = "Please tick this box to continue.";
      values[f.id] = checked ? "Yes" : "No";
      continue;
    }
    const v = typeof input === "string" ? input.trim() : typeof input === "number" ? String(input) : "";
    values[f.id] = v;
    if (!v) {
      if (f.required) errors[f.id] = `${f.label} is required.`;
      continue;
    }
    const max = f.type === "textarea" ? 2000 : 200;
    if (v.length > max) {
      errors[f.id] = `Keep this under ${max} characters.`;
      continue;
    }
    if (f.type === "email" && !EMAIL_RE.test(v)) errors[f.id] = "Enter a valid email address.";
    if (f.type === "phone" && !PHONE_RE.test(v)) errors[f.id] = "Enter a valid phone number.";
    if (f.type === "number" && !Number.isFinite(Number(v))) errors[f.id] = "Enter a number.";
    if (f.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(new Date(v).getTime()))) {
      errors[f.id] = "Enter a valid date.";
    }
    if (f.type === "select" && !f.options.includes(v)) errors[f.id] = "Choose one of the options.";
  }
  return { errors, values };
}

/** Pick the fields that map onto the lead: name, email, phone and course. */
export function leadFieldMap(fields: FormField[]) {
  const byLabel = (re: RegExp, types: FormFieldType[]) => fields.find((f) => types.includes(f.type) && re.test(f.label));
  return {
    // "Student name" beats "Parent name" / "School name".
    name:
      fields.find((f) => f.type === "text" && /name/i.test(f.label) && !/parent|guardian|father|mother|school|college/i.test(f.label)) ??
      byLabel(/name/i, ["text"]) ??
      fields.find((f) => f.type === "text"),
    email: fields.find((f) => f.type === "email"),
    phone: fields.find((f) => f.type === "phone"),
    course: byLabel(/course|program|programme|class/i, ["select", "text"]),
  };
}

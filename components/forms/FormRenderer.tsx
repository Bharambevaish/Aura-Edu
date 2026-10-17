"use client";

/**
 * Renders a Form Builder form. The same component powers the public
 * /f/[slug] page and the builder's live preview, so the preview is exactly
 * what visitors see. In preview mode (no `onSubmit`) submitting only runs the
 * client-side checks and shows the thank-you screen; nothing is saved.
 *
 * Every form ends with the privacy-notice consent box. It is not a builder
 * field: it is always present and the submit action re-checks it.
 */
import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { DEFAULT_THANK_YOU, validateAnswers, type FormField, type PublicFormView } from "@/lib/forms";

type Outcome = { ok: boolean; message: string; errors?: Record<string, string> };

export type FormConsent = { consent: boolean; byGuardian: boolean };

interface Props {
  form: PublicFormView;
  /** Live submit; omit for the builder preview. */
  onSubmit?: (answers: Record<string, string | boolean>, website: string, consent: FormConsent) => Promise<Outcome>;
  closed?: boolean;
  /** Named in the consent text; defaults to "the institute". */
  instituteName?: string;
}

const CONSENT_ERROR = "Please agree to the Privacy Notice to continue.";

const inputCls =
  "w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all";

function FieldInput({ field, value, onChange }: { field: FormField; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const id = `ff-${field.id}`;
  const text = typeof value === "string" ? value : "";
  switch (field.type) {
    case "textarea":
      return <textarea id={id} rows={4} className={inputCls} placeholder={field.placeholder} value={text} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select id={id} className={inputCls} value={text} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <label htmlFor={id} className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
          <input id={id} type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-500" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
          <span>
            {field.label}
            {field.required && <span className="text-rose-400"> *</span>}
          </span>
        </label>
      );
    default: {
      const type = field.type === "phone" ? "tel" : field.type;
      return (
        <input
          id={id}
          type={type}
          inputMode={field.type === "phone" ? "tel" : field.type === "number" ? "decimal" : undefined}
          className={inputCls}
          placeholder={field.placeholder || (field.type === "phone" ? "+91" : "")}
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
  }
}

export function FormRenderer({ form, onSubmit, closed, instituteName }: Props) {
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState("");
  const [consent, setConsent] = useState<FormConsent>({ consent: false, byGuardian: false });
  const preview = !onSubmit;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const check = validateAnswers(form.fields, values);
    const nextErrors = { ...check.errors, ...(consent.consent ? {} : { "@privacy": CONSENT_ERROR }) };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMessage(Object.keys(check.errors).length ? "Please fix the highlighted fields." : CONSENT_ERROR);
      return;
    }
    if (preview) {
      setDone(form.thankYouMessage || DEFAULT_THANK_YOU);
      return;
    }
    setBusy(true);
    try {
      const res = await onSubmit(values, website, consent);
      if (res.ok) setDone(res.message);
      else {
        setErrors(res.errors ?? {});
        setMessage(res.message);
      }
    } catch {
      setMessage("Could not submit right now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setValues({});
    setConsent({ consent: false, byGuardian: false });
    setErrors({});
    setMessage(null);
    setDone(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      {done ? (
        <div className="text-center py-8 space-y-4">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Response received</h2>
          <p className="text-slate-300 whitespace-pre-line">{done}</p>
          <button type="button" onClick={reset} className="text-sm text-emerald-400 hover:text-emerald-300">
            {preview ? "Back to the form (preview)" : "Submit another response"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5 relative">
          <div>
            <h1 className="text-2xl font-bold text-white">{form.title || "Untitled form"}</h1>
            {form.description && <p className="text-sm text-slate-400 mt-2 whitespace-pre-line">{form.description}</p>}
          </div>

          {closed && (
            <p className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> This form is not accepting responses right now.
            </p>
          )}

          {/* Honeypot — hidden from people, filled by bots. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          {form.fields.length === 0 && <p className="text-sm text-slate-500">No fields yet.</p>}
          {form.fields.map((f) => (
            <div key={f.id}>
              {f.type !== "checkbox" && (
                <label htmlFor={`ff-${f.id}`} className="block text-sm font-medium text-slate-300 mb-1.5">
                  {f.label || "Untitled field"}
                  {f.required && <span className="text-rose-400"> *</span>}
                </label>
              )}
              <FieldInput field={f} value={values[f.id] ?? (f.type === "checkbox" ? false : "")} onChange={(v) => setValues((s) => ({ ...s, [f.id]: v }))} />
              {errors[f.id] && <p className="text-xs text-rose-400 mt-1">{errors[f.id]}</p>}
            </div>
          ))}

          {form.fields.length > 0 && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <label htmlFor="ff-privacy-consent" className="flex items-start gap-3 text-sm text-slate-200 cursor-pointer">
                <input
                  id="ff-privacy-consent"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-emerald-500"
                  checked={consent.consent}
                  onChange={(e) => setConsent((c) => ({ ...c, consent: e.target.checked }))}
                />
                <span>
                  I agree to the{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-emerald-400 underline hover:text-emerald-300">
                    Privacy Notice
                  </Link>{" "}
                  and consent to {instituteName || "the institute"} processing this data to respond to this enquiry and for admission.
                  <span className="text-rose-400"> *</span>
                </span>
              </label>
              <label htmlFor="ff-privacy-guardian" className="flex items-start gap-3 text-sm text-slate-400 cursor-pointer">
                <input
                  id="ff-privacy-guardian"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-emerald-500"
                  checked={consent.byGuardian}
                  onChange={(e) => setConsent((c) => ({ ...c, byGuardian: e.target.checked }))}
                />
                <span>The student is under 18 and I am their parent/guardian, giving consent on their behalf.</span>
              </label>
              {errors["@privacy"] && <p className="text-xs text-rose-400">{errors["@privacy"]}</p>}
            </div>
          )}

          {message && (
            <p className="flex items-center gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || closed || form.fields.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}

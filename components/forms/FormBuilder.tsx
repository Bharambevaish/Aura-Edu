"use client";

/**
 * Two-pane Form Builder: settings, field palette and field editor on the
 * left; a live preview on the right rendered by the same <FormRenderer> the
 * public /f/[slug] page uses.
 */
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowDown, ArrowUp, Trash2, Plus, Eye, ExternalLink, Save } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { FIELD_TYPES, MAX_FIELDS, blankField, fieldTypeLabel, slugify, type FormField, type FormFieldType } from "@/lib/forms";
import { createForm, updateForm, type FormDetail } from "@/lib/actions/forms";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const labelCls = "block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1";

type Draft = {
  title: string;
  slug: string;
  description: string;
  thankYouMessage: string;
  active: boolean;
  fields: FormField[];
};

const STARTER: Draft = {
  title: "",
  slug: "",
  description: "",
  thankYouMessage: "",
  active: true,
  fields: [
    { ...blankField("text"), label: "Full name", required: true, placeholder: "Your name" },
    { ...blankField("phone"), label: "Phone number", required: true },
    { ...blankField("email"), label: "Email address", placeholder: "you@example.com" },
  ],
};

export function FormBuilder({ initial }: { initial?: FormDetail }) {
  const router = useRouter();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(() =>
    initial
      ? {
          title: initial.title,
          slug: initial.slug,
          description: initial.description,
          thankYouMessage: initial.thankYouMessage,
          active: initial.active,
          fields: initial.fields,
        }
      : STARTER,
  );
  // Until the admin types a link name, it follows the title.
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setField = (id: string, patch: Partial<FormField>) =>
    setDraft((d) => ({ ...d, fields: d.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  const addField = (type: FormFieldType) => {
    if (draft.fields.length >= MAX_FIELDS) return toast(`Up to ${MAX_FIELDS} fields per form.`, "error");
    set("fields", [...draft.fields, blankField(type)]);
  };
  const move = (index: number, dir: -1 | 1) => {
    const next = [...draft.fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set("fields", next);
  };
  const remove = (id: string) => set("fields", draft.fields.filter((f) => f.id !== id));

  const slug = slugTouched ? draft.slug : draft.title ? slugify(draft.title) : "";

  // What the preview and the server receive: options trimmed, blanks dropped.
  const cleaned = useMemo(
    () => draft.fields.map((f) => ({ ...f, label: f.label.trim(), options: f.options.map((o) => o.trim()).filter(Boolean) })),
    [draft.fields],
  );
  const previewForm = { title: draft.title, description: draft.description, thankYouMessage: draft.thankYouMessage, fields: cleaned };

  const save = async () => {
    setBusy(true);
    const payload = { ...draft, slug, fields: cleaned };
    const res = initial ? await updateForm(initial.id, payload) : await createForm(payload);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (!res.ok) return;
    if (initial) set("slug", slug);
    else router.push("/admin-dashboard/lms/forms");
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin-dashboard/lms/forms" className="text-slate-400 hover:text-white" title="Back to forms">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Form Builder</p>
            <h1 className="text-sm font-bold text-white truncate">{initial ? `Edit “${initial.title}”` : "Create new form"}</h1>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {draft.fields.length} field{draft.fields.length === 1 ? "" : "s"}
            {initial ? ` · ${initial.submissionCount} response${initial.submissionCount === 1 ? "" : "s"}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {initial && (
            <a href={`/f/${slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white">
              <ExternalLink size={14} /> Open public form
            </a>
          )}
          <Button size="sm" onClick={save} disabled={busy}>
            <Save size={14} /> {busy ? "Saving…" : initial ? "Save changes" : "Create form"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left: settings + fields */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} placeholder="e.g. Free Demo Class Request" value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea rows={2} className={inputCls} placeholder="Shown under the title" value={draft.description} onChange={(e) => set("description", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Public link</label>
                <div className="flex items-center">
                  <span className="px-2 py-2 text-sm text-slate-500 bg-slate-900/70 border border-r-0 border-slate-700 rounded-l-lg">/f/</span>
                  <input
                    className={`${inputCls} rounded-l-none`}
                    placeholder="auto from title"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                    }}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-300 pb-2">
                  <input type="checkbox" checked={draft.active} onChange={(e) => set("active", e.target.checked)} /> Accepting responses
                </label>
              </div>
            </div>
            <div>
              <label className={labelCls}>Thank-you message</label>
              <textarea rows={2} className={inputCls} placeholder="Thank you! Our team will get in touch with you shortly." value={draft.thankYouMessage} onChange={(e) => set("thankYouMessage", e.target.value)} />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <p className="text-sm font-semibold text-white mb-1">Add a field</p>
            <p className="text-[11px] text-slate-500 mb-3">Name, Email and Phone fields fill the lead created by each response.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => addField(t.value)}
                  title={t.hint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-slate-900/40 text-xs text-slate-200 hover:border-emerald-500/50 hover:text-white"
                >
                  <Plus size={12} className="text-emerald-400" /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {draft.fields.map((f, i) => (
              <div key={f.id} className="glass-panel rounded-2xl p-4 space-y-3" data-field={f.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    {i + 1}. {fieldTypeLabel(f.type)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30" title="Move up">
                      <ArrowUp size={13} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === draft.fields.length - 1} className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30" title="Move down">
                      <ArrowDown size={13} />
                    </button>
                    <button type="button" onClick={() => remove(f.id)} className="p-1.5 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400" title="Remove field">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Label</label>
                    <input className={inputCls} value={f.label} onChange={(e) => setField(f.id, { label: e.target.value })} />
                  </div>
                  {f.type !== "checkbox" && f.type !== "select" && (
                    <div>
                      <label className={labelCls}>Placeholder</label>
                      <input className={inputCls} value={f.placeholder} onChange={(e) => setField(f.id, { placeholder: e.target.value })} />
                    </div>
                  )}
                </div>
                {f.type === "select" && (
                  <div>
                    <label className={labelCls}>Options (one per line)</label>
                    <textarea rows={3} className={inputCls} value={f.options.join("\n")} onChange={(e) => setField(f.id, { options: e.target.value.split("\n") })} />
                  </div>
                )}
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={f.required} onChange={(e) => setField(f.id, { required: e.target.checked })} /> Required
                </label>
              </div>
            ))}
            {draft.fields.length === 0 && <p className="text-sm text-slate-500 px-1">No fields yet — add one above.</p>}
          </div>
        </div>

        {/* Right: live preview */}
        <div className="xl:sticky xl:top-4 space-y-2">
          <p className="flex items-center gap-2 text-xs text-slate-400">
            <Eye size={14} className="text-emerald-400" /> Live preview — exactly what visitors see at <span className="text-slate-200">/f/{slug || "…"}</span>
          </p>
          <div className="rounded-2xl bg-[#070B14] border border-white/5 p-4 sm:p-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
            <FormRenderer form={previewForm} closed={!draft.active} />
          </div>
        </div>
      </div>
    </div>
  );
}

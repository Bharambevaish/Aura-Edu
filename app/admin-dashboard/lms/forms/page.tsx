"use client";

/**
 * Form Management Center — every Form Builder form on live data, with its
 * public link, embed snippet, response count and quick actions.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Edit2, Trash2, Copy, Link2, Code2, Inbox, CopyPlus, ExternalLink } from "lucide-react";
import { PageHeader, Button, Modal, useToast } from "@/components/ui";
import { getForms, deleteForm, duplicateForm, toggleFormActive, type FormRow } from "@/lib/actions/forms";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

// Only called from event handlers / the open modal, so `window` is defined.
const origin = () => window.location.origin;
const embedCode = (f: FormRow) =>
  `<iframe src="${origin()}/f/${f.slug}?embed=1" title="${f.title.replace(/"/g, "&quot;")}" width="100%" height="760" style="border:0;max-width:640px" loading="lazy"></iframe>`;

export default function AllFormsPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<FormRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);
  const [embedFor, setEmbedFor] = useState<FormRow | null>(null);

  useEffect(() => {
    let ignore = false;
    getForms()
      .then((r) => !ignore && setRows(r))
      .catch(() => toast("Could not load forms.", "error"));
    return () => {
      ignore = true;
    };
  }, [reload, toast]);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => !q || r.title.toLowerCase().includes(q) || r.slug.includes(q));
  }, [rows, query]);

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${what} copied.`, "success");
    } catch {
      toast("Copy failed — select the text and copy it manually.", "error");
    }
  };

  const run = async (p: Promise<{ ok: boolean; message: string }>) => {
    const res = await p;
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) refresh();
  };

  const remove = (f: FormRow) => {
    if (!confirm(`Delete “${f.title}” and its ${f.submissionCount} stored response(s)? Leads it created are kept.`)) return;
    run(deleteForm(f.id));
  };

  const totalResponses = (rows ?? []).reduce((n, r) => n + r.submissionCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Form Management Center" subtitle="Build lead-capture forms, share or embed them, and track every response." icon={<FileText size={20} className="text-emerald-400" />}>
        <Link href="/admin-dashboard/lms/forms/create">
          <Button size="sm">
            <Plus size={14} /> Create form
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          ["Forms", rows?.length ?? "–"],
          ["Live", rows ? rows.filter((r) => r.active).length : "–"],
          ["Responses", rows ? totalResponses : "–"],
        ].map(([label, value]) => (
          <div key={label} className="glass-panel rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input className={`${inputCls} pl-8`} placeholder="Search forms…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Fields</th>
                <th className="py-3 px-4">Responses</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Share</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!rows && (
                <tr><td colSpan={6} className="py-6 px-4 text-slate-500">Loading…</td></tr>
              )}
              {rows && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-slate-500">
                    {rows.length === 0 ? (
                      <>No forms yet. <Link href="/admin-dashboard/lms/forms/create" className="text-emerald-400 hover:text-emerald-300">Create your first form</Link>.</>
                    ) : (
                      "No forms match your search."
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((f) => (
                <tr key={f.id} className="border-b border-white/5">
                  <td className="py-3 px-4">
                    <Link href={`/admin-dashboard/lms/forms/${f.id}/edit`} className="text-white hover:text-emerald-300 font-medium">{f.title}</Link>
                    <p className="text-[11px] text-slate-500">/f/{f.slug} · by {f.createdByName} · updated {new Date(f.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{f.fieldCount}</td>
                  <td className="py-3 px-4">
                    <Link href={`/admin-dashboard/lms/forms/${f.id}/submissions`} className="inline-flex items-center gap-1.5 text-slate-200 hover:text-emerald-300">
                      <Inbox size={13} /> {f.submissionCount}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => run(toggleFormActive(f.id))}
                      title={f.active ? "Click to stop accepting responses" : "Click to go live"}
                      className={`px-2 py-0.5 rounded-full text-[11px] border ${f.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
                    >
                      {f.active ? "Live" : "Closed"}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => copy(`${origin()}/f/${f.slug}`, "Public link")} className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-300 hover:text-white" title="Copy public link">
                        <Link2 size={12} /> Link
                      </button>
                      <button onClick={() => setEmbedFor(f)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-xs text-slate-300 hover:text-white" title="Get embed code">
                        <Code2 size={12} /> Embed
                      </button>
                      <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer" className="flex items-center px-2 py-1 rounded-md bg-slate-800 text-slate-300 hover:text-white" title="Open public form">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin-dashboard/lms/forms/${f.id}/edit`} className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-blue-400" title="Edit">
                        <Edit2 size={14} />
                      </Link>
                      <button onClick={() => run(duplicateForm(f.id))} className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-emerald-400" title="Duplicate">
                        <CopyPlus size={14} />
                      </button>
                      <button onClick={() => remove(f)} className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-slate-500 border-t border-white/5">
          Every response creates a lead (source “Web Form”) in Leads, or adds a note to the open lead with the same email.
        </p>
      </div>

      <Modal
        open={!!embedFor}
        onClose={() => setEmbedFor(null)}
        title="Embed this form"
        description={embedFor ? `Paste this into any web page to show “${embedFor.title}” without the site header.` : undefined}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEmbedFor(null)}>Close</Button>
            {embedFor && (
              <Button size="sm" onClick={() => copy(embedCode(embedFor), "Embed code")}>
                <Copy size={14} /> Copy code
              </Button>
            )}
          </>
        }
      >
        {embedFor && (
          <div className="space-y-3">
            <textarea readOnly rows={4} className={`${inputCls} font-mono text-xs`} value={embedCode(embedFor)} onFocus={(e) => e.target.select()} />
            <p className="text-xs text-slate-400">
              Preview the embedded version:{" "}
              <a href={`/f/${embedFor.slug}?embed=1`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300">/f/{embedFor.slug}?embed=1</a>
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

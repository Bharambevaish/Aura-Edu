"use client";

/**
 * A form's responses: one column per field (labels as they were when the
 * response came in), the lead it created, and CSV export.
 */
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Edit2, ExternalLink, Inbox } from "lucide-react";
import { PageHeader, Button, useToast } from "@/components/ui";
import { getFormSubmissions, type FormDetail, type FormSubmissionRow } from "@/lib/actions/forms";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function FormSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<{ form: FormDetail; submissions: FormSubmissionRow[] } | null | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    getFormSubmissions(id)
      .then((d) => !ignore && setData(d))
      .catch(() => {
        if (ignore) return;
        setData(null);
        toast("Could not load responses.", "error");
      });
    return () => {
      ignore = true;
    };
  }, [id, toast]);

  // Columns: the form's current fields, then any older field that only
  // exists on past responses.
  const columns = useMemo(() => {
    if (!data) return [];
    const cols = data.form.fields.map((f) => ({ id: f.id, label: f.label }));
    const seen = new Set(cols.map((c) => c.id));
    for (const s of data.submissions) {
      for (const a of s.answers) {
        if (!seen.has(a.fieldId)) {
          seen.add(a.fieldId);
          cols.push({ id: a.fieldId, label: a.label });
        }
      }
    }
    return cols;
  }, [data]);

  if (data === undefined) return <p className="text-sm text-slate-400">Loading responses…</p>;
  if (data === null)
    return (
      <p className="text-sm text-slate-400">
        Form not found. <Link href="/admin-dashboard/lms/forms" className="text-emerald-400">Back to forms</Link>
      </p>
    );

  const { form, submissions } = data;
  const answer = (s: FormSubmissionRow, fieldId: string) => s.answers.find((a) => a.fieldId === fieldId)?.value ?? "";

  const exportCsv = () => {
    const header = ["Submitted", ...columns.map((c) => c.label), "Lead No"];
    const lines = submissions.map((s) =>
      [fmt(s.createdAt), ...columns.map((c) => answer(s, c.id)), s.leadNo]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.map((h) => `"${h.replace(/"/g, '""')}"`).join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.slug}-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={form.title} subtitle={`${submissions.length} response${submissions.length === 1 ? "" : "s"} · /f/${form.slug} · ${form.active ? "Live" : "Closed"}`} icon={<Inbox size={20} className="text-emerald-400" />}>
        <Link href="/admin-dashboard/lms/forms">
          <Button size="sm" variant="secondary"><ArrowLeft size={14} /> All forms</Button>
        </Link>
        <Link href={`/admin-dashboard/lms/forms/${form.id}/edit`}>
          <Button size="sm" variant="secondary"><Edit2 size={14} /> Edit form</Button>
        </Link>
        <Button size="sm" onClick={exportCsv} disabled={submissions.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
      </PageHeader>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <th className="py-3 px-4 whitespace-nowrap">Submitted</th>
                {columns.map((c) => (
                  <th key={c.id} className="py-3 px-4 whitespace-nowrap">{c.label}</th>
                ))}
                <th className="py-3 px-4 whitespace-nowrap">Lead</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-10 px-4 text-center text-slate-500">
                    No responses yet. Share <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer" className="text-emerald-400">/f/{form.slug}</a> to start collecting them.
                  </td>
                </tr>
              )}
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-white/5 align-top">
                  <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">{fmt(s.createdAt)}</td>
                  {columns.map((c) => (
                    <td key={c.id} className="py-3 px-4 text-slate-200 max-w-[260px] break-words">{answer(s, c.id) || <span className="text-slate-600">—</span>}</td>
                  ))}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {s.leadNo ? (
                      <Link href={`/admin-dashboard/lms/leads?q=${encodeURIComponent(s.leadNo)}`} className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                        {s.leadNo} <ExternalLink size={12} />
                      </Link>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

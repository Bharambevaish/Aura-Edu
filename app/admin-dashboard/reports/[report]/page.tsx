"use client";

/** One live report: summary, bar chart (when it has one), table, CSV export. */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { runReport, type ReportResult } from "@/lib/actions/reports";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function ReportPage() {
  const { report } = useParams<{ report: string }>();
  const [data, setData] = useState<ReportResult | null | undefined>(undefined);

  useEffect(() => {
    let ignore = false;
    runReport(report)
      .then((d) => !ignore && setData(d))
      .catch(() => !ignore && setData(null));
    return () => {
      ignore = true;
    };
  }, [report]);

  if (data === undefined) return <p className="text-sm text-slate-400">Running report…</p>;
  if (data === null) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-400">That report doesn&apos;t exist or isn&apos;t available to you.</p>
        <Link href="/admin-dashboard/reports" className="text-sm text-emerald-400 hover:underline">Back to Reports Hub</Link>
      </div>
    );
  }

  const cell = (v: string | number, col: number) => (data.moneyColumns.includes(col) && typeof v === "number" ? inr(v) : String(v));
  const chart = data.chart;
  const max = chart ? Math.max(1, ...data.rows.map((r) => Number(r[chart.value]) || 0)) : 1;

  const exportCsv = () => {
    const lines = [data.columns, ...data.rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    a.download = `${data.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin-dashboard/reports" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Reports Hub
          </Link>
          <h1 className="text-2xl font-bold text-white">{data.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{data.description}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white/5 text-slate-300 border-white/10">
            {data.key === "payroll-summary" ? "Institute-wide (staff aren't tied to a branch)" : `Branch: ${data.branch ?? "All branches"}`}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!data.rows.length}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {data.summary.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {data.summary.map((s) => (
            <div key={s.label} className="glass-panel rounded-xl px-4 py-3">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {chart && data.rows.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 space-y-2">
          {data.rows.slice(0, 15).map((r, i) => {
            const v = Number(r[chart.value]) || 0;
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="w-44 shrink-0 truncate text-slate-300" title={String(r[chart.label])}>{String(r[chart.label])}</span>
                <div className="flex-1 h-4 rounded bg-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded" style={{ width: `${(v / max) * 100}%` }} />
                </div>
                <span className="w-28 text-right font-mono text-slate-200">{cell(r[chart.value], chart.value)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              {data.columns.map((c) => <th key={c} className="py-3 px-4">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 && (
              <tr><td colSpan={data.columns.length} className="py-8 text-center text-slate-500">No data yet.</td></tr>
            )}
            {data.rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-800/50">
                {r.map((v, j) => (
                  <td key={j} className={`py-2.5 px-4 ${typeof v === "number" ? "font-mono text-slate-200" : "text-slate-300"}`}>{cell(v, j)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

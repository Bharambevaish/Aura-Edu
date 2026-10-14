"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { getAuditTrail, type AuditEntry } from "@/lib/actions/finance";
import { Download, RefreshCw, Search, Shield, User, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

function actionColor(action: string) {
  if (/created|added|recorded|approved/i.test(action)) return "text-emerald-400";
  if (/rejected|deleted|voided|cancelled/i.test(action)) return "text-red-400";
  if (/synced|sync/i.test(action)) return "text-purple-400";
  return "text-slate-300";
}

export default function AuditTrailPage() {
  const [data, setData] = useState<{ stats: { total: number; admin: number; staff: number; system: number }; entries: AuditEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setData(await getAuditTrail()); } catch { toast("Failed to load audit trail", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getAuditTrail()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const filtered = (data?.entries ?? []).filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return e.userName.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.target.toLowerCase().includes(q) || e.eventNo.toLowerCase().includes(q);
  });

  const exportRows = () =>
    filtered.map((r) => ({
      Event: r.eventNo,
      User: r.userName,
      Role: r.isSystem ? "System" : r.userRole,
      Action: r.action,
      Target: r.target || "-",
      "Date & Time": r.createdAt,
    }));

  const exportFile = () => {
    if (filtered.length === 0) { toast("Nothing to export", "error"); return; }
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Audit_Trail_${stamp}.xlsx`);
    toast(`Exported ${filtered.length} audit event(s).`, "success");
  };

  const columns: DataTableColumn<AuditEntry>[] = [
    { key: "eventNo", header: "EVENT", cell: (r) => <span className="text-xs font-mono text-slate-500">{r.eventNo}</span> },
    {
      key: "user",
      header: "USER",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${r.isSystem ? "bg-purple-700" : "bg-blue-700"}`}>
            {r.isSystem ? <Shield size={12} /> : r.userName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-white">{r.userName}</div>
            <div className="text-[10px] text-slate-500">{r.isSystem ? "System" : r.userRole.charAt(0).toUpperCase() + r.userRole.slice(1)}</div>
          </div>
        </div>
      ),
    },
    { key: "action", header: "ACTION", cell: (r) => <span className={`text-xs font-bold capitalize ${actionColor(r.action)}`}>{r.action}</span> },
    { key: "target", header: "TARGET", cell: (r) => <span className="text-xs text-slate-300">{r.target || "-"}</span> },
    { key: "created", header: "DATE & TIME", cell: (r) => <span className="text-xs text-slate-400">{r.createdAt}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Trail" subtitle="Append-only log of financial, admission, academic and account actions." icon={<Shield size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={16} /></Button>
        <Button size="sm" onClick={exportFile} disabled={loading || filtered.length === 0}><Download size={14} />Export</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Events" value={data?.stats.total ?? 0} accent="slate" icon={<FileText size={13} />} />
          <StatCard label="Admin Actions" value={data?.stats.admin ?? 0} accent="emerald" icon={<User size={13} />} />
          <StatCard label="Staff Actions" value={data?.stats.staff ?? 0} accent="blue" icon={<User size={13} />} />
          <StatCard label="System Events" value={data?.stats.system ?? 0} accent="purple" icon={<Shield size={13} />} />
        </div>
      )}

      <div className="relative flex-1 min-w-[240px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search by user, action, or target..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={filtered} keyField={(r) => r.eventNo} emptySlot={<div className="text-center py-12 text-slate-500">No audit events logged yet.</div>} />
      )}
    </div>
  );
}
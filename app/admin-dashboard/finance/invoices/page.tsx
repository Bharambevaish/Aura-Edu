"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getInvoices, syncInvoices, type InvoiceRow } from "@/lib/actions/finance";
import { STATUS_PILL } from "@/lib/finance";
import { RefreshCw, FileText, Loader2, Wallet, AlertTriangle, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function InvoicesPage() {
  const [data, setData] = useState<{ stats: { collected: number; outstanding: number; overdue: number; invoices: number }; invoices: InvoiceRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setData(await getInvoices()); } catch { toast("Failed to load invoices", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getInvoices()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const runSync = async () => {
    setSyncing(true);
    try {
      const res = await syncInvoices();
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok && res.created > 0) await fetchData();
    } catch { toast("Sync failed", "error"); }
    setSyncing(false);
  };

  const columns: DataTableColumn<InvoiceRow>[] = [
    { key: "invoiceNo", header: "INVOICE NO", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.invoiceNo}</span> },
    { key: "student", header: "STUDENT", cell: (r) => <div><p className="text-xs font-bold text-white">{r.studentName}</p><p className="text-[11px] text-slate-500">{r.admissionNo}</p></div> },
    { key: "batch", header: "BATCH", cell: (r) => <span className="text-xs text-slate-300">{r.batch}</span> },
    { key: "total", header: "TOTAL", cell: (r) => <span className="text-xs font-bold text-white">₹{r.total.toLocaleString("en-IN")}</span> },
    { key: "paid", header: "PAID", cell: (r) => <span className="text-xs text-emerald-400 font-bold">₹{r.paid.toLocaleString("en-IN")}</span> },
    { key: "waived", header: "WAIVED", cell: (r) => <span className="text-xs text-purple-400">{r.waived > 0 ? `₹${r.waived.toLocaleString("en-IN")}` : "-"}</span> },
    { key: "due", header: "DUE", cell: (r) => <span className={`text-xs font-bold ${r.due > 0 ? "text-amber-400" : "text-slate-500"}`}>₹{r.due.toLocaleString("en-IN")}</span> },
    { key: "issued", header: "ISSUED", cell: (r) => <span className="text-xs text-slate-400">{r.issueDate}</span> },
    { key: "dueDate", header: "DUE DATE", cell: (r) => <span className="text-xs text-slate-400">{r.dueDate}</span> },
    { key: "status", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${STATUS_PILL[r.status]}`}>{r.status}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Auto-generated fee invoices per active student." icon={<FileText size={20} className="text-blue-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <Button size="sm" loading={syncing} onClick={runSync}><ArrowDownToLine size={14} />Sync Invoices</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Invoices" value={data?.stats.invoices ?? 0} icon={<FileText size={14} />} accent="blue" />
          <StatCard label="Collected" value={`₹${(data?.stats.collected ?? 0).toLocaleString("en-IN")}`} icon={<Wallet size={14} />} accent="emerald" />
          <StatCard label="Outstanding" value={`₹${(data?.stats.outstanding ?? 0).toLocaleString("en-IN")}`} icon={<AlertTriangle size={14} />} accent="amber" />
          <StatCard label="Overdue" value={data?.stats.overdue ?? 0} icon={<CheckCircle2 size={14} />} accent="red" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={data?.invoices ?? []} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No invoices yet — run Sync Invoices to auto-generate for active students.</div>} />
      )}
    </div>
  );
}
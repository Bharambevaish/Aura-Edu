"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getWaivers,
  createWaiver,
  decideWaiver,
  getFinanceStudents,
  type WaiverRow,
} from "@/lib/actions/finance";
import { STATUS_PILL } from "@/lib/finance";
import { Plus, RefreshCw, BadgePercent, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function WaiversPage() {
  const [data, setData] = useState<{ stats: { pending: number; approved: number; total: number }; waivers: WaiverRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<ComboboxOption[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [newLoading, setNewLoading] = useState(false);
  const [decision, setDecision] = useState<{ waiver: WaiverRow; action: "approve" | "reject" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setData(await getWaivers()); } catch { toast("Failed to load waivers", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getWaivers()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    getFinanceStudents().then((s) => {
      if (ignore) return;
      setStudents(s.map((st) => ({ value: st.id, label: st.name, hint: `${st.admissionNo} · ${st.batch}` })));
    });
    return () => { ignore = true; };
  }, [fetchData]);

  const openNew = () => { setStudentId(""); setAmount(""); setReason(""); setNewOpen(true); };

  const runCreate = async () => {
    if (!studentId || !amount || !reason.trim()) { toast("Fill student, amount and reason", "error"); return; }
    setNewLoading(true);
    try {
      const res = await createWaiver({ studentId, amount: Number(amount), reason: reason.trim() });
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) { setNewOpen(false); await fetchData(); }
    } catch { toast("Something went wrong", "error"); }
    setNewLoading(false);
  };

  const runDecision = async () => {
    if (!decision) return;
    setDecisionLoading(true);
    try {
      const res = await decideWaiver(decision.waiver.id, decision.action === "approve" ? "approved" : "rejected", remarks.trim());
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch { toast("Error", "error"); }
    setDecision(null);
    setRemarks("");
    setDecisionLoading(false);
  };

  const columns: DataTableColumn<WaiverRow>[] = [
    { key: "waiverNo", header: "WAIVER NO", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.waiverNo}</span> },
    { key: "student", header: "STUDENT", cell: (r) => <span className="text-xs font-bold text-white">{r.studentName}</span> },
    { key: "amount", header: "AMOUNT", cell: (r) => <span className="text-xs font-bold text-white">₹{r.amount.toLocaleString("en-IN")}</span> },
    { key: "reason", header: "REASON", cell: (r) => <span className="text-xs text-slate-400 max-w-[240px] truncate">{r.reason}</span> },
    { key: "requested", header: "REQUESTED BY", cell: (r) => <span className="text-xs text-slate-400">{r.requestedByName}</span> },
    { key: "status", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${STATUS_PILL[r.status]}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span> },
    {
      key: "actions", header: "", className: "w-[80px]",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "pending" && <button onClick={() => setDecision({ waiver: r, action: "approve" })} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Approve"><CheckCircle2 size={14} /></button>}
          {r.status === "pending" && <button onClick={() => setDecision({ waiver: r, action: "reject" })} className="text-slate-500 hover:text-red-400 transition-colors" title="Reject"><XCircle size={14} /></button>}
          {r.status !== "pending" && <span className="text-[10px] text-slate-600">{r.decidedByName}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Waivers" subtitle="Grant and approve fee waivers / discounts for students." icon={<BadgePercent size={20} className="text-purple-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openNew}><Plus size={14} />New Waiver</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Pending" value={data?.stats.pending ?? 0} icon={<XCircle size={14} />} accent="amber" />
          <StatCard label="Approved" value={data?.stats.approved ?? 0} icon={<CheckCircle2 size={14} />} accent="emerald" />
          <StatCard label="Total" value={data?.stats.total ?? 0} icon={<BadgePercent size={14} />} accent="purple" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={data?.waivers ?? []} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No waivers yet.</div>} />
      )}

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Waiver" description="Request a fee waiver / discount on the student's invoice." footer={<><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button loading={newLoading} onClick={runCreate}>Request Waiver</Button></>}>
        <div className="space-y-4">
          <div><label className={labelCls}>Student *</label><Combobox value={studentId} onChange={setStudentId} options={students} placeholder="Select student" emptyMessage="No students" className="w-full" /></div>
          <div><label className={labelCls}>Amount (₹) *</label><input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} /></div>
          <div><label className={labelCls}>Reason *</label><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. sibling discount, merit scholarship" className={`${inputCls} resize-y`} /></div>
        </div>
      </Modal>

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.action === "approve" ? "Approve Waiver" : "Reject Waiver"} description={decision?.waiver.waiverNo} footer={<><Button variant="ghost" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision?.action === "approve" ? "primary" : "danger"} loading={decisionLoading} onClick={runDecision}>{decision?.action === "approve" ? "Approve" : "Reject"}</Button></>}>
        {decision && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">{decision.action === "approve" ? "Approve" : "Reject"} <span className="text-white font-medium">{decision.waiver.waiverNo}</span> — {decision.waiver.studentName} (₹{decision.waiver.amount.toLocaleString("en-IN")})?</p>
            <div><label className={labelCls}>Remarks (optional)</label><input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
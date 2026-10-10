"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getRefunds,
  getPaidPayments,
  createRefund,
  decideRefund,
  processRefund,
  completeRefund,
  type RefundRow,
} from "@/lib/actions/finance";
import { STATUS_PILL } from "@/lib/finance";
import { Plus, RefreshCw, RotateCcw, Loader2, CheckCircle2, XCircle, Send, Flag } from "lucide-react";
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

export default function RefundsPage() {
  const [data, setData] = useState<{ stats: { pending: number; processed: number; total: number }; refunds: RefundRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<ComboboxOption[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState("");
  const [newLoading, setNewLoading] = useState(false);
  const [decision, setDecision] = useState<{ refund: RefundRow; action: "approve" | "reject" } | null>(null);
  const [remarks, setRemarks] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setData(await getRefunds()); } catch { toast("Failed to load refunds", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getRefunds()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    getPaidPayments().then((ps) => {
      if (ignore) return;
      setPayments(ps.map((p) => ({ value: p.id, label: `${p.receiptNo} — ${p.studentName}`, hint: `₹${p.amount} · ${p.mode}` })));
    });
    return () => { ignore = true; };
  }, []);

  const openNew = () => { setPaymentId(""); setAmount(""); setReason(""); setMethod(""); setNewOpen(true); };

  const runCreate = async () => {
    if (!paymentId || !amount || !reason.trim()) { toast("Fill payment, amount and reason", "error"); return; }
    setNewLoading(true);
    try {
      const res = await createRefund({ paymentId, amount: Number(amount), reason: reason.trim(), method });
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) { setNewOpen(false); await fetchData(); }
    } catch { toast("Something went wrong", "error"); }
    setNewLoading(false);
  };

  const runDecision = async () => {
    if (!decision) return;
    setDecisionLoading(true);
    try {
      const res = await decideRefund(decision.refund.id, decision.action === "approve" ? "approved" : "rejected", remarks.trim());
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch { toast("Error", "error"); }
    setDecision(null);
    setRemarks("");
    setDecisionLoading(false);
  };

  const runProcess = async (r: RefundRow) => {
    try { const res = await processRefund(r.id); toast(res.message, res.ok ? "success" : "error"); if (res.ok) await fetchData(); } catch { toast("Error", "error"); }
  };
  const runComplete = async (r: RefundRow) => {
    try { const res = await completeRefund(r.id); toast(res.message, res.ok ? "success" : "error"); if (res.ok) await fetchData(); } catch { toast("Error", "error"); }
  };

  const columns: DataTableColumn<RefundRow>[] = [
    { key: "refundNo", header: "REFUND NO", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.refundNo}</span> },
    { key: "student", header: "STUDENT", cell: (r) => <span className="text-xs font-bold text-white">{r.studentName}</span> },
    { key: "receipt", header: "PAYMENT", cell: (r) => <span className="text-xs text-slate-400">{r.paymentReceiptNo}</span> },
    { key: "amount", header: "AMOUNT", cell: (r) => <span className="text-xs font-bold text-white">₹{r.amount.toLocaleString("en-IN")}</span> },
    { key: "reason", header: "REASON", cell: (r) => <span className="text-xs text-slate-400 max-w-[220px] truncate">{r.reason}</span> },
    { key: "requested", header: "REQUESTED BY", cell: (r) => <span className="text-xs text-slate-400">{r.requestedByName}</span> },
    { key: "status", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${STATUS_PILL[r.status]}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span> },
    {
      key: "actions", header: "", className: "w-[140px]",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          {r.status === "pending" && <button onClick={() => setDecision({ refund: r, action: "approve" })} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Approve"><CheckCircle2 size={14} /></button>}
          {r.status === "pending" && <button onClick={() => setDecision({ refund: r, action: "reject" })} className="text-slate-500 hover:text-red-400 transition-colors" title="Reject"><XCircle size={14} /></button>}
          {r.status === "approved" && <button onClick={() => runProcess(r)} className="text-slate-500 hover:text-blue-400 transition-colors" title="Process"><Send size={14} /></button>}
          {r.status === "processed" && <button onClick={() => runComplete(r)} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Complete"><Flag size={14} /></button>}
          {r.status !== "pending" && r.status !== "approved" && r.status !== "processed" && <span className="text-[10px] text-slate-600">{r.decidedByName}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" subtitle="Approve, process and complete student payment refunds." icon={<RotateCcw size={20} className="text-red-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openNew}><Plus size={14} />New Refund</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Pending" value={data?.stats.pending ?? 0} icon={<XCircle size={14} />} accent="amber" />
          <StatCard label="Processed / Completed" value={data?.stats.processed ?? 0} icon={<CheckCircle2 size={14} />} accent="emerald" />
          <StatCard label="Total" value={data?.stats.total ?? 0} icon={<RotateCcw size={14} />} accent="red" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={data?.refunds ?? []} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No refunds yet.</div>} />
      )}

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Refund" description="Request a refund against a settled payment." footer={<><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button loading={newLoading} onClick={runCreate}>Request Refund</Button></>}>
        <div className="space-y-4">
          <div><label className={labelCls}>Payment *</label><Combobox value={paymentId} onChange={(v) => { setPaymentId(v); }} options={payments} placeholder="Select a successful payment" emptyMessage="No successful payments" className="w-full" /></div>
          <div><label className={labelCls}>Amount (₹) *</label><input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} /></div>
          <div><label className={labelCls}>Method</label><input type="text" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Original Mode" className={inputCls} /></div>
          <div><label className={labelCls}>Reason *</label><textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is this being refunded?" className={`${inputCls} resize-y`} /></div>
        </div>
      </Modal>

      <Modal open={!!decision} onClose={() => setDecision(null)} title={decision?.action === "approve" ? "Approve Refund" : "Reject Refund"} description={decision?.refund.refundNo} footer={<><Button variant="ghost" onClick={() => setDecision(null)}>Cancel</Button><Button variant={decision?.action === "approve" ? "primary" : "danger"} loading={decisionLoading} onClick={runDecision}>{decision?.action === "approve" ? "Approve" : "Reject"}</Button></>}>
        {decision && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">{decision.action === "approve" ? "Approve" : "Reject"} <span className="text-white font-medium">{decision.refund.refundNo}</span> — {decision.refund.paymentReceiptNo} (₹{decision.refund.amount.toLocaleString("en-IN")})?</p>
            <div><label className={labelCls}>Remarks (optional)</label><input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
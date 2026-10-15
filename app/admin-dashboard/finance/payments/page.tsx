"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getPayments, recordPayment, cancelPayment, getFinanceStudents, type PaymentRow } from "@/lib/actions/finance";
import { getInvoices } from "@/lib/actions/finance";
import { PAYMENT_MODES, PAYMENT_SOURCES, STATUS_PILL } from "@/lib/finance";
import { Plus, RefreshCw, DollarSign, FileText, CheckCircle, Eye, Loader2, RotateCcw, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BranchChip } from "@/components/admin/shell/BranchContext";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function PaymentsPage() {
  const [data, setData] = useState<{ stats: { collected: number; count: number; today: number }; payments: PaymentRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<ComboboxOption[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; invoiceNo: string; studentId: string }[]>([]);
  const [payOpen, setPayOpen] = useState(false);
  const [payStudent, setPayStudent] = useState("");
  const [payInvoice, setPayInvoice] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState<string>(PAYMENT_MODES[0]);
  const [paySource, setPaySource] = useState<string>(PAYMENT_SOURCES[0]);
  const [payFee, setPayFee] = useState("0");
  const [payLoading, setPayLoading] = useState(false);
  const [viewPayment, setViewPayment] = useState<PaymentRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PaymentRow | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setData(await getPayments()); } catch { toast("Failed to load payments", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getPayments()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    getFinanceStudents().then((s) => {
      if (ignore) return;
      setStudents(s.map((st) => ({ value: st.id, label: st.name, hint: `${st.admissionNo} · ${st.batch}` })));
    });
    getInvoices().then((r) => {
      if (ignore) return;
      setInvoices(r.invoices.map((i) => ({ id: i.id, invoiceNo: i.invoiceNo, studentId: i.studentId })));
    });
    return () => { ignore = true; };
  }, []);

  const applicableInvoices = payStudent ? invoices.filter((i) => i.studentId === payStudent) : [];

  const openRecord = () => { setPayStudent(""); setPayInvoice(""); setPayAmount(""); setPayMode(PAYMENT_MODES[0]); setPaySource(PAYMENT_SOURCES[0]); setPayFee("0"); setPayOpen(true); };

  const runRecord = async () => {
    if (!payStudent || !payAmount || Number(payAmount) < 1) { toast("Select student and amount", "error"); return; }
    setPayLoading(true);
    try {
      const res = await recordPayment({ studentId: payStudent, invoiceId: payInvoice, amount: Number(payAmount), mode: payMode, source: paySource, gatewayFee: Number(payFee) || 0, gst: 0 });
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) { setPayOpen(false); await fetchData(); }
    } catch { toast("Something went wrong", "error"); }
    setPayLoading(false);
  };

  const runCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      const res = await cancelPayment(cancelTarget.id);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch { toast("Error", "error"); }
    setCancelTarget(null);
    setCancelLoading(false);
  };

  const filtered = (data?.payments ?? []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.studentName.toLowerCase().includes(q) || p.receiptNo.toLowerCase().includes(q) || p.invoiceNo.toLowerCase().includes(q);
  });

  const columns: DataTableColumn<PaymentRow>[] = [
    { key: "receipt", header: "RECEIPT NO", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.receiptNo}</span> },
    { key: "student", header: "STUDENT", cell: (r) => <span className="text-xs font-bold text-white">{r.studentName}</span> },
    { key: "invoiceNo", header: "INVOICE", cell: (r) => <span className="text-xs text-slate-400">{r.invoiceNo || "-"}</span> },
    { key: "amount", header: "AMOUNT", cell: (r) => <span className="text-xs font-bold text-white">₹{r.amount.toLocaleString("en-IN")}</span> },
    { key: "net", header: "NET", cell: (r) => <span className="text-xs text-slate-400">₹{r.netAmount.toLocaleString("en-IN")}</span> },
    { key: "mode", header: "MODE", cell: (r) => <span className="text-xs text-slate-300">{r.mode}</span> },
    { key: "source", header: "SOURCE", cell: (r) => <span className="text-xs text-slate-400">{r.source}</span> },
    { key: "branch", header: "BRANCH", cell: (r) => <span className="text-xs text-slate-400">{r.branch || "-"}</span> },
    { key: "date", header: "DATE", cell: (r) => <span className="text-xs text-slate-400">{r.recordedAt}</span> },
    { key: "status", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${STATUS_PILL[r.status]}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span> },
    {
      key: "actions", header: "", className: "w-[80px]",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setViewPayment(r)} className="text-slate-500 hover:text-blue-400 transition-colors" title="View"><Eye size={14} /></button>
          {r.status === "success" && <button onClick={() => setCancelTarget(r)} className="text-slate-500 hover:text-red-400 transition-colors" title="Cancel"><RotateCcw size={14} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Student Payments" subtitle="Record offline payments, review the ledger, save receipts." icon={<DollarSign size={20} className="text-emerald-400" />}>
        <BranchChip />
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openRecord}><Plus size={16} />Record Payment</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Total Collected" value={`₹${(data?.stats.collected ?? 0).toLocaleString("en-IN")}`} icon={<DollarSign size={14} />} accent="blue" />
          <StatCard label="Successful Payments" value={data?.stats.count ?? 0} icon={<CheckCircle size={14} />} accent="emerald" />
          <StatCard label="Collected Today" value={`₹${(data?.stats.today ?? 0).toLocaleString("en-IN")}`} icon={<FileText size={14} />} accent="amber" />
          <StatCard label="Refunds + Waivers" value="Track in Refunds" icon={<RotateCcw size={14} />} accent="red" />
        </div>
      )}

      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search receipt, student, invoice..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={filtered} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No payments yet.</div>} />
      )}

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment" description="Create a payment receipt and lift the student's paid balance." size="lg" footer={<><Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button><Button loading={payLoading} onClick={runRecord}>Record Payment</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Student *</label><Combobox value={payStudent} onChange={(v) => { setPayStudent(v); setPayInvoice(""); }} options={students} placeholder="Select student" emptyMessage="No students" /></div>
          <div><label className={labelCls}>Invoice</label><Combobox value={payInvoice} onChange={setPayInvoice} options={payStudent ? [{ value: "", label: "— No invoice —" }, ...applicableInvoices.map((i) => ({ value: i.id, label: i.invoiceNo }))] : []} placeholder={payStudent ? "Select invoice" : "Pick a student first"} emptyMessage="No invoices for this student" /></div>
          <div><label className={labelCls}>Amount (₹) *</label><input type="number" min={1} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0" className={inputCls} /></div>
          <div><label className={labelCls}>Gateway Fee (₹)</label><input type="number" min={0} value={payFee} onChange={(e) => setPayFee(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Mode</label>
            <select value={payMode} onChange={(e) => setPayMode(e.target.value)} className={inputCls}>{PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          </div>
          <div><label className={labelCls}>Source</label>
            <select value={paySource} onChange={(e) => setPaySource(e.target.value)} className={inputCls}>{PAYMENT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewPayment} onClose={() => setViewPayment(null)} title="Payment Details" description={viewPayment?.receiptNo}>
        {viewPayment && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Student</p><p className="text-white mt-1">{viewPayment.studentName}</p></div>
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Invoice</p><p className="text-white mt-1">{viewPayment.invoiceNo || "-"}</p></div>
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Amount</p><p className="text-white mt-1 font-bold">₹{viewPayment.amount.toLocaleString("en-IN")}</p></div>
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Net Amount</p><p className="text-white mt-1">₹{viewPayment.netAmount.toLocaleString("en-IN")}</p></div>
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Mode</p><p className="text-white mt-1">{viewPayment.mode} · {viewPayment.source}</p></div>
            <div><p className="text-[10px] font-bold text-slate-500 uppercase">Status</p><span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border mt-1 ${STATUS_PILL[viewPayment.status]}`}>{viewPayment.status.charAt(0).toUpperCase() + viewPayment.status.slice(1)}</span></div>
          </div>
        )}
      </Modal>

      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Payment" footer={<><Button variant="ghost" onClick={() => setCancelTarget(null)}>Cancel</Button><Button variant="danger" loading={cancelLoading} onClick={runCancel}>Cancel Payment</Button></>}>
        {cancelTarget && <p className="text-sm text-slate-300">Cancel <span className="text-white font-medium">{cancelTarget.receiptNo}</span> (₹{cancelTarget.amount.toLocaleString("en-IN")})? The linked invoice balance will be adjusted.</p>}
      </Modal>
    </div>
  );
}
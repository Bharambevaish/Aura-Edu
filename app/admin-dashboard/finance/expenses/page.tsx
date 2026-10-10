"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getExpenses,
  decideExpense,
  voidExpense,
  deleteExpense,
  type ExpenseRow,
} from "@/lib/actions/finance";
import { EXPENSE_STATUSES, STATUS_PILL } from "@/lib/finance";
import type { ExpenseStatus } from "@/lib/finance";
import {
  Plus,
  RefreshCw,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

type FilterStatus = "all" | ExpenseStatus;

export default function ExpenseTrackerPage() {
  const [data, setData] = useState<{ stats: { pending: number; approved: number; total: number; monthSpend: number }; expenses: ExpenseRow[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [viewExpense, setViewExpense] = useState<ExpenseRow | null>(null);
  const [actionTarget, setActionTarget] = useState<{ expense: ExpenseRow; action: "approve" | "reject" | "void" } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const d = await getExpenses();
      setData(d);
    } catch {
      toast("Failed to load expenses", "error");
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getExpenses()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [fetchData]);

  const filtered = (data?.expenses ?? []).filter((e) => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.refNumber.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const runAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      const res = actionTarget.action === "approve"
        ? await decideExpense(actionTarget.expense.id, { status: "approved", reason: "" })
        : actionTarget.action === "reject"
        ? await decideExpense(actionTarget.expense.id, { status: "rejected", reason: actionReason })
        : await voidExpense(actionTarget.expense.id, actionReason);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch {
      toast("Action failed", "error");
    }
    setActionTarget(null);
    setActionReason("");
    setActionLoading(false);
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await deleteExpense(deleteTarget.id);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch {
      toast("Delete failed", "error");
    }
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const columns: DataTableColumn<ExpenseRow>[] = [
    { key: "refNumber", header: "EXPENSE #", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.refNumber}</span> },
    { key: "title", header: "TITLE", cell: (r) => <div><p className="text-xs font-bold text-white">{r.title}</p><p className="text-[11px] text-slate-500">{r.description.slice(0, 40)}{r.description.length > 40 ? "..." : ""}</p></div> },
    { key: "category", header: "CATEGORY", cell: (r) => <span className="text-xs text-slate-300">{r.category}</span> },
    { key: "vendor", header: "VENDOR", cell: (r) => <span className="text-xs text-slate-400">{r.vendor || "-"}</span> },
    { key: "amount", header: "AMOUNT", cell: (r) => <span className="text-xs font-bold text-white">₹{r.amount.toLocaleString("en-IN")}</span> },
    { key: "date", header: "DATE", cell: (r) => <span className="text-xs text-slate-400">{r.expenseDate}</span> },
    { key: "method", header: "PAYMENT", cell: (r) => <span className="text-xs text-slate-400">{r.paymentMethod}</span> },
    { key: "source", header: "SOURCE", cell: (r) => <span className="text-xs text-slate-400">{r.paymentSource}</span> },
    { key: "createdBy", header: "SUBMITTED BY", cell: (r) => <span className="text-xs text-slate-400">{r.createdByName}</span> },
    { key: "status", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${STATUS_PILL[r.status]}`}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span> },
    {
      key: "actions",
      header: "",
      className: "w-[160px]",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setViewExpense(r)} className="text-slate-500 hover:text-blue-400 transition-colors" title="View"><Eye size={14} /></button>
          {r.status === "pending" && <button onClick={() => router.push(`/admin-dashboard/finance/expenses/create?edit=${r.id}`)} className="text-slate-500 hover:text-amber-400 transition-colors" title="Edit"><Pencil size={14} /></button>}
          {r.status === "pending" && <button onClick={() => setActionTarget({ expense: r, action: "approve" })} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Approve"><CheckCircle2 size={14} /></button>}
          {r.status === "pending" && <button onClick={() => setActionTarget({ expense: r, action: "reject" })} className="text-slate-500 hover:text-red-400 transition-colors" title="Reject"><XCircle size={14} /></button>}
          {(r.status === "pending" || r.status === "rejected") && <button onClick={() => setDeleteTarget(r)} className="text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Tracker" subtitle="Submit, approve and audit every outgoing expense." icon={<DollarSign size={20} className="text-amber-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <span className="text-xs text-slate-500 font-medium">{data?.stats.total ?? 0} records</span>
        <Link href="/admin-dashboard/finance/expenses/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-[#5E9A2E] text-white hover:bg-[#4A7E24] text-sm"><Plus size={16} />New Expense</Link>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Expenses" value={data?.stats.total ?? 0} icon={<DollarSign size={16} />} accent="amber" />
          <StatCard label="Pending Approval" value={data?.stats.pending ?? 0} icon={<Eye size={16} />} accent="purple" />
          <StatCard label="Approved" value={data?.stats.approved ?? 0} icon={<CheckCircle2 size={16} />} accent="emerald" />
          <StatCard label="Approved Spend" value={`₹${(data?.stats.monthSpend ?? 0).toLocaleString("en-IN")}`} icon={<DollarSign size={16} />} accent="blue" />
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by title, ref #, category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500 appearance-none pr-8">
            <option value="all">All Status</option>
            {EXPENSE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={filtered} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No expenses found.</div>} />
      )}

      {/* View modal */}
      <Modal open={!!viewExpense} onClose={() => setViewExpense(null)} title="Expense Details" description={viewExpense?.refNumber}>
        {viewExpense && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</p><p className="text-white mt-1">{viewExpense.title}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount</p><p className="text-white mt-1 font-bold">₹{viewExpense.amount.toLocaleString("en-IN")}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</p><p className="text-white mt-1">{viewExpense.category}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vendor</p><p className="text-white mt-1">{viewExpense.vendor || "-"}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment</p><p className="text-white mt-1">{viewExpense.paymentMethod} ({viewExpense.paymentSource})</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</p><span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border mt-1 ${STATUS_PILL[viewExpense.status]}`}>{viewExpense.status.charAt(0).toUpperCase() + viewExpense.status.slice(1)}</span></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted By</p><p className="text-white mt-1">{viewExpense.createdByName}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved By</p><p className="text-white mt-1">{viewExpense.approvedByName || "-"}</p></div>
            </div>
            {viewExpense.description && <div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</p><p className="text-slate-300 mt-1">{viewExpense.description}</p></div>}
            {viewExpense.rejectedReason && <div><p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Rejection Reason</p><p className="text-slate-300 mt-1">{viewExpense.rejectedReason}</p></div>}
          </div>
        )}
      </Modal>

      {/* Approve / Reject / Void modal */}
      <Modal open={!!actionTarget} onClose={() => setActionTarget(null)} title={actionTarget?.action === "approve" ? "Approve Expense" : actionTarget?.action === "reject" ? "Reject Expense" : "Void Expense"} description={actionTarget?.expense.refNumber} footer={<><Button variant="ghost" onClick={() => setActionTarget(null)}>Cancel</Button><Button variant={actionTarget?.action === "approve" ? "primary" : "danger"} loading={actionLoading} onClick={runAction}>{actionTarget?.action === "approve" ? "Approve" : actionTarget?.action === "reject" ? "Reject" : "Void"}</Button></>}>
        {actionTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Are you sure you want to {actionTarget.action} <span className="text-white font-medium">{actionTarget.expense.refNumber}</span> — {actionTarget.expense.title} (₹{actionTarget.expense.amount.toLocaleString("en-IN")})?</p>
            {(actionTarget.action === "reject" || actionTarget.action === "void") && (
              <div>
                <label className={labelCls}>Reason {actionTarget.action === "void" ? "(required)" : "(optional)"}</label>
                <input type="text" value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Why is this rejected/voided?" className={inputCls} />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" description={deleteTarget?.refNumber} footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" loading={deleteLoading} onClick={runDelete}>Delete</Button></>}>
        {deleteTarget && <p className="text-sm text-slate-300">Delete <span className="text-white font-medium">{deleteTarget.refNumber}</span> — {deleteTarget.title}? This cannot be undone.</p>}
      </Modal>
    </div>
  );
}
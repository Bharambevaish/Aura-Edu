"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getApprovalQueue,
  decideExpense,
  type ExpenseRow,
} from "@/lib/actions/finance";
import {
  CheckCircle2,
  XCircle,
  Eye,
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

export default function ExpenseApprovalsPage() {
  const [queue, setQueue] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewExpense, setViewExpense] = useState<ExpenseRow | null>(null);
  const [actionTarget, setActionTarget] = useState<{ expense: ExpenseRow; action: "approve" | "reject" } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const data = await getApprovalQueue();
      setQueue(data);
    } catch {
      toast("Failed to load approvals", "error");
    }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getApprovalQueue()
      .then((d) => { if (!ignore) setQueue(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [fetchData]);

  const runAction = async () => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      const res = await decideExpense(actionTarget.expense.id, {
        status: actionTarget.action === "approve" ? "approved" : "rejected",
        reason: actionTarget.action === "reject" ? actionReason : "",
      });
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchData();
    } catch {
      toast("Action failed", "error");
    }
    setActionTarget(null);
    setActionReason("");
    setActionLoading(false);
  };

  const columns: DataTableColumn<ExpenseRow>[] = [
    { key: "refNumber", header: "EXPENSE #", cell: (r) => <span className="text-xs font-mono text-slate-400">{r.refNumber}</span> },
    { key: "title", header: "TITLE", cell: (r) => <div><p className="text-xs font-bold text-white">{r.title}</p><p className="text-[11px] text-slate-500">{r.description.slice(0, 40)}</p></div> },
    { key: "category", header: "CATEGORY", cell: (r) => <span className="text-xs text-slate-300">{r.category}</span> },
    { key: "vendor", header: "VENDOR", cell: (r) => <span className="text-xs text-slate-400">{r.vendor || "-"}</span> },
    { key: "amount", header: "AMOUNT", cell: (r) => <span className="text-xs font-bold text-white">₹{r.amount.toLocaleString("en-IN")}</span> },
    { key: "date", header: "DATE", cell: (r) => <span className="text-xs text-slate-400">{r.expenseDate}</span> },
    { key: "createdBy", header: "SUBMITTED BY", cell: (r) => <span className="text-xs text-slate-400">{r.createdByName}</span> },
    {
      key: "actions",
      header: "ACTIONS",
      className: "w-[100px]",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setViewExpense(r)} className="text-slate-500 hover:text-blue-400 transition-colors" title="View"><Eye size={14} /></button>
          <button onClick={() => setActionTarget({ expense: r, action: "approve" })} className="text-slate-500 hover:text-emerald-400 transition-colors" title="Approve"><CheckCircle2 size={14} /></button>
          <button onClick={() => setActionTarget({ expense: r, action: "reject" })} className="text-slate-500 hover:text-red-400 transition-colors" title="Reject"><XCircle size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Approvals" subtitle="Review and decide on pending expense claims." icon={<CheckCircle2 size={20} className="text-emerald-400" />}>
        <span className="text-xs text-slate-500 font-medium">{queue.length} pending</span>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Pending Review" value={queue.length} icon={<CheckCircle2 size={16} />} accent="amber" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={queue} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No pending expenses — all caught up.</div>} />
      )}

      <Modal open={!!viewExpense} onClose={() => setViewExpense(null)} title="Expense Details" description={viewExpense?.refNumber}>
        {viewExpense && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Title</p><p className="text-white mt-1">{viewExpense.title}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Amount</p><p className="text-white mt-1 font-bold">₹{viewExpense.amount.toLocaleString("en-IN")}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Category</p><p className="text-white mt-1">{viewExpense.category}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Vendor</p><p className="text-white mt-1">{viewExpense.vendor || "-"}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Payment</p><p className="text-white mt-1">{viewExpense.paymentMethod}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500 uppercase">Submitted By</p><p className="text-white mt-1">{viewExpense.createdByName}</p></div>
            </div>
            {viewExpense.description && <div><p className="text-[10px] font-bold text-slate-500 uppercase">Description</p><p className="text-slate-300 mt-1">{viewExpense.description}</p></div>}
          </div>
        )}
      </Modal>

      <Modal open={!!actionTarget} onClose={() => setActionTarget(null)} title={actionTarget?.action === "approve" ? "Approve Expense" : "Reject Expense"} description={actionTarget?.expense.refNumber} footer={<><Button variant="ghost" onClick={() => setActionTarget(null)}>Cancel</Button><Button variant={actionTarget?.action === "approve" ? "primary" : "danger"} loading={actionLoading} onClick={runAction}>{actionTarget?.action === "approve" ? "Approve" : "Reject"}</Button></>}>
        {actionTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              {actionTarget.action === "approve" ? "Approve" : "Reject"} <span className="text-white font-medium">{actionTarget.expense.refNumber}</span> — {actionTarget.expense.title} (₹{actionTarget.expense.amount.toLocaleString("en-IN")})?
            </p>
            {actionTarget.action === "reject" && (
              <div>
                <label className={labelCls}>Reason (optional)</label>
                <input type="text" value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="Why is this rejected?" className={inputCls} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
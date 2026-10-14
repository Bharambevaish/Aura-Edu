"use client";

/**
 * Leave — "My leave" for every staff member and admin (balances, request,
 * history) and, for admins, the approval queue.
 */
import React, { useCallback, useEffect, useState } from "react";
import { PageHeader, Button, Modal, useToast } from "@/components/ui";
import { Plane, Check, X } from "lucide-react";
import {
  getMyLeave,
  requestLeave,
  cancelMyLeave,
  getLeaveQueue,
  decideLeave,
  type LeaveRow,
  type LeaveBalance,
} from "@/lib/actions/leave";
import { LEAVE_LABEL } from "@/lib/hr";
import { useIsAdmin } from "@/components/admin/shell/AdminUserContext";
import type { LeaveType } from "@/lib/models/LeaveRequest";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const STATUS: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-rose-500/15 text-rose-300",
  cancelled: "bg-slate-700/50 text-slate-400",
};
const today = () => new Date().toISOString().slice(0, 10);

export default function LeavePage() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [tab, setTab] = useState<"mine" | "approvals">("mine");
  const [mine, setMine] = useState<{ balances: LeaveBalance[]; requests: LeaveRow[] } | null>(null);
  const [queue, setQueue] = useState<Awaited<ReturnType<typeof getLeaveQueue>> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState({ type: "casual" as LeaveType, from: today(), to: today(), reason: "" });
  const [deciding, setDeciding] = useState<{ row: LeaveRow; approve: boolean } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    getMyLeave().then((d) => !ignore && setMine(d)).catch(() => toast("Could not load your leave.", "error"));
    if (isAdmin) getLeaveQueue().then((d) => !ignore && setQueue(d)).catch(() => {});
    return () => {
      ignore = true;
    };
  }, [reloadKey, isAdmin, toast]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const submit = async () => {
    setBusy(true);
    const res = await requestLeave(form);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setForm({ ...form, reason: "" });
      reload();
    }
  };

  const cancel = async (id: string) => {
    const res = await cancelMyLeave(id);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) reload();
  };

  const decide = async () => {
    if (!deciding) return;
    setBusy(true);
    const res = await decideLeave(deciding.row.id, { approve: deciding.approve, note });
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setDeciding(null);
      setNote("");
      reload();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leave" subtitle="Request time off and track approvals." icon={<Plane size={20} className="text-emerald-400" />} />

      {isAdmin && (
        <div className="flex gap-1 bg-slate-900/50 border border-slate-800 rounded-xl p-1 w-fit">
          {(["mine", "approvals"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${tab === t ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {t === "mine" ? "My leave" : `Approvals${queue?.stats.pending ? ` (${queue.stats.pending})` : ""}`}
            </button>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mine?.balances.map((b) => (
              <div key={b.type} className="glass-panel rounded-xl p-4">
                <p className="text-xs text-slate-400">{LEAVE_LABEL[b.type]}</p>
                <p className="text-2xl font-bold text-white mt-1">{b.remaining === null ? b.used : b.remaining}</p>
                <p className="text-[11px] text-slate-500">
                  {b.allowance === null ? "days taken this year" : `left of ${b.allowance} · ${b.used} used`}
                  {b.pending ? ` · ${b.pending} pending` : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white">Request leave</h2>
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}>
                {(Object.keys(LEAVE_LABEL) as LeaveType[]).map((t) => <option key={t} value={t}>{LEAVE_LABEL[t]}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-400 space-y-1"><span>From</span>
                  <input type="date" className={inputCls} value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value, to: e.target.value > form.to ? e.target.value : form.to })} />
                </label>
                <label className="text-xs text-slate-400 space-y-1"><span>To</span>
                  <input type="date" className={inputCls} value={form.to} min={form.from} onChange={(e) => setForm({ ...form, to: e.target.value })} />
                </label>
              </div>
              <textarea className={inputCls} rows={2} placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              <Button size="sm" onClick={submit} disabled={busy || !form.reason.trim()}>Submit request</Button>
              <p className="text-[11px] text-slate-500">Counts working days (Mon–Sat). Unpaid leave reduces that month&apos;s pay.</p>
            </div>

            <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3">My requests</h2>
              {mine && mine.requests.length === 0 && <p className="text-sm text-slate-500">No leave requested yet.</p>}
              <div className="space-y-2">
                {mine?.requests.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
                    <span className="text-white font-medium w-40">{LEAVE_LABEL[r.type]}</span>
                    <span className="text-slate-300">{fmt(r.from)} → {fmt(r.to)}</span>
                    <span className="text-xs text-slate-500">{r.days} day(s)</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS[r.status]}`}>{r.status}</span>
                    {r.decisionNote && <span className="text-xs text-slate-500 italic">“{r.decisionNote}”</span>}
                    {r.status === "pending" && (
                      <button onClick={() => cancel(r.id)} className="ml-auto text-xs text-slate-400 hover:text-rose-300">Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "approvals" && isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="glass-panel rounded-xl p-4"><p className="text-xs text-slate-400">Pending</p><p className="text-2xl font-bold text-amber-300">{queue?.stats.pending ?? "—"}</p></div>
            <div className="glass-panel rounded-xl p-4"><p className="text-xs text-slate-400">Approved this month</p><p className="text-2xl font-bold text-emerald-300">{queue?.stats.approvedThisMonth ?? "—"}</p></div>
            <div className="glass-panel rounded-xl p-4"><p className="text-xs text-slate-400">On leave today</p><p className="text-sm font-semibold text-white mt-2">{queue ? queue.stats.onLeaveToday.join(", ") || "Nobody" : "—"}</p></div>
          </div>
          <div className="glass-panel rounded-2xl p-5 space-y-2">
            {queue?.requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
                <span className="text-white font-semibold w-44">{r.userName}</span>
                <span className="text-slate-300 w-40">{LEAVE_LABEL[r.type]}</span>
                <span className="text-slate-400">{fmt(r.from)} → {fmt(r.to)} · {r.days} day(s)</span>
                <span className="text-xs text-slate-500 flex-1 min-w-[120px] truncate" title={r.reason}>{r.reason}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS[r.status]}`}>{r.status}</span>
                {r.status === "pending" && (
                  <div className="flex gap-1">
                    <button onClick={() => setDeciding({ row: r, approve: true })} className="p-1.5 rounded-md bg-emerald-500/15 text-emerald-300" title="Approve"><Check size={14} /></button>
                    <button onClick={() => setDeciding({ row: r, approve: false })} className="p-1.5 rounded-md bg-rose-500/15 text-rose-300" title="Reject"><X size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={!!deciding}
        onClose={() => setDeciding(null)}
        title={deciding ? `${deciding.approve ? "Approve" : "Reject"} leave · ${deciding.row.userName}` : ""}
        description={deciding ? `${LEAVE_LABEL[deciding.row.type]} · ${fmt(deciding.row.from)} → ${fmt(deciding.row.to)} (${deciding.row.days} day(s))` : undefined}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeciding(null)}>Cancel</Button>
            <Button variant={deciding?.approve ? "primary" : "danger"} size="sm" onClick={decide} disabled={busy}>
              {deciding?.approve ? "Approve" : "Reject"}
            </Button>
          </>
        }
      >
        <textarea className={inputCls} rows={2} placeholder="Note to the requester (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
    </div>
  );
}

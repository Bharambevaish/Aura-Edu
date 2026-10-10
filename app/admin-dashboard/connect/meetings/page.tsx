"use client";

import React, { useState, useEffect } from "react";
import {
  listMeetings,
  updateMeetingStatus,
  deleteMeeting,
  type MeetingRow,
} from "@/lib/actions/connect";
import {
  Video,
  Plus,
  Copy,
  Play,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const typeColor: Record<string, string> = {
  internal: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  class: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  webinar: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusPill: Record<string, string> = {
  live: "bg-red-500/20 text-red-400 border-red-500/30",
  upcoming: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  cancelled: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  draft: "bg-white/10 text-slate-300 border-white/10",
};

const dayBlock = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00`);
  return {
    day: d.getDate(),
    dow: d.toLocaleDateString("en-IN", { weekday: "short" }),
    mon: d.toLocaleDateString("en-IN", { month: "short" }),
  };
};

type Tab = "all" | "live" | "upcoming" | "past";

export default function MeetingsPage() {
  const [rows, setRows] = useState<MeetingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [target, setTarget] = useState<MeetingRow | null>(null);
  const [action, setAction] = useState<"complete" | "cancel" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let ignore = false;
    listMeetings()
      .then((ms) => {
        if (!ignore) setRows(ms);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    listMeetings()
      .then(setRows)
      .catch(() => toast("Failed to load meetings", "error"));
  };

  const filtered = rows
    .filter((m) => {
      if (tab === "live") return m.status === "live";
      if (tab === "upcoming") return !m.ended && m.status !== "live" && m.status !== "cancelled";
      if (tab === "past") return m.ended;
      return true;
    })
    .sort((a, b) => (tab === "past" ? b.start - a.start : a.start - b.start));

  const copyLink = (link: string) => {
    navigator.clipboard?.writeText(link).then(
      () => toast("Meeting link copied"),
      () => toast("Could not copy", "error"),
    );
  };

  const counts = {
    live: rows.filter((m) => m.status === "live").length,
    upcoming: rows.filter((m) => !m.ended && m.status !== "live" && m.status !== "cancelled").length,
    completed: rows.filter((m) => m.ended).length,
  };

  const runAction = async () => {
    if (!target || !action) return;
    setBusy(true);
    try {
      if (action === "delete") {
        const res = await deleteMeeting(target.id);
        toast(res.ok ? "Meeting deleted" : res.message, res.ok ? "success" : "error");
      } else {
        const next = action === "complete" ? "completed" : "cancelled";
        const res = await updateMeetingStatus(target.id, next);
        toast(res.ok ? `Meeting marked ${next}` : res.message, res.ok ? "success" : "error");
      }
      if (action === "complete" || action === "cancel") {
        // starters also flip the row locally for snappy UI
        setRows((prev) => prev.map((m) => (m.id === target.id ? { ...m, status: action === "complete" ? "completed" : "cancelled", ended: true } : m)));
      }
      if (action === "delete") {
        setRows((prev) => prev.filter((m) => m.id !== target.id));
      }
    } catch {
      toast("Action failed", "error");
    }
    setTarget(null);
    setAction(null);
    setBusy(false);
  };

  const startNow = async (m: MeetingRow) => {
    const res = await updateMeetingStatus(m.id, "live");
    toast(res.ok ? "Meeting is now live — students can join" : res.message, res.ok ? "success" : "error");
    if (res.ok) setRows((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: "live" } : x)));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" subtitle="Virtual classes, staff syncs and webinars — schedule, go live and track." icon={<Video size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
        <Link href="/admin-dashboard/connect/meetings/schedule" className="inline-flex items-center justify-center rounded-lg font-medium px-4 py-2 text-sm gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-600/20">
          <Plus size={14} /> Schedule Meeting
        </Link>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Live Now" value={counts.live} icon={<Play size={14} />} accent="red" />
          <StatCard label="Upcoming" value={counts.upcoming} icon={<Video size={14} />} accent="emerald" />
          <StatCard label="Completed" value={counts.completed} icon={<CheckCircle2 size={14} />} accent="slate" />
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-white/10 flex gap-1 flex-wrap bg-white/[0.02]">
          {([["upcoming", "Upcoming"], ["live", "Live"], ["past", "Past"], ["all", "All"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === k ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
            >
              {label}
              {k === "live" && counts.live > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/30 text-[9px] font-bold">{counts.live}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            {tab === "upcoming" ? "No upcoming meetings — schedule one." : "Nothing here yet."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((m) => {
              const b = dayBlock(m.date);
              return (
                <div key={m.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex gap-4 min-w-0">
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border ${m.status === "live" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-white/[0.03] border-white/10 text-slate-300"}`}>
                      <span className="text-[10px] font-bold uppercase">{b.dow}</span>
                      <span className="text-xl font-bold leading-none">{b.day}</span>
                      <span className="text-[10px] text-slate-500">{b.mon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white truncate">{m.title}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${typeColor[m.type]}`}>{m.type}</span>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${statusPill[m.status] ?? ""}`}>{m.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{m.startHour}–{m.endHour}{m.batchNames.length ? "" : " · Staff"}</p>
                      {m.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">{m.description}</p>}
                      {m.batchNames.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 flex-wrap"><Users size={11} /> {m.batchNames.join(", ")}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {m.link && (
                      <button onClick={() => copyLink(m.link)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-white/10 flex items-center gap-1.5" title={m.link}>
                        <Copy size={12} /> Copy Link
                      </button>
                    )}
                    {!m.ended && m.status !== "cancelled" && m.status !== "live" && (
                      <button onClick={() => void startNow(m)} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
                        <Play size={12} /> Start Now
                      </button>
                    )}
                    {!m.ended && m.status !== "cancelled" && (
                      <button onClick={() => { setTarget(m); setAction("complete"); }} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-colors" title="Mark completed">
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    {!m.ended && m.status !== "cancelled" && (
                      <button onClick={() => { setTarget(m); setAction("cancel"); }} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-amber-400 transition-colors" title="Cancel meeting">
                        <XCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => { setTarget(m); setAction("delete"); }} className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!target}
        onClose={() => { setTarget(null); setAction(null); }}
        title={
          action === "complete" ? "Mark meeting completed?"
            : action === "cancel" ? "Cancel this meeting?"
            : "Delete this meeting?"
        }
        description={target?.title}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setTarget(null); setAction(null); }}>Close</Button>
            <Button variant={action === "delete" ? "danger" : "primary"} loading={busy} onClick={runAction}>
              {action === "complete" ? "Mark Completed" : action === "cancel" ? "Cancel Meeting" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          {action === "complete" && "The meeting moves to the completed list and students keep the recording link."}
          {action === "cancel" && "Students will no longer see this as an upcoming session. This can be undone from the list."}
          {action === "delete" && "This permanently removes the meeting. This cannot be undone."}
        </p>
      </Modal>
    </div>
  );
}
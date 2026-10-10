"use client";

import React, { useState, useEffect } from "react";
import {
  getConnectOverview,
  type ConnectOverview,
} from "@/lib/actions/connect";
import {
  Megaphone,
  Bell,
  Video,
  Calendar as CalendarIcon,
  ArrowRight,
  Users,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const dayLabel = (isoDate: string) => {
  const today = new Date();
  const target = new Date(`${isoDate}T00:00:00`);
  const diff = Math.round(
    (new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

const typeColor: Record<string, string> = {
  internal: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  class: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  webinar: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function ConnectCenterPage() {
  const [data, setData] = useState<ConnectOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let ignore = false;
    getConnectOverview()
      .then((d) => {
        if (!ignore) setData(d);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    getConnectOverview()
      .then(setData)
      .catch(() => toast("Failed to refresh", "error"));
  };

  const copyLink = (link: string) => {
    navigator.clipboard?.writeText(link).then(
      () => toast("Meeting link copied"),
      () => toast("Could not copy", "error"),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Connect Suite" subtitle="Broadcasts, meetings, groups and the institute calendar — all live from the database." icon={<Megaphone size={20} className="text-emerald-400" />}>
        {loading ? null : (
          <>
            <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
            <Link href="/admin-dashboard/connect/notices" className="inline-flex items-center justify-center rounded-lg font-medium px-4 py-2 text-sm gap-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-600/20">
              <Megaphone size={14} /> New Broadcast
            </Link>
            <Link href="/admin-dashboard/connect/meetings" className="inline-flex items-center justify-center rounded-lg font-medium px-4 py-2 text-sm gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white transition-colors">
              <Video size={14} /> Meetings
            </Link>
          </>
        )}
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Notices Sent" value={data?.stats.noticesSent ?? 0} icon={<Megaphone size={14} />} accent="emerald" delta="broadcasts to date" />
            <StatCard label="Unread by Students" value={data?.stats.unreadByStudents ?? 0} icon={<Bell size={14} />} accent="amber" delta="pending read receipts" />
            <StatCard label="Upcoming Meetings" value={data?.stats.meetingsUpcoming ?? 0} icon={<Video size={14} />} accent="blue" delta="sessions ahead" />
            <StatCard label="Events This Month" value={data?.stats.eventsThisMonth ?? 0} icon={<CalendarIcon size={14} />} accent="purple" delta="on the calendar" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
                <Link href="/admin-dashboard/connect/meetings" className="text-sm text-emerald-400 hover:text-emerald-300">View All</Link>
              </div>

              {(data?.meetings ?? []).length === 0 ? (
                <div className="text-center py-10 text-slate-500">No upcoming meetings.</div>
              ) : (
                <div className="space-y-3">
                  {(data?.meetings ?? []).map((m) => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                      <div className="flex gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold uppercase">{dayLabel(m.date).split(" ")[0]}</span>
                          <span className="text-lg font-bold leading-none">{new Date(`${m.date}T00:00:00`).getDate()}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">{m.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                            <span>{dayLabel(m.date)} · {m.startHour}</span>
                            {m.batchNames.length > 0 && <span className="flex items-center gap-1"><Users size={12} /> {m.batchNames.join(", ")}</span>}
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${typeColor[m.type]}`}>{m.type}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => copyLink(m.link)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-white/10 flex items-center gap-1.5">
                          <LinkIcon size={12} /> Copy Link
                        </button>
                        <button
                          onClick={() => copyLink(m.link)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${m.status === "live" ? "bg-red-600 hover:bg-red-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}
                        >
                          {m.status === "live" ? "Join Live" : "Join"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">Recent Broadcasts</h2>
                <Link href="/admin-dashboard/connect/notices" className="text-sm text-emerald-400 hover:text-emerald-300">Open Center</Link>
              </div>

              {(data?.notices ?? []).length === 0 ? (
                <div className="text-center py-10 text-slate-500">No broadcasts sent yet.</div>
              ) : (
                <div className="space-y-3 flex-1">
                  {(data?.notices ?? []).map((n) => (
                    <div key={n.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-white truncate flex items-center gap-2">
                          {n.important && <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" title="Important" />}
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0">{dayLabel(n.sentAt.slice(0, 10))}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">{n.message}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{n.audienceLabel}</span>
                        <span className="text-[10px] text-slate-400">
                          Delivered <b className="text-white">{n.delivered}</b> · Read <b className="text-emerald-400">{n.read}</b>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Active Groups</h2>
              <Link href="/admin-dashboard/connect/groups" className="text-sm text-emerald-400 hover:text-emerald-300">Open Groups</Link>
            </div>

            {(data?.batches ?? []).length === 0 ? (
              <div className="text-center py-10 text-slate-500">No batches yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(data?.batches ?? []).map((b) => (
                  <Link href="/admin-dashboard/connect/groups" key={b.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group/item">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600`}>
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate pr-2">{b.name}</h4>
                          {b.unread > 0 && (
                            <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{b.unread}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{b.enrolled} students · {b.course}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-emerald-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getNotices,
  getBroadcastBatches,
  getNoticeStats,
  createNotice,
  togglePinNotice,
  deleteNotice,
  type NoticeSlice,
} from "@/lib/actions/connect";
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

const CATEGORIES = ["Announcements", "Tests", "Assignments", "Attendance", "Certificates", "Payments", "Courses"];

const categoryColor: Record<string, string> = {
  Announcements: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Tests: "bg-red-500/20 text-red-400 border-red-500/30",
  Assignments: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Attendance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Certificates: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Payments: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Courses: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " +
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export default function BroadcastsPage() {
  const [notices, setNotices] = useState<NoticeSlice[]>([]);
  const [batches, setBatches] = useState<{ name: string; enrolled: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeAudience, setActiveAudience] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [important, setImportant] = useState(false);
  const [kind, setKind] = useState<"all" | "batches" | "staff">("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [newLoading, setNewLoading] = useState(false);

  const [targetForPin, setTargetForPin] = useState<NoticeSlice | null>(null);
  const [targetForDelete, setTargetForDelete] = useState<NoticeSlice | null>(null);
  const [busy, setBusy] = useState(false);
  const [statsFor, setStatsFor] = useState<{ id: string; title: string } | null>(null);
  const [stats, setStats] = useState<{ delivered: number; read: number; readers: string[] } | null>(null);

  const fetchNotices = async () => {
    try {
      setNotices(await getNotices());
    } catch {
      toast("Failed to load broadcasts", "error");
    }
  };

  useEffect(() => {
    let ignore = false;
    getNotices()
      .then((d) => {
        if (!ignore) setNotices(d);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    getBroadcastBatches().then((b) => {
      if (!ignore) setBatches(b.map((x) => ({ name: x.name, enrolled: x.enrolled })));
    });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    void fetchNotices();
  };

  const openNew = () => {
    setTitle("");
    setMessage("");
    setCategory("Announcements");
    setImportant(false);
    setKind("all");
    setSelectedBatches([]);
    setNewOpen(true);
  };

  const toggleBatch = (name: string) =>
    setSelectedBatches((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));

  const runCreate = async () => {
    if (kind === "batches" && selectedBatches.length === 0) {
      toast("Select at least one batch", "error");
      return;
    }
    setNewLoading(true);
    try {
      const res = await createNotice({
        title,
        message,
        category,
        important,
        audience: { kind, batchNames: selectedBatches, studentIds: [] },
      });
      toast(res.ok ? `Broadcast sent to ${res.delivered} recipient(s)` : res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setNewOpen(false);
        await fetchNotices();
      }
    } catch {
      toast("Something went wrong", "error");
    }
    setNewLoading(false);
  };

  const runPin = async (n: NoticeSlice) => {
    setTargetForPin(n);
    try {
      const res = await togglePinNotice(n.id);
      toast(res.ok ? (n.pinned ? "Broadcast unpinned" : "Broadcast pinned") : res.message, res.ok ? "success" : "error");
      if (res.ok) await fetchNotices();
    } catch {
      toast("Action failed", "error");
    }
    setTargetForPin(null);
  };

  const runDelete = async () => {
    if (!targetForDelete) return;
    setBusy(true);
    try {
      const res = await deleteNotice(targetForDelete.id);
      toast(res.ok ? "Broadcast deleted" : res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setTargetForDelete(null);
        await fetchNotices();
      }
    } catch {
      toast("Delete failed", "error");
    }
    setBusy(false);
  };

  const openStats = async (n: NoticeSlice) => {
    setStatsFor({ id: n.id, title: n.title });
    setStats(null);
    try {
      setStats(await getNoticeStats(n.id));
    } catch {
      toast("Failed to load read receipts", "error");
    }
  };

  const filtered = notices.filter((n) => {
    const matchesCat = activeCategory === "All" || n.category === activeCategory;
    const matchesAud =
      activeAudience === "All" ||
      (activeAudience === "batches" && n.audienceKind === "batches") ||
      (activeAudience === "staff" && n.audienceKind === "staff") ||
      (activeAudience === "all" && n.audienceKind === "all");
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
    return matchesCat && matchesAud && matchesSearch;
  });

  const unreadTotal = notices.reduce((sum, n) => sum + (n.delivered - n.read), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Broadcasts" subtitle="Compose notices, pick an audience and watch read receipts come in from each batch." icon={<Megaphone size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openNew}><Plus size={14} /> New Broadcast</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Broadcasts" value={notices.length} icon={<Megaphone size={14} />} accent="emerald" delta="all-time" />
          <StatCard label="Delivered" value={notices.reduce((s, n) => s + n.delivered, 0)} icon={<Send size={14} />} accent="blue" delta="notification fan-out" />
          <StatCard label="Unread Pending" value={unreadTotal} icon={<Eye size={14} />} accent="amber" delta="read receipts outstanding" />
        </div>
      )}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search broadcasts..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={activeAudience} onChange={(e) => setActiveAudience(e.target.value)} className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
              <option value="All">All audiences</option>
              <option value="all">All Students</option>
              <option value="batches">Batches</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No broadcasts match your filters.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((n) => (
              <div key={n.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <Pin size={10} /> PINNED
                        </span>
                      )}
                      {n.important && (
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/15 border border-red-500/30 text-red-400">IMPORTANT</span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${categoryColor[n.category] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30"}`}>{n.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mt-2">{n.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500">
                      <span className="text-slate-400">{n.audienceLabel}</span>
                      <span>·</span>
                      <span>{n.sender}</span>
                      <span>·</span>
                      <span>{fmtDate(n.sentAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openStats(n)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-colors" title="Read receipts">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => runPin(n)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-emerald-400 transition-colors" disabled={!!targetForPin} title={n.pinned ? "Unpin" : "Pin"}>
                        {targetForPin?.id === n.id ? <Loader2 size={15} className="animate-spin" /> : n.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                      </button>
                      <button onClick={() => setTargetForDelete(n)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <button onClick={() => openStats(n)} className="group w-36">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Delivered</span>
                        <span><b className="text-white">{n.delivered}</b> · <span className="text-emerald-400">{n.read} read</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 group-hover:brightness-110 transition-all"
                          style={{ width: `${n.delivered ? Math.round((n.read / n.delivered) * 100) : 0}%` }}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New Broadcast"
        description="Students will see this instantly in their notification hub."
        footer={<><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button loading={newLoading} onClick={runCreate}><Send size={14} /> Send Broadcast</Button></>}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className={labelCls}>Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Mock Test #5 schedule" className={inputCls} />
              </div>
              <div className="w-40">
                <label className={labelCls}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Message *</label>
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={3000} placeholder="What should students know?" className={`${inputCls} resize-y`} />
          </div>

          <div>
            <label className={labelCls}>Audience</label>
            <div className="mt-1.5 flex gap-2 p-1 bg-slate-900/50 border border-white/10 rounded-xl w-fit">
              {([["all", "All Students"], ["batches", "Specific Batches"], ["staff", "All Staff"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${kind === k ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {kind === "batches" && (
            <div>
              <label className={labelCls}>Batches</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {batches.map((b) => {
                  const active = selectedBatches.includes(b.name);
                  return (
                    <button
                      key={b.name}
                      onClick={() => toggleBatch(b.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        active ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {b.name}
                      <span className="text-[10px] text-slate-500">{b.enrolled}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <button
              onClick={() => setImportant(!important)}
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${important ? "bg-red-500 border-red-500" : "border-slate-600 bg-transparent"}`}
            >
              {important && <X size={12} className="text-[#070B14]" />}
            </button>
            <span className="text-sm text-slate-300">Mark as important (red-dot alert in the student hub)</span>
          </label>
        </div>
      </Modal>

      <Modal
        open={!!targetForDelete}
        onClose={() => setTargetForDelete(null)}
        title="Delete broadcast?"
        description={targetForDelete?.title}
        footer={<><Button variant="ghost" onClick={() => setTargetForDelete(null)}>Cancel</Button><Button variant="danger" loading={busy} onClick={runDelete}><Trash2 size={14} /> Delete</Button></>}
      >
        <p className="text-sm text-slate-400">This removes the notice and its notifications from every student&apos;s hub. This cannot be undone.</p>
      </Modal>

      <Modal
        open={!!statsFor}
        onClose={() => setStatsFor(null)}
        title="Read receipts"
        description={statsFor?.title}
      >
        {!stats ? (
          <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Delivered" value={stats.delivered} accent="blue" />
              <StatCard label="Read" value={stats.read} accent="emerald" />
              <StatCard label="Unread" value={stats.delivered - stats.read} accent="amber" />
            </div>
            {stats.readers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-300">Recent readers</p>
                <div className="flex flex-wrap gap-2">
                  {stats.readers.map((r) => (
                    <span key={r} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">{r}</span>
                  ))}
                </div>
              </div>
            )}
            {stats.read === 0 && <p className="text-sm text-slate-500">No one has opened this yet.</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
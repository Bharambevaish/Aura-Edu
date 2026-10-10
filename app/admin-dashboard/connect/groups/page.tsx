"use client";

import React, { useState, useEffect } from "react";
import {
  getBroadcastBatches,
  getNotices,
  sendBatchBroadcast,
  type BroadcastBatchRow,
  type NoticeSlice,
} from "@/lib/actions/connect";
import {
  Search,
  Info,
  Users,
  Send,
  Loader2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const avatarGradients = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-purple-600 to-fuchsia-600",
  "from-orange-500 to-red-500",
];

export default function GroupsChatPage() {
  const [batches, setBatches] = useState<BroadcastBatchRow[]>([]);
  const [notices, setNotices] = useState<NoticeSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let ignore = false;
    getBroadcastBatches()
      .then((b) => {
        if (ignore) return;
        setBatches(b);
        if (b.length > 0) setActive((cur) => cur || b[0].name);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    getNotices().then((n) => {
      if (!ignore) setNotices(n);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    getBroadcastBatches().then(setBatches);
    getNotices().then(setNotices);
  };

  const activeBatch = batches.find((b) => b.name === active);
  const thread = notices.filter(
    (n) => n.audienceKind === "batches" && n.audienceLabel.split(", ").includes(active),
  );
  const filteredBatches = batches.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const send = async () => {
    const text = draft.trim();
    if (!text) {
      toast("Type a message first", "error");
      return;
    }
    setSending(true);
    try {
      const res = await sendBatchBroadcast({ batchName: active, message: text, category: "Announcements" });
      toast(res.ok ? `Sent to ${res.delivered} student(s) in ${active}` : res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setDraft("");
        await getBroadcastBatches().then(setBatches);
        await getNotices().then(setNotices);
      }
    } catch {
      toast("Send failed", "error");
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Groups" subtitle="Broadcast to a whole batch — every student in it gets the message in their notification hub." icon={<MessageSquare size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
      </PageHeader>

      <div className="h-[calc(100vh-13rem)] flex gap-6">
        <div className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden shrink-0 hidden md:flex">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-3">Batches</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search batches..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
            ) : (
              filteredBatches.map((b, i) => (
              <button
                key={b.name}
                onClick={() => setActive(b.name)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                  active === b.name ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0 ${avatarGradients[i % avatarGradients.length]}`}>
                  {b.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium truncate ${active === b.name ? "text-emerald-400" : "text-white"}`}>{b.name}</h4>
                    {b.unread > 0 && (
                      <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{b.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{b.enrolled} students · {b.course}</p>
                </div>
              </button>
              )))}

              {!loading && (
                filteredBatches.length === 0 ? <div className="text-center py-10 text-slate-500">No batches.</div> : null
              )}
            </div>
        </div>

        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          {!activeBatch ? (
            <div className="flex items-center justify-center h-full text-slate-500">Select a batch to broadcast.</div>
          ) : (
            <>
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold ${avatarGradients[batches.findIndex((b) => b.name === active) % avatarGradients.length]}`}>
                    {active.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{active}</h3>
                    <p className="text-xs flex items-center gap-1 text-slate-400">
                      <Users size={12} className="text-emerald-400" />
                      {activeBatch.enrolled} students · {activeBatch.course}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors" title="Broadcasts reach every student's notification hub">
                  <Info size={14} /> Broadcast to batch
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {thread.length === 0 && (
                  <div className="text-center py-16">
                    <MessageSquare size={28} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500">No broadcasts to {active} yet. Send the first one below — every student in the batch will see it instantly.</p>
                  </div>
                )}
                {thread.map((n) => (
                  <div key={n.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 ${avatarGradients[0]}`}>
                      {(n.sender.match(/\b\w/g) ?? []).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-200">{n.sender}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} ·{" "}
                          {new Date(n.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 max-w-md text-sm text-slate-200">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
                        <Send size={10} /> Delivered {n.delivered} · Read {n.read}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/10">
                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl p-2">
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder={`Message ${active}...`}
                    className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 px-2 resize-none custom-scrollbar"
                  />
                  <button
                    onClick={() => void send()}
                    disabled={sending || !draft.trim()}
                    className="w-11 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">Enter to send · Shift+Enter for a new line. Students receive this as an announcement notification.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { getBroadcastBatches, type BroadcastBatchRow } from "@/lib/actions/connect";
import {
  listChatMessages,
  getChatPreviews,
  sendChatMessage,
  postScriptedReply,
  getChatDemoMode,
  type ChatMessageRow,
} from "@/lib/actions/chat";
import {
  Search,
  Users,
  Send,
  Loader2,
  RefreshCw,
  MessageSquare,
  Megaphone,
  Check,
  CheckCheck,
  X,
  FlaskConical,
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

type Preview = Record<string, { body: string; senderName: string; createdAt: string }>;
type Tick = "sent" | "delivered" | "read";

const initials = (name: string) => (name.match(/\b\w/g) ?? []).slice(0, 2).join("").toUpperCase();
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Ticks({ state }: { state: Tick }) {
  if (state === "sent") return <Check size={14} className="text-slate-400" aria-label="Sent" />;
  return (
    <CheckCheck
      size={14}
      className={`transition-colors duration-500 ${state === "read" ? "text-sky-400" : "text-slate-400"}`}
      aria-label={state === "read" ? "Read" : "Delivered"}
    />
  );
}

/** Simulated WhatsApp delivery: sent → delivered → read over a few seconds. */
function WhatsAppPreview({ message, batch, onClose }: { message: ChatMessageRow; batch: string; onClose: () => void }) {
  const [tick, setTick] = useState<Tick>("sent");
  useEffect(() => {
    const a = setTimeout(() => setTick("delivered"), 1200);
    const b = setTimeout(() => setTick("read"), 3000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [message.id]);

  const label = tick === "sent" ? "Sent" : tick === "delivered" ? `Delivered to ${message.delivered}` : `Read by ${message.delivered}`;
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-emerald-500/30 bg-[#0b141a] overflow-hidden" data-testid="whatsapp-preview">
      <div className="flex items-center justify-between px-4 py-2 bg-[#202c33]">
        <div className="flex items-center gap-2 text-sm text-white">
          <span className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-[11px] font-bold">
            {initials(batch)}
          </span>
          <span className="font-medium">{batch}</span>
          <span className="text-[11px] text-slate-400">WhatsApp broadcast preview</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close preview">
          <X size={16} />
        </button>
      </div>
      <div className="px-4 py-3 flex justify-end">
        <div className="max-w-sm rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-sm text-white shadow">
          <p className="whitespace-pre-wrap">{message.body}</p>
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-100/70">
            {timeOf(message.createdAt)} <Ticks state={tick} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 text-[11px]">
        <span className="text-emerald-300 font-medium" data-testid="whatsapp-status">{label}</span>
        <span className="text-amber-300/80">Simulated — no real WhatsApp message was sent.</span>
      </div>
    </div>
  );
}

export default function GroupsChatPage() {
  const [batches, setBatches] = useState<BroadcastBatchRow[]>([]);
  const [previews, setPreviews] = useState<Preview>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("");
  const [search, setSearch] = useState("");
  // The loaded thread is tagged with its batch so switching groups never shows stale rows.
  const [thread, setThread] = useState<{ batch: string; rows: ChatMessageRow[] }>({ batch: "", rows: [] });
  const [draft, setDraft] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const [waPreview, setWaPreview] = useState<ChatMessageRow | null>(null);
  // Scripted replies and the WhatsApp preview only exist on the sales demo.
  const [demo, setDemo] = useState(false);
  const activeRef = useRef(active);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    getChatDemoMode().then(setDemo).catch(() => setDemo(false));
  }, []);

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
    getChatPreviews().then((p) => {
      if (!ignore) setPreviews(p);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    let ignore = false;
    listChatMessages(active).then((rows) => {
      if (!ignore) setThread({ batch: active, rows });
    });
    return () => {
      ignore = true;
    };
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread, typing]);

  const refresh = useCallback(() => {
    getBroadcastBatches().then(setBatches);
    getChatPreviews().then(setPreviews);
    const batch = activeRef.current;
    if (batch) listChatMessages(batch).then((rows) => setThread({ batch, rows }));
  }, []);

  const append = (batch: string, row: ChatMessageRow) => {
    setPreviews((p) => ({ ...p, [batch]: { body: row.body, senderName: row.senderName, createdAt: row.createdAt } }));
    setThread((t) => (t.batch !== batch || t.rows.some((x) => x.id === row.id) ? t : { batch, rows: [...t.rows, row] }));
  };

  const messages = thread.batch === active ? thread.rows : [];
  const threadLoading = !!active && thread.batch !== active;
  const activeBatch = batches.find((b) => b.name === active);
  const filteredBatches = batches.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const send = async () => {
    const text = draft.trim();
    if (!text) {
      toast("Type a message first", "error");
      return;
    }
    const batch = active;
    setSending(true);
    try {
      const res = await sendChatMessage({ batchName: batch, body: text, broadcast, whatsapp: broadcast && whatsapp });
      if (!res.ok) {
        toast(res.message, "error");
        return;
      }
      setDraft("");
      append(batch, res.message);
      if (res.message.broadcast) {
        toast(`Delivered to ${res.message.delivered} student(s) in ${batch}`, "success");
        refresh();
      }
      if (res.message.channel === "whatsapp") setWaPreview(res.message);

      // Demo simulation: a scripted student reply after a short "typing" delay.
      if (!demo) return;
      setTyping(batch);
      const delay = 1800 + Math.floor(Math.random() * 1400);
      setTimeout(async () => {
        try {
          const reply = await postScriptedReply(res.message.id);
          if (reply.ok && reply.message) append(batch, reply.message);
        } finally {
          setTyping((t) => (t === batch ? null : t));
        }
      }, delay);
    } catch {
      toast("Send failed", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Groups"
        subtitle="One group chat per batch. Messages are saved; broadcast ones also reach every student's notification hub."
        icon={<MessageSquare size={20} className="text-emerald-400" />}
      >
        <Button variant="secondary" size="sm" onClick={refresh}><RefreshCw size={14} /></Button>
      </PageHeader>

      <div className="h-[calc(100vh-13rem)] flex gap-6">
        <div className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden shrink-0 hidden md:flex">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <h2 className="text-lg font-semibold text-white mb-3">Batch groups</h2>
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
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-10 text-slate-500">No batches.</div>
            ) : (
              filteredBatches.map((b, i) => {
                const p = previews[b.name];
                return (
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
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-medium truncate ${active === b.name ? "text-emerald-400" : "text-white"}`}>{b.name}</h4>
                        {p && <span className="text-[10px] text-slate-500 shrink-0">{dayOf(p.createdAt)}</span>}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {p ? `${p.senderName.split(" ")[0]}: ${p.body}` : `${b.enrolled} students · ${b.course}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          {!activeBatch ? (
            <div className="flex items-center justify-center h-full text-slate-500">Select a batch group.</div>
          ) : (
            <>
              <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold ${avatarGradients[Math.max(0, batches.findIndex((b) => b.name === active)) % avatarGradients.length]}`}>
                    {active.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{active}</h3>
                    <p className="text-xs flex items-center gap-1 text-slate-400">
                      <Users size={12} className="text-emerald-400" />
                      {typing === active ? (
                        <span className="text-emerald-400">a student is typing…</span>
                      ) : (
                        <>{activeBatch.enrolled} students · {activeBatch.course}</>
                      )}
                    </p>
                  </div>
                </div>
                {demo && (
                <span
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  title="Student replies in this demo are scripted, not sent by real students"
                >
                  <FlaskConical size={12} /> Demo: student replies are simulated
                </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {threadLoading && messages.length === 0 ? (
                  <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare size={28} className="mx-auto text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500">No messages in {active} yet. Say hello below.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const staffSide = m.senderRole !== "student";
                    return (
                      <div key={m.id} className={`flex gap-3 ${staffSide ? "flex-row-reverse" : ""}`} data-testid="chat-message">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1 ${
                            staffSide ? avatarGradients[1] : avatarGradients[2]
                          }`}
                        >
                          {initials(m.senderName)}
                        </div>
                        <div className={`min-w-0 flex flex-col ${staffSide ? "items-end" : "items-start"}`}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">{m.mine ? "You" : m.senderName}</span>
                            <span className="text-[10px] uppercase tracking-wide text-slate-500">{m.senderRole}</span>
                            {m.simulated && (
                              <span className="text-[10px] px-1.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                simulated reply
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">{dayOf(m.createdAt)} · {timeOf(m.createdAt)}</span>
                          </div>
                          <div
                            className={`rounded-2xl p-3 max-w-md text-sm whitespace-pre-wrap ${
                              m.channel === "whatsapp"
                                ? "bg-[#005c4b] text-white rounded-tr-sm"
                                : staffSide
                                  ? "bg-emerald-600/20 border border-emerald-500/20 text-slate-100 rounded-tr-sm"
                                  : "bg-white/10 text-slate-200 rounded-tl-sm"
                            }`}
                          >
                            {m.body}
                          </div>
                          {m.broadcast && (
                            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
                              {m.channel === "whatsapp" ? (
                                <>
                                  <CheckCheck size={12} className="text-sky-400" /> WhatsApp (simulated) · {m.delivered} recipient(s)
                                </>
                              ) : (
                                <>
                                  <Megaphone size={10} /> Broadcast to {m.delivered} student(s)
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {typing === active && (
                  <div className="flex gap-3" aria-live="polite">
                    <div className="px-3 py-2 rounded-2xl bg-white/10 text-slate-400 text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {waPreview && waPreview.batch === active && (
                <WhatsAppPreview message={waPreview} batch={active} onClose={() => setWaPreview(null)} />
              )}

              <div className="p-4 bg-white/[0.02] border-t border-white/10">
                <div className="flex flex-wrap items-center gap-4 mb-2 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={broadcast}
                      onChange={(e) => {
                        setBroadcast(e.target.checked);
                        if (!e.target.checked) setWhatsapp(false);
                      }}
                      className="accent-emerald-500"
                    />
                    <Megaphone size={13} className="text-emerald-400" /> Broadcast to students&apos; notification hub
                  </label>
                  {demo && (
                  <label className="flex items-center gap-2 cursor-pointer select-none" title="Simulated — no real WhatsApp message is sent">
                    <input
                      type="checkbox"
                      checked={whatsapp}
                      onChange={(e) => {
                        setWhatsapp(e.target.checked);
                        if (e.target.checked) setBroadcast(true);
                      }}
                      className="accent-emerald-500"
                      data-testid="whatsapp-toggle"
                    />
                    <CheckCheck size={13} className="text-emerald-400" /> Send as WhatsApp
                    <span className="text-[10px] text-amber-300/80">(simulated)</span>
                  </label>
                  )}
                </div>
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
                    aria-label="Send message"
                    className="w-11 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter to send · Shift+Enter for a new line. Student replies are a scripted demo simulation (keyed on words like fees, test, timing, holiday).
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

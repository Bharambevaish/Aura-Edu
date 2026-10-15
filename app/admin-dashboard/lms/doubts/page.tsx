"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MessageCircleQuestion, Loader2, RefreshCw, CheckCircle2, Clock, RotateCcw, Send } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  getDoubtInbox,
  replyToDoubt,
  setDoubtStatus,
  type DoubtInbox,
  type InboxDoubtRow,
} from "@/lib/actions/doubts";

type Filter = "open" | "answered" | "all";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function DoubtCard({ doubt, onChanged }: { doubt: InboxDoubtRow; onChanged: () => void }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const send = async () => {
    setBusy(true);
    try {
      const res = await replyToDoubt({ doubtId: doubt.id, body: reply, markAnswered: true });
      if (res.ok) {
        toast(`Reply sent — ${doubt.studentName} has been notified`, "success");
        setReply("");
        onChanged();
      } else {
        toast(res.message, "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await setDoubtStatus(doubt.id, doubt.status === "open" ? "answered" : "open");
      if (res.ok) onChanged();
      else toast(res.message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4" data-testid="inbox-doubt">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{doubt.studentName}</span>
            {doubt.batch && <> · {doubt.batch}</>} · {when(doubt.createdAt)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {doubt.courseTitle} → <span className="text-slate-300">{doubt.lessonTitle || doubt.lessonId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {doubt.status === "answered" ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Answered
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold flex items-center gap-1">
              <Clock size={12} /> Open
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => void toggle()} disabled={busy}>
            {doubt.status === "open" ? <><CheckCircle2 size={13} /> Mark answered</> : <><RotateCcw size={13} /> Reopen</>}
          </Button>
        </div>
      </div>

      <p className="text-sm text-white whitespace-pre-wrap">{doubt.question}</p>

      {doubt.replies.length > 0 && (
        <div className="space-y-2 pl-3 border-l-2 border-emerald-500/30">
          {doubt.replies.map((r) => (
            <div key={r.id}>
              <p className="text-[11px] text-emerald-300 font-semibold">
                {r.authorName} <span className="text-slate-500 font-normal">· {r.authorRole} · {when(r.createdAt)}</span>
              </p>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          rows={2}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={doubt.status === "open" ? "Write an answer — the student is notified and the doubt is marked answered." : "Add a follow-up reply…"}
          className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5E9A2E] resize-none"
          data-testid="reply-input"
        />
        <Button size="sm" onClick={() => void send()} disabled={busy || reply.trim().length < 2} loading={busy}>
          {!busy && <Send size={13} />} Reply
        </Button>
      </div>
    </div>
  );
}

export default function DoubtsInboxPage() {
  const [filter, setFilter] = useState<Filter>("open");
  const [version, setVersion] = useState(0);
  // Tagged with the request it answers, so "loading" is derived instead of set in the effect.
  const [loaded, setLoaded] = useState<{ key: string; inbox: DoubtInbox } | null>(null);
  const key = `${filter}:${version}`;
  const inbox = loaded?.inbox ?? null;
  const loading = loaded?.key !== key;

  useEffect(() => {
    let ignore = false;
    getDoubtInbox(filter).then((data) => {
      if (!ignore) setLoaded({ key: `${filter}:${version}`, inbox: data });
    });
    return () => {
      ignore = true;
    };
  }, [filter, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: "open", label: "Open", count: inbox?.counts.open },
    { key: "answered", label: "Answered", count: inbox?.counts.answered },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doubts Inbox"
        subtitle="Questions students ask from the lesson player. Reply to answer — the student gets a notification."
        icon={<MessageCircleQuestion size={20} className="text-emerald-400" />}
      >
        <Button variant="secondary" size="sm" onClick={reload}><RefreshCw size={14} /></Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filter === t.key ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 text-slate-500">{t.count}</span>}
            </button>
          ))}
        </div>
        {inbox?.scope && (
          <p className="text-[11px] text-slate-500">
            Showing doubts from the batches you teach: {inbox.scope.length ? inbox.scope.join(", ") : "none assigned in the timetable"}
          </p>
        )}
      </div>

      {loading && !inbox ? (
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
      ) : !inbox || inbox.doubts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <MessageCircleQuestion size={28} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm text-slate-500">{filter === "open" ? "No open doubts — all caught up." : "No doubts here yet."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inbox.doubts.map((d) => (
            <DoubtCard key={d.id} doubt={d} onChanged={reload} />
          ))}
        </div>
      )}
    </div>
  );
}

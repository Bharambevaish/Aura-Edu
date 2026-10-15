"use client";

import React, { useEffect, useState } from "react";
import { MessageCircleQuestion, Send, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { listLessonDoubts, askDoubt, type DoubtRow } from "@/lib/actions/doubts";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Learn player → Doubt Discussion: ask about the current lesson, see
 * classmates' doubts and faculty replies. Render with `key={lessonId}` so
 * switching lessons remounts it with a fresh loading state.
 */
export function DoubtDiscussion({ courseId, lessonId, lessonTitle }: { courseId: string; lessonId: string; lessonTitle: string }) {
  const [doubts, setDoubts] = useState<DoubtRow[] | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    listLessonDoubts(courseId, lessonId)
      .then((rows) => {
        if (!ignore) setDoubts(rows);
      })
      .catch(() => {
        if (!ignore) setDoubts([]);
      });
    return () => {
      ignore = true;
    };
  }, [courseId, lessonId]);

  const submit = async () => {
    const question = draft.trim();
    if (!question) return;
    setPosting(true);
    setError("");
    try {
      const res = await askDoubt({ courseId, lessonId, question });
      if (res.ok) {
        setDraft("");
        setDoubts((d) => [res.doubt, ...(d ?? [])]);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Could not post your doubt. Try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1500}
          placeholder={`Ask a doubt about "${lessonTitle}" — your faculty will answer here.`}
          className="w-full bg-transparent text-xs text-white outline-none placeholder-slate-500 resize-none"
          data-testid="doubt-input"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] text-red-400">{error}</span>
          <button
            onClick={() => void submit()}
            disabled={posting || draft.trim().length < 5}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Ask doubt
          </button>
        </div>
      </div>

      {doubts === null ? (
        <p className="text-xs text-slate-500">Loading doubts…</p>
      ) : doubts.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
          <MessageCircleQuestion className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No doubts on this lesson yet. Be the first to ask.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {doubts.map((d) => (
            <li key={d.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3" data-testid="doubt-item">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">{d.mine ? "You" : d.studentName}</span> · {when(d.createdAt)}
                  </p>
                  <p className="text-xs text-white mt-1 whitespace-pre-wrap">{d.question}</p>
                </div>
                {d.status === "answered" ? (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Answered
                  </span>
                ) : (
                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Open
                  </span>
                )}
              </div>
              {d.replies.length > 0 && (
                <div className="space-y-2 pl-3 border-l-2 border-cyan-500/30">
                  {d.replies.map((r) => (
                    <div key={r.id}>
                      <p className="text-[11px] text-cyan-300 font-semibold">
                        {r.authorName} <span className="text-slate-500 font-normal">· {r.authorRole === "student" ? "student" : "faculty"} · {when(r.createdAt)}</span>
                      </p>
                      <p className="text-xs text-slate-200 whitespace-pre-wrap">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

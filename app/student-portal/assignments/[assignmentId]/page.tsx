"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAssignmentWorksheet, submitAssignment, type WorksheetRead } from "@/lib/actions/assignments";
import {
  Loader2,
  FileText,
  AlertTriangle,
  Calendar,
  Send,
  CheckCircle2,
  ArrowLeft,
  Timer,
} from "lucide-react";

const inputCls =
  "w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none min-h-[96px]";

export default function WorksheetPage() {
  const params = useParams<{ assignmentId: string }>();

  const [data, setData] = useState<WorksheetRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    getAssignmentWorksheet(params.assignmentId)
      .then((res) => {
        if (ignore) return;
        if (!res) {
          setLoadError("This worksheet is unavailable.");
          return;
        }
        setData(res);
        const seeded: Record<number, string> = {};
        if (res.state === "open") {
          res.assignment.questions.forEach((_, i) => (seeded[i] = ""));
        }
        setAnswers(seeded);
      })
      .catch(() => {
        if (!ignore) setLoadError("Could not load this worksheet.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [params.assignmentId]);

  const submit = () => {
    if (!data || data.state !== "open" || done) return;
    setSubmitError(null);

    const empty = data.assignment.questions.some((_, i) => !(answers[i]?.trim() ?? ""));
    if (empty) {
      setSubmitError("Please answer every question before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    submitAssignment(
      params.assignmentId,
      data.assignment.questions.map((_, i) => answers[i].trim()),
    )
      .then((res) => {
        if (!res.ok) {
          setSubmitError(res.message);
          setSubmitting(false);
          return;
        }
        setDone({ id: res.id, title: data.assignment.title });
      })
      .catch(() => {
        setSubmitError("Submission failed — please try again.");
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading worksheet...
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
        <p className="text-white font-bold">{loadError ?? "Worksheet unavailable."}</p>
        <Link href="/student-portal/assignments" className="inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
          Back to Worksheets
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{done.title} — Submitted</h2>
          <p className="text-xs text-slate-400 mt-1">
            Your answers are with the faculty for review. You&apos;ll get marks, a verdict and feedback from your teacher.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/student-portal/assignments" className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
            Back to Worksheets
          </Link>
        </div>
      </div>
    );
  }

  if (data.state === "submitted") {
    const failed = data.verdict === "needs_work";
    return (
      <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-widest">{data.assignment.subject}</p>
            <h2 className="text-xl font-bold text-white">{data.assignment.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Submitted {data.submittedAt}</p>
          </div>
          {data.marks !== null && (
            <div className={`text-right p-4 rounded-2xl border ${failed ? "border-amber-500/40 bg-amber-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
              <p className="text-[10px] text-slate-400 font-mono">MARKS</p>
              <p className="text-2xl font-black font-mono text-white">
                {data.marks} <span className="text-base text-slate-500">/ {data.assignment.totalMarks}</span>
              </p>
            </div>
          )}
        </div>

        {data.marks === null ? (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2">
            <Timer className="h-4 w-4" /> Awaiting review — the faculty will grade your worksheet shortly.
          </div>
        ) : (
          <div className={`p-4 rounded-2xl border ${failed ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
            <p className={`text-xs font-bold ${failed ? "text-amber-400" : "text-emerald-400"}`}>
              {failed ? "Needs Work" : "Completed"}
            </p>
            {data.note && <p className="text-xs text-slate-300 mt-1 italic">&quot;{data.note}&quot;</p>}
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-cyan-400" /> Your answers
          </h3>
          <div className="space-y-3">
            {data.questions.map((q, i) => (
              <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-slate-200">Q{i + 1}. {q.text}</p>
                  <span className="shrink-0 text-[10px] text-slate-500 bg-slate-800 rounded px-2 py-1">{q.marks} marks</span>
                </div>
                <p className="text-sm text-white bg-slate-900/60 rounded-xl border border-slate-800 px-3 py-2">
                  {data.answers[i] || "\u2014"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/student-portal/assignments" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Back to Worksheets
        </Link>
      </div>
    );
  }

  /* state === "open" — the solve form */
  const { assignment } = data;
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">{assignment.subject}</span>
          <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-bold font-mono">{assignment.batch}</span>
          {assignment.overdue && (
            <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
              Past deadline
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white">{assignment.title}</h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> Due {assignment.dueDate} · {assignment.questions.length} questions · {assignment.totalMarks} marks
        </p>
        {assignment.description && (
          <p className="mt-3 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 rounded-2xl p-3">{assignment.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {assignment.questions.map((q, i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-sm text-slate-200 leading-relaxed">
                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold mr-2">
                  {i + 1}
                </span>
                {q.text}
              </p>
              <span className="shrink-0 text-[10px] text-slate-500 bg-slate-800 rounded px-2 py-1">{q.marks} marks</span>
            </div>
            <textarea
              value={answers[i] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
              placeholder="Type your answer..."
              className={inputCls}
            />
          </div>
        ))}
      </div>

      {submitError && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{submitError}</div>
      )}

      <button
        onClick={submit}
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Submitting..." : "Submit for Review"}
      </button>
    </div>
  );
}
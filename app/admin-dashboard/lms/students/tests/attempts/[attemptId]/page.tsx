"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAttemptForGrading, gradeWrittenAnswers, type GradeScreenDTO } from "@/lib/actions/tests/grading";
import { GRADING_LOCKED_MESSAGE } from "@/lib/permissions";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, Save, Lock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GradeAttemptPage() {
  const params = useParams<{ attemptId: string }>();
  const [data, setData] = useState<GradeScreenDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getAttemptForGrading(params.attemptId)
      .then((res) => {
        if (ignore) return;
        if (!res) {
          setData(null);
          return;
        }
        setData(res);
        const initial: Record<string, string> = {};
        for (const q of res.questions) {
          if (q.type === "written" && q.graded && q.awardedMarks !== null) {
            initial[q.id] = String(q.awardedMarks);
          }
        }
        setGrades(initial);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [params.attemptId]);

  const load = () => {
    getAttemptForGrading(params.attemptId).then((res) => setData(res));
  };

  const written = data?.questions.filter((q) => q.type === "written") ?? [];
  const writtenUngraded = written.filter((q) => !q.graded);
  const mcq = data?.questions.filter((q) => q.type === "mcq") ?? [];

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaved(null);
    setError(null);
    try {
      const payload = writtenUngraded
        .map((q) => {
          const v = Number(grades[q.id]);
          if (Number.isFinite(v) && !Number.isNaN(v)) {
            return { questionId: q.id, marks: Math.min(Math.max(v, 0), q.marks) };
          }
          return null;
        })
        .filter((x): x is { questionId: string; marks: number } => x !== null);

      const res = await gradeWrittenAnswers(data.attemptId, payload);
      if (res.success) {
        setData({ ...data, writtenScore: res.writtenScore, score: res.score });
        setSaved(`Written ${res.writtenScore}, total ${res.score} / ${data.totalMarks}${res.remainingWritten > 0 ? `. ${res.remainingWritten} answer(s) remaining.` : " — fully graded."}`);
        void load();
      } else {
        setError(res.message ?? "Could not save grades.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading attempt...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-slate-400">Attempt not found.</p>
        <Link href="/admin-dashboard/lms/students/tests" className="text-slate-300 hover:text-white text-sm">Back to tests</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/admin-dashboard/lms/students/tests"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Back to test reports
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Grade Written Answers</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data.studentName} · {data.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel rounded-xl border border-white/10 px-4 py-2 text-center">
            <p className="text-xs text-slate-400 font-mono uppercase">Score</p>
            <p className="text-lg font-bold font-mono text-white">
              {data.score} / {data.totalMarks}
            </p>
          </div>
          <div className="glass-panel rounded-xl border border-emerald-500/20 px-4 py-2 text-center">
            <p className="text-xs text-slate-400 font-mono uppercase">Written</p>
            <p className="text-lg font-bold font-mono text-emerald-400">{data.writtenScore}</p>
          </div>
          {data.canGrade && (
            <Button
              onClick={() => void handleSave()}
              disabled={saving || writtenUngraded.length === 0}
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Grades"}
            </Button>
          )}
        </div>
      </div>

      {!data.canGrade && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <p>
            {GRADING_LOCKED_MESSAGE} You can still read the answers below.
          </p>
        </div>
      )}
      {data.gradedBy && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <UserCheck size={14} className="text-emerald-400" />
          Graded by {data.gradedBy.name} ({data.gradedBy.role === "admin" ? "Admin" : "Staff"}) on{" "}
          {new Date(data.gradedBy.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      )}

      {saved && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
          {saved}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* MCQ scorecard */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-4">
            Objective Answers (auto-graded)
          </h2>
          <div className="space-y-3">
            {mcq.length === 0 && <p className="text-sm text-slate-400">No MCQ questions.</p>}
            {mcq.map((q) => (
              <div key={q.id} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-200 font-medium flex-1">
                    <span className="text-slate-400 font-mono text-xs mr-2">MCQ · {q.marks} marks</span>
                    {q.text}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    q.isCorrect ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {q.isCorrect ? `+${q.awardedMarks}` : "0"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options.map((opt, i) => {
                    const selected = (q.selectedIndices ?? []).includes(i);
                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-sm border ${
                          selected
                            ? q.isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                              : "bg-red-500/10 border-red-500/20 text-red-300"
                            : "bg-slate-900/50 border-white/5 text-slate-400"
                        }`}
                      >
                        <span className="font-mono mr-2">{String.fromCharCode(65 + i)}</span>
                        {opt}
                        {selected && (
                          <span className="ml-2 text-xs font-bold">
                            {q.isCorrect ? "(student's answer — correct)" : "(student's answer)"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Written grading */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white mb-4">
            Subjective Answers{data.canGrade ? " (grade now)" : ""}
            {writtenUngraded.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                {writtenUngraded.length} pending
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {written.length === 0 && <p className="text-sm text-slate-400">No written questions.</p>}
            {written.map((q) => (
              <div key={q.id} className="border border-white/10 rounded-lg p-4 bg-white/[0.02]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm text-slate-200 font-medium flex-1">
                    <span className="text-slate-400 font-mono text-xs mr-2">WRITTEN · {q.marks} marks</span>
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400 font-mono">Award (max {q.marks})</label>
                    <input
                      type="number"
                      min={0}
                      max={q.marks}
                      value={grades[q.id] ?? ""}
                      onChange={(e) => setGrades((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      disabled={!data.canGrade || (q.graded && !writtenUngraded.includes(q))}
                      className="w-24 px-3 py-1.5 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white text-right font-mono disabled:opacity-50"
                    />
                    {q.graded && (
                      <span className="text-xs font-semibold text-emerald-400">done</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 p-4 rounded-lg bg-slate-900/50 border border-white/5 text-sm text-slate-300 whitespace-pre-wrap min-h-[60px]">
                  {q.answerText?.trim() || <span className="text-slate-500 italic">No answer submitted.</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
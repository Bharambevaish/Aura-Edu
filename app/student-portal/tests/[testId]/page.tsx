"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getTestIntro,
  startStudentTest,
  submitStudentTest,
  type TestIntro,
  type StartTestResult,
} from "@/lib/actions/tests/student-tests";
import type { QuestionDTO } from "@/lib/services/tests";
import {
  Loader2,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  ShieldCheck,
  AlarmClock,
  MousePointerClick,
  Send,
  AlertTriangle,
  Lock,
  Maximize2,
} from "lucide-react";

type Answers = Record<string, { selected: number[]; answerText: string | null }>;

export default function TestTakingPage() {
  const params = useParams<{ testId: string }>();

  const [intro, setIntro] = useState<TestIntro | null>(null);
  const [introLoading, setIntroLoading] = useState(true);
  const [beginLoading, setBeginLoading] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);

  const [data, setData] = useState<StartTestResult | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    obtained: number;
    totalMarks: number;
    mcqScore: number;
    writtenScore: number;
    pendingWritten: number;
    note?: string;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [switchCount, setSwitchCount] = useState(0);
  const [switchWarn, setSwitchWarn] = useState(false);
  const [fullscreenWarn, setFullscreenWarn] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const setErrorMsg = useCallback((m: string) => setErrMsg(m), []);

  const autoSubmitted = useRef(false);
  const lastSwitchEvent = useRef(0);
  const switchCountRef = useRef(0);
  const doSubmitRef = useRef<(reason?: string) => Promise<void>>(undefined!);

  const examActive = data !== null && data.state !== "already_submitted" && submitted === null;

  const doSubmit = useCallback(
    async (reason?: string) => {
      if (!data || data.state === "already_submitted") return;
      setSubmitting(true);
      const res = await submitStudentTest({
        attemptId: data.attemptId,
        testId: data.testId,
        answers: Object.entries(answers).map(([questionId, a]) => ({
          questionId,
          selectedIndices: a.selected,
          answerText: a.answerText ?? null,
        })),
      });
      setSubmitting(false);
      if (res.status) {
        setSubmitted({
          obtained: res.obtained,
          totalMarks: res.totalMarks,
          mcqScore: res.mcqScore,
          writtenScore: res.writtenScore,
          pendingWritten: res.pendingWritten,
          note: reason,
        });
        setConfirmSubmit(false);
      } else {
        setErrorMsg("Submission failed — please try again.");
      }
    },
    [data, answers, setErrorMsg],
  );

  useEffect(() => {
    doSubmitRef.current = doSubmit;
  }, [doSubmit]);

  // Intro load (does NOT start the attempt).
  useEffect(() => {
    let ignore = false;
    getTestIntro(params.testId)
      .then((res) => {
        if (!ignore) setIntro(res);
      })
      .catch(() => {
        if (!ignore) setErrMsg("Could not load this test.");
      })
      .finally(() => {
        if (!ignore) setIntroLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [params.testId]);

  // Begin: request fullscreen synchronously (user gesture) then create attempt.
  const begin = () => {
    setBeginError(null);
    setErrMsg(null);
    try {
      const el = document.documentElement;
      const p = el.requestFullscreen?.() as Promise<void> | undefined;
      void p?.catch(() => {
        setFullscreenWarn(true);
      });
    } catch {
      setFullscreenWarn(true);
    }
    setBeginLoading(true);
    startStudentTest(params.testId)
      .then((res) => {
        setData(res);
        if (res.state !== "already_submitted") {
          const seeded: Answers = {};
          for (const q of res.questions) {
            seeded[q.id] = {
              selected: q.selectedIndices ?? [],
              answerText: q.answerText ?? null,
            };
          }
          setAnswers(seeded);
          setSecondsLeft(Math.max(0, Math.floor((new Date(res.deadlineAt).getTime() - Date.now()) / 1000)));
        }
      })
      .catch(() => setBeginError("Could not start the test — try again."))
      .finally(() => setBeginLoading(false));
  };

  const enterFullscreen = () => {
    try {
      const el = document.documentElement;
      const p = el.requestFullscreen?.() as Promise<void> | undefined;
      void p?.catch(() => {
        setFullscreenWarn(false);
      });
    } catch {
      setFullscreenWarn(false);
    }
    setFullscreenWarn(false);
  };

  // Track fullscreen state + surface the warning while the exam is active but
  // the screen is not in fullscreen.
  useEffect(() => {
    const onChange = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      setFullscreenWarn(examActive && !fs);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [examActive]);

  // Tab-switch monitor: count hidden tab / window blur events. Warning at 1-2
  // switches; auto-submit on the 3rd.
  useEffect(() => {
    if (!examActive) return;
    const register = () => {
      const now = Date.now();
      if (now - lastSwitchEvent.current < 800) return; // blur+hidden double-fire guard
      lastSwitchEvent.current = now;
      const next = switchCountRef.current + 1;
      switchCountRef.current = next;
      setSwitchCount(next);
      if (next >= 3) {
        if (!autoSubmitted.current) {
          autoSubmitted.current = true;
          void doSubmitRef.current("Auto-submitted — you switched away from the exam 3 times.");
        }
      } else {
        setSwitchWarn(true);
      }
    };
    const onVisibility = () => {
      if (document.hidden) register();
    };
    const onBlur = () => register();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [examActive]);

  // Countdown timer (decrement) + auto-submit at 0.
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || submitted !== null) return;
    if (!autoSubmitted.current) {
      autoSubmitted.current = true;
      void doSubmitRef.current("Auto-submitted — time ran out.");
    }
  }, [secondsLeft, submitted]);

  const toggleMcq = (questionId: string, index: number, allowMultiple: boolean) => {
    setAnswers((prev) => {
      const cur = prev[questionId]?.selected ?? [];
      const selected = allowMultiple
        ? cur.includes(index)
          ? cur.filter((i) => i !== index)
          : [...cur, index]
        : [index];
      return { ...prev, [questionId]: { selected, answerText: null } };
    });
  };

  const setWritten = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { selected: [], answerText: text } }));
  };

  // ---------------- Loading / intro ----------------
  if (introLoading) {
    return (
      <div className="space-y-6">
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-sm gap-2 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" /> Preparing your examination...
        </div>
      </div>
    );
  }

  if (!intro) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
        <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
        <p className="text-white font-bold">{errMsg ?? "Test unavailable."}</p>
        <Link href="/student-portal/tests" className="inline-block px-4 py-2 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
          Back to Tests
        </Link>
      </div>
    );
  }

  // Already submitted (idle view of the transcript).
  if (intro.state === "already_submitted") {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
        <div>
          <h2 className="text-xl font-bold text-white">{intro.title}</h2>
          <p className="text-xs text-slate-400 mt-1">You have already attempted this examination.</p>
        </div>
        {intro.result && (
          <div className="mx-auto max-w-sm grid grid-cols-2 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">MCQ SCORE</p>
              <p className="text-lg font-black text-emerald-400 font-mono">{intro.result.mcqScore}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">WRITTEN</p>
              <p className="text-lg font-black text-cyan-400 font-mono">{intro.result.writtenScore}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 col-span-2">
              <p className="text-[10px] text-slate-400 font-mono">TOTAL SCORE</p>
              <p className="text-2xl font-black text-white font-mono">
                {intro.result.obtained}{" "}
                <span className="text-base text-slate-500">/ {intro.result.totalMarks}</span>
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link href="/student-portal/tests" className="px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
            Back to Tests
          </Link>
          <Link href="/student-portal/test-card" className="px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-200 font-bold text-xs">
            View Test Card
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- Ready / Begin screen ----------------
  if (!data) {
    const canBegin = intro.status === "active" && !beginLoading;
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-2xl">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <span className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-widest">{intro.subject}</p>
              <h2 className="text-xl font-bold text-white">{intro.title}</h2>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">DURATION</p>
              <p className="text-base font-bold text-white font-mono">{intro.durationMinutes} min</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">TOTAL MARKS</p>
              <p className="text-base font-bold text-white font-mono">{intro.totalMarks}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">PASS MARKS</p>
              <p className="text-base font-bold text-white font-mono">{intro.passMarks}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-200 mb-1">Instructions</p>
            <p>{intro.instructions}</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 space-y-2">
            <p className="flex items-center gap-2 font-bold">
              <Lock className="h-4 w-4" /> Secure mode — read before you begin
            </p>
            <ul className="space-y-1 text-rose-200/80">
              <li>• The test locks your screen to fullscreen the moment you start.</li>
              <li>• Each tab switch or window focus loss is recorded. After 3 switches, the exam auto-submits.</li>
              <li>• MCQ answers are graded instantly; written answers go to faculty.</li>
            </ul>
          </div>

          {beginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{beginError}</div>
          )}

          <button
            onClick={begin}
            disabled={!canBegin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {beginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize2 className="h-4 w-4" />}
            {canBegin ? "Begin Test (Fullscreen Lock)" : "Test is not open right now"}
          </button>
        </div>
      </div>
    );
  }

  // Already submitted immediately after begin (race with another submit).
  if (data.state === "already_submitted") {
    return (
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">{data.result?.title ?? "Test"}</h2>
        <p className="text-xs text-slate-400">You have already attempted this examination.</p>
        <Link href="/student-portal/tests" className="inline-block px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
          Back to Tests
        </Link>
      </div>
    );
  }

  const questions: QuestionDTO[] = data.questions;
  const total = questions.length;
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    return q.type === "mcq" ? a.selected.length > 0 : (a.answerText?.trim() ?? "") !== "";
  }).length;
  const q = questions[current];
  const mm = Math.floor((secondsLeft ?? 0) / 60);
  const ss = (secondsLeft ?? 0) % 60;

  if (submitted) {
    const passed = submitted.obtained >= data.passMarks;
    return (
      <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{data.title} — Submitted</h2>
          <p className="text-xs text-slate-400 mt-1">
            MCQ answers were graded instantly. Written answers go to faculty for assessment.
          </p>
          {submitted.note && (
            <p className="inline-block mt-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-semibold">
              {submitted.note}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-left max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-mono">MCQ SCORE</p>
            <p className="text-lg font-black text-emerald-400 font-mono">{submitted.mcqScore}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <p className="text-[10px] text-slate-400 font-mono">WRITTEN</p>
            <p className="text-lg font-black text-cyan-400 font-mono">{submitted.writtenScore} <span className="text-xs text-slate-500">({submitted.pendingWritten} grading)</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 col-span-2">
            <p className="text-[10px] text-slate-400 font-mono">TOTAL SCORE</p>
            <p className={`text-2xl font-black font-mono ${passed ? "text-emerald-400" : "text-rose-400"}`}>
              {submitted.obtained} <span className="text-base text-slate-500">/ {submitted.totalMarks}</span>
            </p>
          </div>
        </div>
        <div>
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black ${passed ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-slate-950"}`}>
            {passed ? "PASS" : "BELOW PASS MARKS"}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link href="/student-portal/tests" className="px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs">
            Back to Tests
          </Link>
          <Link href="/student-portal/test-card" className="px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-200 font-bold text-xs">
            View Test Card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exam header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-widest">{data.subject}</p>
          <h2 className="text-xl font-bold text-white">{data.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{data.instructions}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-3 rounded-2xl bg-slate-950 border font-mono text-sm font-bold flex items-center gap-2 ${(secondsLeft ?? 0) <= 300 ? "border-red-500/50 text-red-400" : "border-slate-800 text-cyan-400"}`}>
            <Clock className="h-4 w-4" />
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-mono">ANSWERED</p>
            <p className="text-base font-bold text-white font-mono">{answeredCount} / {total}</p>
          </div>
        </div>
      </div>

      {/* Proctoring strip */}
      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-200">
        <Eye className="h-4 w-4 text-rose-400" />
        <div className="flex-1">
          <p className="font-bold">Proctoring active</p>
          <p className="text-rose-200/70">Fullscreen locked. Tab switches remaining: {Math.max(0, 3 - switchCount)} of 3.</p>
        </div>
        {!isFullscreen ? (
          <ShieldCheck className="h-4 w-4 text-rose-400" />
        ) : (
          <Lock className="h-4 w-4 text-emerald-400" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        {/* Question panel */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 font-mono">
              QUESTION {current + 1} / {total}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">
              {q.type === "mcq" ? (q.allowMultiple ? "MCQ · MULTI-SELECT" : "MCQ") : "WRITTEN"} · {q.marks} marks
            </span>
          </div>

          <h3 className="text-base font-bold text-white leading-relaxed mb-5">{q.text}</h3>

          {q.type === "mcq" ? (
            <div className="space-y-3">
              {q.options.map((option, index) => {
                const selected = (answers[q.id]?.selected ?? []).includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => toggleMcq(q.id, index, Boolean(q.allowMultiple))}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left text-sm transition-all ${
                      selected
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selected ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}>
                      {q.allowMultiple ? (selected ? "✓" : "") : selected ? "●" : String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
              {q.allowMultiple && (
                <p className="text-[11px] text-amber-300/80 flex items-center gap-1">
                  <MousePointerClick className="h-3.5 w-3.5" /> Select all correct options. Exact match earns the full {q.marks} marks.
                </p>
              )}
            </div>
          ) : (
            <textarea
              value={answers[q.id]?.answerText ?? ""}
              onChange={(e) => setWritten(q.id, e.target.value)}
              rows={10}
              placeholder="Type your answer here..."
              className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-white/10 disabled:opacity-40 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            {current === total - 1 ? (
              <button
                onClick={() => setConfirmSubmit(true)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> Submit Examination
              </button>
            ) : (
              <button
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                className="px-4 py-2.5 rounded-xl bg-purple-500 text-slate-950 text-xs font-bold hover:bg-purple-400 flex items-center gap-2"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question navigator */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 h-fit space-y-4">
          <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Navigator</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((item, index) => {
              const a = answers[item.id];
              const done = item.type === "mcq"
                ? (a?.selected?.length ?? 0) > 0
                : (a?.answerText?.trim() ?? "") !== "";
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrent(index)}
                  className={`h-9 rounded-lg text-xs font-bold transition-all ${
                    current === index
                      ? "bg-purple-500 text-slate-950"
                      : done
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="pt-2 space-y-1 text-[10px] text-slate-500">
            <p><span className="inline-block w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50 mr-1" /> Attempted</p>
            <p><span className="inline-block w-3 h-3 rounded bg-slate-800 border border-slate-600 mr-1" /> Not attempted</p>
          </div>
        </div>
      </div>

      {/* Fullscreen warning overlay */}
      {fullscreenWarn && (submitted === null) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <Maximize2 className="h-8 w-8 text-amber-400 mx-auto" />
            <div>
              <h3 className="font-bold text-white">Fullscreen required</h3>
              <p className="text-xs text-slate-400 mt-1">
                The exam is locked to fullscreen. Re-enter fullscreen to continue — exit counts against your 3 allowed switches.
              </p>
            </div>
            <button
              onClick={() => void enterFullscreen()}
              className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Re-enter Fullscreen
            </button>
            <button
              onClick={() => setFullscreenWarn(false)}
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-slate-700 text-slate-300 text-xs font-semibold"
            >
              Continue anyway
            </button>
          </div>
        </div>
      )}

      {/* Tab-switch warning overlay */}
      {switchWarn && (submitted === null) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlarmClock className="h-8 w-8 text-amber-400 mx-auto" />
            <div>
              <h3 className="font-bold text-white">Tab switch detected — attempt {switchCount} of 3</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have {3 - switchCount} switch(es) left. On the 3rd the exam auto-submits and locks.
              </p>
            </div>
            <button
              onClick={() => setSwitchWarn(false)}
              className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              I understand — continue
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {confirmSubmit && (submitted === null) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <div>
              <h3 className="font-bold text-white">Submit examination?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You answered {answeredCount} of {total} questions. MCQ answers are auto-graded immediately; written answers go to faculty.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSubmit(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-200 text-xs font-bold disabled:opacity-60"
              >
                Keep Writing
              </button>
              <button
                onClick={() => void doSubmit()}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
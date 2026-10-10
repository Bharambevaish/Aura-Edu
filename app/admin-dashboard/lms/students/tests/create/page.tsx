"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTest, getTestFormContext, type TestFormContext } from "@/lib/actions/tests/admin-tests";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";

type QInput = {
  type: "mcq" | "written";
  text: string;
  marks: number;
  options: string[];
  correctIndices: number[];
};

const emptyQuestion = (): QInput => ({
  type: "mcq",
  text: "",
  marks: 4,
  options: ["", ""],
  correctIndices: [],
});

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

const DURATIONS = [30, 60, 90, 120, 180];

export default function CreateTestPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passMarks, setPassMarks] = useState(0);
  const [startAt, setStartAt] = useState("");
  const [questions, setQuestions] = useState<QInput[]>([emptyQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ctx, setCtx] = useState<TestFormContext | null>(null);

  useEffect(() => {
    let ignore = false;
    getTestFormContext().then((c) => {
      if (!ignore) setCtx(c);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  /* ---- derived option lists ----------------------------------------------- */

  const courseOptions: ComboboxOption[] = (ctx?.courses ?? []).map((c) => ({
    value: c.name,
    hint: c.studentCount > 0 ? `${c.studentCount} student${c.studentCount === 1 ? "" : "s"}` : "No students yet",
  }));

  const subjectOptions: ComboboxOption[] = (ctx?.subjects ?? []).map((s) => ({ value: s }));
  if (subject && !subjectOptions.some((o) => o.value === subject)) {
    subjectOptions.unshift({ value: subject });
  }

  // Show batches for the picked course first; other batches stay selectable
  // (allowCustom lets users type a brand-new batch anytime).
  const inCourse = (b: { name: string; studentCount: number; courses: string[] }) =>
    !course || b.courses.length === 0 || b.courses.includes(course);
  const batchOptions: ComboboxOption[] = (ctx?.batches ?? [])
    .filter(inCourse)
    .sort((a, b) => Number(b.studentCount > 0) - Number(a.studentCount > 0))
    .map((b) => ({
      value: b.name,
      hint:
        b.studentCount > 0
          ? `${b.studentCount} student${b.studentCount === 1 ? "" : "s"}${b.courses.length ? ` · ${b.courses[0]}` : ""}`
          : "No students yet",
    }));
  if (batch && !batchOptions.some((o) => o.value === batch)) {
    batchOptions.unshift({ value: batch });
  }

  const selectedBatch = ctx?.batches.find((b) => b.name === batch);

  /* ---- question/interaction helpers --------------------------------------- */

  const setQuestion = (index: number, patch: Partial<QInput>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const setOption = (qIndex: number, oIndex: number, value: string) => {
    const next = [...questions];
    const q = { ...next[qIndex] };
    const options = [...q.options];
    options[oIndex] = value;
    q.options = options;
    if (!options[oIndex].trim()) {
      q.correctIndices = q.correctIndices.filter((i) => i !== oIndex);
    }
    next[qIndex] = q;
    setQuestions(next);
  };

  const toggleCorrect = (qIndex: number, oIndex: number) => {
    const q = questions[qIndex];
    const has = q.correctIndices.includes(oIndex);
    setQuestion(qIndex, {
      correctIndices: has ? q.correctIndices.filter((i) => i !== oIndex) : [...q.correctIndices, oIndex],
    });
  };

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    setQuestion(qIndex, { options: [...q.options, ""] });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const q = questions[qIndex];
    if (q.options.length <= 2) return;
    setQuestion(qIndex, {
      options: q.options.filter((_, i) => i !== oIndex),
      correctIndices: q.correctIndices.filter((i) => i !== oIndex).map((i) => (i > oIndex ? i - 1 : i)),
    });
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- submit -------------------------------------------------------------- */

  const submit = () => {
    setError(null);

    if (title.trim().length < 3) {
      setError("Give the test a title (at least 3 characters).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!subject.trim() || !course.trim() || !batch.trim()) {
      setError("Subject, course and batch are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!startAt) {
      setError("Pick a start date and time.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    for (const q of questions) {
      if (!q.text.trim()) {
        setError("Every question needs text.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (q.type === "mcq") {
        const valid = q.options.filter((o) => o.trim().length > 0);
        if (valid.length < 2) {
          setError(`MCQ "${q.text.slice(0, 40)}" needs at least 2 options.`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (q.correctIndices.filter((i) => i < q.options.length).length === 0) {
          setError(`Mark the correct option for "${q.text.slice(0, 40)}".`);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
    }

    if (new Date(startAt).getTime() < Date.now() - 60000) {
      setError("Start time is in the past — pick a future time.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    createTest({
      title: title.trim(),
      subject: subject.trim(),
      course: course.trim(),
      batch: batch.trim(),
      description: description.trim() || undefined,
      durationMinutes: Number(durationMinutes),
      passMarks: Number(passMarks),
      startAt: new Date(startAt).toISOString(),
      questions: questions.map((q) => ({
        type: q.type,
        text: q.text.trim(),
        marks: Number(q.marks) || 1,
        options: q.type === "mcq" ? q.options.filter((o) => o.trim().length > 0).map((o) => o.trim()) : [],
        correctIndices: q.type === "mcq" ? q.correctIndices.filter((i) => i < q.options.length) : [],
      })),
    })
      .then((res) => {
        if (!res.ok || !res.testId) {
          setError(res.message ?? "Could not create test.");
          setSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        router.push(`/admin-dashboard/lms/students/tests/${res.testId}`);
      })
      .catch(() => {
        setError("Could not create the test — please try again.");
        setSubmitting(false);
      });
  };

  const now = new Date();
  const minStartAt = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin-dashboard/lms/students/tests")}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Test Management
      </button>

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create a New Test</h1>
          <p className="text-sm text-slate-400 mt-1">
            MCQ questions (single or multi-correct) and written questions. Students take it in a locked fullscreen with a 3-switch limit.
          </p>
        </div>

        {/* Test details */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <FileText size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Test Details</h2>
          </div>

          <div>
            <label className={labelCls}>Test title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit Test 2 — Heredity & Evolution"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Course</label>
              <Combobox
                value={course}
                onChange={setCourse}
                options={courseOptions}
                placeholder="Select or type a course"
                className={inputCls}
              />
              {course && ctx?.courses.some((c) => c.name === course) && (
                <p className="text-[11px] text-slate-500 mt-1">
                  {ctx.courses.find((c) => c.name === course)?.studentCount ?? 0} students on this course
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Subject</label>
              <Combobox
                value={subject}
                onChange={setSubject}
                options={subjectOptions}
                placeholder="Select or type a subject"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Batch</label>
            <Combobox
              value={batch}
              onChange={setBatch}
              options={batchOptions}
              placeholder="Select or type a batch"
              className={inputCls}
            />
            {selectedBatch && (
              <p className="text-[11px] text-emerald-400/80 mt-1">
                {selectedBatch.studentCount} student{selectedBatch.studentCount === 1 ? "" : "s"} in this batch
                {selectedBatch.courses.length ? ` · ${selectedBatch.courses[0]}` : ""}
              </p>
            )}
            {!selectedBatch && batch && (
              <p className="text-[11px] text-amber-400/80 mt-1">New batch — it will be created with this test.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration (minutes)</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationMinutes(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      durationMinutes === d
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-white/10"
                    }`}
                  >
                    {d < 60 ? `${d}` : d % 60 === 0 ? `${d / 60}h` : `${d}m`}
                  </button>
                ))}
                <input
                  type="number"
                  min={5}
                  max={300}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 w-24 px-3 py-1.5 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Pass marks</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min={0}
                  max={Math.max(totalMarks, 100)}
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() => setPassMarks(Math.round(totalMarks * 0.4))}
                  disabled={totalMarks === 0}
                  title="40% of the total marks"
                >
                  <Sparkles size={14} /> 40%
                </Button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total marks: {totalMarks}. &quot;40%&quot; sets pass = {Math.round(totalMarks * 0.4)}.</p>
            </div>
          </div>

          <div>
            <label className={labelCls}>Start date &amp; time</label>
            <input
              type="datetime-local"
              min={minStartAt}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-slate-500 mt-1">Pick the opening time — the test runs for {durationMinutes} minutes from then.</p>
          </div>

          <div>
            <label className={labelCls}>Description / instructions</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions shown to students before they begin..."
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">
                Questions <span className="text-slate-400 font-normal">({questions.length} · {totalMarks} marks total)</span>
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus size={14} /> Add Question
            </Button>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    {qIndex + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setQuestion(qIndex, { type: "mcq" })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${q.type === "mcq" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      MCQ
                    </button>
                    <button
                      onClick={() => setQuestion(qIndex, { type: "written" })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${q.type === "written" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                    >
                      Written
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={q.marks}
                      onChange={(e) => setQuestion(qIndex, { marks: Number(e.target.value) })}
                      className="w-16 px-2 py-1 border border-white/10 rounded-lg text-sm text-center bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white"
                    />
                    <span className="text-xs text-slate-400">marks</span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove question"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={q.text}
                onChange={(e) => setQuestion(qIndex, { text: e.target.value })}
                placeholder={q.type === "mcq" ? "Type the question..." : "Type the written question students must answer..."}
                rows={2}
                className={inputCls}
              />

              {q.type === "mcq" ? (
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => {
                    const correct = q.correctIndices.includes(oIndex);
                    return (
                      <div key={oIndex} className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCorrect(qIndex, oIndex)}
                          className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center text-sm font-bold transition-colors ${
                            correct ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 text-slate-500 hover:border-emerald-400 hover:text-emerald-400"
                          }`}
                          title={correct ? "Marked correct" : "Mark correct"}
                        >
                          ✓
                        </button>
                        <input
                          value={option}
                          onChange={(e) => setOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className="flex-1 px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500"
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove option"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => addOption(qIndex)} className="flex items-center gap-1 text-emerald-400 text-xs font-semibold hover:text-emerald-300 transition-colors">
                      <Plus size={13} /> Add option
                    </button>
                    <span className="text-[11px] text-slate-500">
                      Tick ✓ the correct option{q.correctIndices.length > 1 ? "s (multi-correct)" : ""} — {q.correctIndices.length} marked
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 bg-slate-900/50 border border-dashed border-white/10 rounded-lg px-3 py-2">
                  Written answer question — students type their response; faculty grade it manually on the Reports screen.
                </p>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <Button
          onClick={submit}
          loading={submitting}
          className="w-full py-3"
          disabled={submitting}
        >
          <Save size={18} />
          {submitting ? "Creating test..." : "Create Test"}
        </Button>
      </div>
    </div>
  );
}
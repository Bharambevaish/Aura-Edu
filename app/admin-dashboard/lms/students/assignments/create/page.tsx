"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/lib/actions/assignments";
import { getTestFormContext, type TestFormContext } from "@/lib/actions/tests/admin-tests";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";

type QInput = {
  text: string;
  marks: number;
};

const emptyQuestion = (): QInput => ({ text: "", marks: 5 });

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function CreateAssignmentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
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

  const courseOptions: ComboboxOption[] = (ctx?.courses ?? []).map((c) => ({
    value: c.name,
    hint: c.studentCount > 0 ? `${c.studentCount} student${c.studentCount === 1 ? "" : "s"}` : "No students yet",
  }));

  const subjectOptions: ComboboxOption[] = (ctx?.subjects ?? []).map((s) => ({ value: s }));
  if (subject && !subjectOptions.some((o) => o.value === subject)) {
    subjectOptions.unshift({ value: subject });
  }

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

  const setQuestion = (index: number, patch: Partial<QInput>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };
  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    setError(null);

    if (title.trim().length < 3) {
      setError("Give the worksheet a title (at least 3 characters).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!subject.trim() || !course.trim() || !batch.trim()) {
      setError("Subject, course and batch are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!dueDate) {
      setError("Pick a submission deadline.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (new Date(dueDate).getTime() < Date.now() - 60000) {
      setError("Deadline is in the past — pick a future date and time.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        setError("Every question needs text.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSubmitting(true);
    createAssignment({
      title: title.trim(),
      subject: subject.trim(),
      course: course.trim(),
      batch: batch.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      questions: questions.map((q) => ({ text: q.text.trim(), marks: Number(q.marks) || 1 })),
    })
      .then((res) => {
        if (!res.ok) {
          setError(res.message ?? "Could not create the assignment.");
          setSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        router.push("/admin-dashboard/lms/students/assignments");
      })
      .catch(() => {
        setError("Could not create the assignment — please try again.");
        setSubmitting(false);
      });
  };

  const now = new Date();
  const minDue = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin-dashboard/lms/students/assignments")}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Assignment Management
      </button>

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create a New Assignment</h1>
          <p className="text-sm text-slate-400 mt-1">
            A short online worksheet your batch solves in-app. Publishing sends an unread reminder notification to every student in the batch.
          </p>
        </div>

        {/* Assignment details */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <FileText size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Assignment Details</h2>
          </div>

          <div>
            <label className={labelCls}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Worksheet: Chemical Bonding"
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
                Reminder notification to {selectedBatch.studentCount} student{selectedBatch.studentCount === 1 ? "" : "s"} in this batch
                {selectedBatch.courses.length ? ` · ${selectedBatch.courses[0]}` : ""}
              </p>
            )}
            {!selectedBatch && batch && (
              <p className="text-[11px] text-amber-400/80 mt-1">
                No students found in this batch yet — the worksheet is published but nobody will be reminded.
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Submission deadline</label>
            <input
              type="datetime-local"
              min={minDue}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputCls}
            />
            <p className="text-[11px] text-slate-500 mt-1">After this time the worksheet reads as Overdue for students who haven&apos;t submitted.</p>
          </div>

          <div>
            <label className={labelCls}>Description / instructions</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions shown to students on the worksheet screen..."
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
            <div key={qIndex} className="border border-white/10 rounded-xl p-4 space-y-2 bg-white/[0.02]">
              <div className="flex items-center justify-between gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {qIndex + 1}
                </span>
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
                placeholder="Type the worksheet question students must answer..."
                rows={2}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3">
          <Bell size={14} className="text-emerald-400 shrink-0" />
          On publish, every student in the selected batch gets a reminder notification with a link straight to this worksheet.
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <Button onClick={submit} loading={submitting} className="w-full py-3" disabled={submitting}>
          <Save size={18} />
          {submitting ? "Publishing..." : "Publish Assignment"}
        </Button>
      </div>
    </div>
  );
}
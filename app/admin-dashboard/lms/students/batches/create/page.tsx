"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBatch } from "@/lib/actions/batches";
import { getTestFormContext, type TestFormContext } from "@/lib/actions/tests/admin-tests";
import { ArrowLeft, Users, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";

const DAY = 24 * 60 * 60 * 1000;

const toISODate = (d: Date) => {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
};

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function CreateBatchPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [capacity, setCapacity] = useState(30);
  const [startDate, setStartDate] = useState(() => toISODate(new Date()));
  const [endDate, setEndDate] = useState(() => toISODate(new Date(Date.now() + 365 * DAY)));
  const [description, setDescription] = useState("");
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

  const courseOptions: ComboboxOption[] = (ctx?.courses ?? []).map((c) => ({
    value: c.name,
    hint: c.studentCount > 0 ? `${c.studentCount} student${c.studentCount === 1 ? "" : "s"}` : "No students yet",
  }));

  const submit = () => {
    setError(null);

    if (name.trim().length < 2) {
      setError("Give the batch a name (at least 2 characters).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!course.trim()) {
      setError("Choose the course this batch runs.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!capacity || capacity < 1) {
      setError("Capacity must be at least 1.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!startDate || !endDate) {
      setError("Batch start and end dates are required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after the start date.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    createBatch({
      name: name.trim(),
      course: course.trim(),
      capacity,
      startDate,
      endDate,
      description: description.trim(),
    })
      .then((res) => {
        if (!res.ok) {
          setError(res.message ?? "Could not create the batch.");
          setSubmitting(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        router.push("/admin-dashboard/lms/students/batches");
      })
      .catch(() => {
        setError("Could not create the batch — please try again.");
        setSubmitting(false);
      });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/admin-dashboard/lms/students/batches")}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Batch Management
      </button>

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create a New Batch</h1>
          <p className="text-sm text-slate-400 mt-1">
            A batch defines the cohort, its course and timeline. Students join later from the batch page — assigning them
            also sets their batch and course.
          </p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Users size={16} className="text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Batch Details</h2>
          </div>

          <div>
            <label className={labelCls}>Batch name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NEET Batch C"
              className={inputCls}
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Capacity</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value) || 0)}
                className={inputCls}
              />
              <p className="text-[11px] text-slate-500 mt-1">Advisory only — new seats are flagged but never blocked.</p>
            </div>
            <div>
              <label className={labelCls}>Start date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this cohort about?"
              rows={3}
              className={inputCls}
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <Button onClick={submit} loading={submitting} className="w-full py-3" disabled={submitting}>
          <Save size={18} />
          {submitting ? "Creating..." : "Create Batch"}
        </Button>
      </div>
    </div>
  );
}
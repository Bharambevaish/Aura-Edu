"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import { getStudentAssignments, type StudentAssignmentRow } from "@/lib/actions/assignments";
import {
  FileCheck,
  Search,
  PlayCircle,
  CheckCircle2,
  Hourglass,
  AlertCircle,
  Loader2,
} from "lucide-react";

const statusStyle: Record<StudentAssignmentRow["status"], string> = {
  Pending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  Overdue: "bg-red-500/20 text-red-400 border border-red-500/30",
  Submitted: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  Reviewed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

export default function AssignmentsPage() {
  const { profile } = useStudent();
  const [assignments, setAssignments] = useState<StudentAssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssignments = useCallback(async () => await getStudentAssignments(), []);

  useEffect(() => {
    let ignore = false;
    fetchAssignments()
      .then((data) => {
        if (!ignore) setAssignments(data);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fetchAssignments]);

  const refresh = () => {
    void fetchAssignments().then(setAssignments);
  };

  const filtered = assignments.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      a.course.toLowerCase().includes(q);
    if (activeTab === "All") return matchesSearch;
    return matchesSearch && a.status === activeTab;
  });

  const counts = {
    All: assignments.length,
    Pending: assignments.filter((a) => a.status === "Pending").length,
    Overdue: assignments.filter((a) => a.status === "Overdue").length,
    Submitted: assignments.filter((a) => a.status === "Submitted").length,
    Reviewed: assignments.filter((a) => a.status === "Reviewed").length,
  };

  const tabs = [
    { id: "All", label: "All", count: counts.All },
    { id: "Pending", label: "Pending", count: counts.Pending },
    { id: "Overdue", label: "Overdue", count: counts.Overdue },
    { id: "Submitted", label: "Submitted", count: counts.Submitted },
    { id: "Reviewed", label: "Reviewed", count: counts.Reviewed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Worksheets & Homework</h2>
          </div>
          <p className="text-xs text-slate-400">
            Solve practice worksheets online, submit your answers, and get faculty feedback — all for {profile.batch}.
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-white/10 flex items-center gap-2 transition-all"
          title="Refresh"
        >
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, subject or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
              {t.count > 0 && <span className="ml-1 opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading worksheets...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">No worksheets match this filter.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/30 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">{a.subject}</span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-bold font-mono">{a.batch}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusStyle[a.status]}`}>{a.status}</span>
                </div>
                <h3 className="text-base font-bold text-white">{a.title}</h3>
                <p className="text-xs text-slate-400">Course: {a.course}</p>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 font-mono">
                  <div>
                    <span className="block text-[10px] text-slate-500">Due</span>
                    <span className="text-amber-400 font-semibold">{a.dueDate}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Total marks</span>
                    <span className="text-white font-semibold">{a.totalMarks}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Questions</span>
                    <span className="text-white font-semibold">{a.questionsCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500">Status</span>
                    <span className="text-white font-semibold">{a.status}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 flex flex-col md:items-end gap-3 min-w-[180px]">
                {a.status === "Reviewed" && a.obtainedMarks !== null ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 w-full">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" /> Reviewed
                    </div>
                    <p className="text-xl font-black text-emerald-400 font-mono">
                      {a.obtainedMarks} / {a.totalMarks}
                    </p>
                    {a.verdict && (
                      <p className={`text-xs font-bold ${a.verdict === "complete" ? "text-emerald-300" : "text-amber-400"}`}>
                        {a.verdict === "complete" ? "Complete" : "Needs Work"}
                      </p>
                    )}
                    {a.note && <p className="text-xs text-slate-400 italic">&quot;{a.note}&quot;</p>}
                    {a.submittedAt && (
                      <p className="text-[10px] text-slate-500 font-mono">Submitted {a.submittedAt}</p>
                    )}
                  </div>
                ) : a.status === "Submitted" ? (
                  <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 w-full text-center">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300">
                      <Hourglass className="h-4 w-4" /> Awaiting review
                    </div>
                    {a.submittedAt && (
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Submitted {a.submittedAt}</p>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/student-portal/assignments/${a.id}`}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-cyan-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {a.status === "Overdue" ? (
                      <>
                        <AlertCircle className="h-4 w-4" /> Solve (Overdue)
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4" /> Solve Worksheet
                      </>
                    )}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useStudent, AssignmentItem } from "@/context/StudentContext";
import {
  FileCheck,
  Search,
  Upload,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function AssignmentsPage() {
  const { assignments, submitAssignment } = useStudent();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAsg, setSelectedAsg] = useState<AssignmentItem | null>(null);
  const [uploadFileName, setUploadFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg || !uploadFileName) return;
    setIsSubmitting(true);
    setTimeout(() => {
      submitAssignment(selectedAsg.id, uploadFileName);
      setIsSubmitting(false);
      setSelectedAsg(null);
      setUploadFileName("");
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stats */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Assignments & Homework Portal</h2>
            </div>
            <p className="text-xs text-slate-400">
              Submit practice worksheets, NCERT drills, and numerical problem sheets online.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Total Worksheets</span>
            <p className="text-xl font-black text-white font-mono">{assignments.length}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Pending Action</span>
            <p className="text-xl font-black text-amber-400 font-mono">
              {assignments.filter((a) => a.status === "Pending").length}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Submitted</span>
            <p className="text-xl font-black text-cyan-400 font-mono">
              {assignments.filter((a) => a.status === "Submitted").length}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Evaluated & Approved</span>
            <p className="text-xl font-black text-emerald-400 font-mono">
              {assignments.filter((a) => a.status === "Approved").length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search + Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {["All", "Pending", "Submitted", "Approved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.map((asg) => (
          <div
            key={asg.id}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-cyan-500/30 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">
                  {asg.course.split(" ")[0]}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    asg.status === "Pending"
                      ? "bg-amber-500/20 text-amber-300"
                      : asg.status === "Submitted"
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {asg.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{asg.title}</h3>
              <p className="text-xs text-slate-400">Target Course: {asg.course}</p>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {asg.instructions}
              </p>
            </div>

            <div className="flex flex-col md:items-end justify-between space-y-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
              <div className="text-left md:text-right space-y-1">
                <p className="text-xs font-mono text-slate-400">Deadline: <strong className="text-amber-400">{asg.dueDate}</strong></p>
                <p className="text-xs font-mono text-slate-300">
                  Marks: {asg.obtainedMarks !== undefined ? `${asg.obtainedMarks}/${asg.totalMarks}` : `${asg.totalMarks} Total`}
                </p>
              </div>

              {asg.status === "Pending" ? (
                <button
                  onClick={() => setSelectedAsg(asg)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" /> Submit Homework
                </button>
              ) : (
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Submitted: {asg.submittedFile}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Submission Drawer */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" /> Submit Assignment PDF
                </h3>
                <button
                  onClick={() => setSelectedAsg(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono">SUBMITTING FOR</span>
                  <h2 className="text-base font-bold text-white mt-1">{selectedAsg.title}</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">File Name (PDF / Scan)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Nikhil_Worksheet4_Physics.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-slate-700 text-center space-y-2">
                  <Upload className="h-8 w-8 text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Drag & Drop your completed PDF here</p>
                  <p className="text-[10px] text-slate-500">Maximum file size: 25MB</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFileName}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading to Portal..." : "Confirm & Submit Assignment"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useStudent } from "@/context/StudentContext";
import {
  FileText,
  Download,
  Award,
  TrendingUp,
  CheckCircle2,
  Printer,
  Search,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function TestCardPage() {
  const { profile, tests } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");

  const completedTests = tests.filter((t) => t.status === "Completed");

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Print / Export Action */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Academic Test Card & Report</h2>
          </div>
          <p className="text-xs text-slate-400">
            Consolidated academic transcript for {profile.name} ({profile.admissionNo}).
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
        >
          <Printer className="h-4 w-4" /> Export Report PDF / Print
        </button>
      </div>

      {/* 2. Official Academic Test Card Certificate View */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Security Background Accent */}
        <div className="absolute top-0 right-0 p-8 opacity-5 text-cyan-400 pointer-events-none">
          <ShieldCheck className="h-64 w-64" />
        </div>

        {/* Top Transcript Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-widest uppercase">
              OFFICIAL ACADEMIC TRANSCRIPT • MYEDOU PORTAL
            </span>
            <h3 className="text-2xl font-black text-white">{profile.name}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Roll: {profile.rollNo} | Batch: {profile.batch} | Session: {profile.academicYear}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 font-mono">CUMULATIVE GRADE</span>
            <p className="text-xl font-black text-emerald-400 font-mono">GRADE A+</p>
            <p className="text-[10px] text-cyan-400 font-mono">Percentile: 96.8%</p>
          </div>
        </div>

        {/* 4 Summary Score Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Average Score</span>
            <p className="text-2xl font-black text-white font-mono mt-1">93.1%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Highest Score</span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-1">342 / 360</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Best Rank</span>
            <p className="text-2xl font-black text-cyan-400 font-mono mt-1">#2</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Pass Rate</span>
            <p className="text-2xl font-black text-purple-400 font-mono mt-1">100%</p>
          </div>
        </div>

        {/* Search Bar for History */}
        <div className="relative pt-4">
          <Search className="absolute left-3.5 top-7 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter test history by exam title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Detailed Assessment Table */}
        <div className="rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Test Title</th>
                <th className="p-4">Date</th>
                <th className="p-4">Marks Obtained</th>
                <th className="p-4">Total Marks</th>
                <th className="p-4">Batch Rank</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {completedTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{t.title}</td>
                  <td className="p-4 font-mono">{t.date}</td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">{t.obtainedMarks}</td>
                  <td className="p-4 font-mono">{t.totalMarks}</td>
                  <td className="p-4 font-bold text-cyan-400 font-mono">#{t.rank} of {t.totalStudents}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

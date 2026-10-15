"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getStudentTests, type TestCardDTO } from "@/lib/actions/tests/student-tests";
import {
  GraduationCap,
  Search,
  PlayCircle,
  FileText,
  Loader2,
} from "lucide-react";

export default function TestsPage() {
  const { profile } = useStudent();
  const router = useRouter();
  const [tests, setTests] = useState<TestCardDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTests = useCallback(async () => await getStudentTests(), []);

  useEffect(() => {
    let ignore = false;
    fetchTests()
      .then((data) => {
        if (!ignore) setTests(data);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fetchTests]);

  const refresh = () => {
    void fetchTests().then(setTests);
  };

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "All") return matchesSearch;
    return matchesSearch && t.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Link to Detailed Academic Test Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Tests & Quizzes Hub</h2>
          </div>
          <p className="text-xs text-slate-400">
            Online examination portal, timed mock drills, and score reports for {profile.batch}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void refresh()}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-slate-700 text-slate-300 font-bold text-xs hover:bg-white/10 flex items-center gap-2 transition-all"
            title="Refresh"
          >
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/student-portal/test-card"
            className="px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs hover:bg-purple-500/30 flex items-center gap-2 transition-all"
          >
            <FileText className="h-4 w-4" /> Consolidated Test Card & Scores
          </Link>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search test title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {["All", "Upcoming", "Active Now", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tests Cards List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your tests...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          No tests match this filter yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 space-y-4 flex flex-col justify-between transition-all group shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-bold font-mono">
                    {test.batch}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      test.status === "Active Now"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                        : test.status === "Upcoming"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {test.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {test.title}
                </h3>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-400 font-mono">
                  <p>Date: <strong className="text-white">{test.date}</strong></p>
                  <p>Timing: <strong className="text-white">{test.time}</strong></p>
                  <p>Duration: <strong className="text-white">{test.durationMinutes} Minutes</strong></p>
                  <p>Total Marks: <strong className="text-white">{test.totalMarks} Marks</strong></p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                {test.status === "Completed" ? (
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono">
                    <span>Score: {test.obtainedMarks} / {test.totalMarks}</span>
                    <span>Rank: #{test.rank} of {test.totalStudents}</span>
                  </div>
                ) : test.status === "Active Now" ? (
                  <button
                    onClick={() => router.push(`/student-portal/tests/${test.testId}`)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-cyan-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" /> Start Examination Now
                  </button>
                ) : (
                  <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs opacity-60">
                    {test.status === "Missed" ? `Closed on ${test.date} — not attempted` : `Starts on ${test.date}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
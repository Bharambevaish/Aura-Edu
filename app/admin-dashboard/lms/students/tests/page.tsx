"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getAdminTests, type AdminTestDTO } from "@/lib/actions/tests/admin-tests";
import {
  RefreshCw,
  Plus,
  Search,
  BarChart2,
  Loader2,
  ClipboardList,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TestManagementPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{ totalTests: number; totalAttempts: number; completed: number; passRate: number } | null>(null);
  const [tests, setTests] = useState<AdminTestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [batchFilter, setBatchFilter] = useState("All Batches");

  const fetchData = useCallback(async () => await getAdminTests(), []);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((data) => {
        if (!ignore) {
          setStats(data.stats);
          setTests(data.tests);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const refresh = () => {
    void fetchData().then((data) => {
      setStats(data.stats);
      setTests(data.tests);
    });
  };

  const courses = ["All Courses", ...Array.from(new Set(tests.map((t) => t.course))).sort()];
  const batches = ["All Batches", ...Array.from(new Set(tests.map((t) => t.batch))).sort()];

  const filtered = tests.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.batch.toLowerCase().includes(q);
    const statusLabel = t.status === "active" ? "Active" : t.status === "upcoming" ? "Upcoming" : "Completed";
    const matchStatus = statusFilter === "All Status" || statusLabel === statusFilter;
    const matchCourse = courseFilter === "All Courses" || t.course === courseFilter;
    const matchBatch = batchFilter === "All Batches" || t.batch === batchFilter;
    return matchSearch && matchStatus && matchCourse && matchBatch;
  });

  const statusBadge = (status: string) => {
    if (status === "completed")
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    if (status === "active")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  const chip = {
    marks: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    duration: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
    results: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    pass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    passRate: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  };

  const selectCls =
    "px-4 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-slate-300 min-w-[140px]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={20} className="text-emerald-400" />
            Test Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Batch-wise test assignment, scheduling, reporting, and exports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/admin-dashboard/lms/students/tests/create")}
          >
            <Plus size={16} />
            Create Test
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tests"
          value={loading ? "—" : (stats?.totalTests ?? 0)}
          icon={<ClipboardList size={18} />}
          accent="blue"
        />
        <StatCard
          label="Total Attempts"
          value={loading ? "—" : (stats?.totalAttempts ?? 0)}
          icon={<Users size={18} />}
          accent="amber"
        />
        <StatCard
          label="Completed"
          value={loading ? "—" : (stats?.completed ?? 0)}
          icon={<CheckCircle size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Pass Rate"
          value={loading ? "—" : `${(stats?.passRate ?? 0)}%`}
          icon={<TrendingUp size={18} />}
          accent="purple"
        />
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-2xl border border-white/10 p-3 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name, description or batch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={selectCls}
        >
          <option>All Status</option>
          <option>Completed</option>
          <option>Active</option>
          <option>Upcoming</option>
        </select>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className={selectCls}
        >
          {courses.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className={selectCls}
        >
          {batches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Test List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading tests...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tests found"
          message="No tests match these filters. Create a test or adjust your filters."
          action={<Button onClick={() => router.push("/admin-dashboard/lms/students/tests/create")}><Plus size={16} /> Create Test</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((test) => (
            <div key={test.id} className="glass-panel rounded-xl border border-white/10 p-5 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                <h2 className="text-base font-semibold text-white">{test.title}</h2>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(test.status)}`}>
                  {test.status === "completed" ? "COMPLETED" : test.status === "active" ? "ACTIVE" : "UPCOMING"}
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-3">{test.course}, {test.batch}</p>

              <p className="text-sm text-slate-300 mb-4 leading-relaxed">{test.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${chip.marks}`}>{test.totalMarks} marks</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${chip.duration}`}>{test.durationMinutes} min</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${chip.results}`}>{test.results} submitted</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${chip.pass}`}>pass {">"} {test.passMarks}</span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${chip.passRate}`}>{test.passRate}% pass</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Starts: {test.startsAt}</p>
                  <p>Ends: {test.endsAt}</p>
                </div>

                <Button
                  size="md"
                  onClick={() => router.push(`/admin-dashboard/lms/students/tests/${test.id}`)}
                >
                  <BarChart2 size={16} /> Reports
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
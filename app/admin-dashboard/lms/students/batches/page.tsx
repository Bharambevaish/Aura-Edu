"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getBatches,
  getBatchDetail,
  updateBatch,
  assignStudentsToBatch,
  removeStudentFromBatch,
  deleteBatch,
  type BatchesOverview,
  type AdminBatchRow,
} from "@/lib/actions/batches";
import { getTestFormContext, type TestFormContext } from "@/lib/actions/tests/admin-tests";
import {
  Plus,
  RefreshCw,
  Users,
  LayoutDashboard,
  Search,
  CheckCircle2,
  BookOpen,
  Clock,
  UserPlus,
  AlertTriangle,
  Eye,
  Loader2,
  Trash2,
  Pencil,
  Save,
  Send,
  X,
  ArrowRight,
  ArrowDownToLine,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";

type Detail = NonNullable<Awaited<ReturnType<typeof getBatchDetail>>>;

const statusPill: Record<AdminBatchRow["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const statusLabel: Record<AdminBatchRow["status"], string> = {
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
};

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function BatchManagementPage() {
  const [overview, setOverview] = useState<BatchesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ctx, setCtx] = useState<TestFormContext | null>(null);
  const [search, setSearch] = useState("");

  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState<"overview" | "students">("overview");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  /** whether the "currently in another batch" (move) section is expanded */
  const [showOthers, setShowOthers] = useState(false);

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState("");
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editCapacity, setEditCapacity] = useState(30);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    const data = await getBatches();
    setOverview(data);
  }, []);

  const loadDetail = useCallback((id: string | null) => {
    if (!id) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    getBatchDetail(id)
      .then(setDetail)
      .finally(() => setDetailLoading(false));
  }, []);

  useEffect(() => {
    let ignore = false;
    getBatches()
      .then((data) => {
        if (!ignore) setOverview(data);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    getTestFormContext().then((c) => {
      if (!ignore) setCtx(c);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    setRefreshing(true);
    void fetchOverview().finally(() => setRefreshing(false));
  };

  const selectBatch = (id: string) => {
    setActiveId(id);
    setTab("overview");
    setSelected(new Set());
    setSearch("");
    loadDetail(id);
  };

  const openAssign = () => {
    if (activeId) {
      setAssignError(null);
      setSelected(new Set());
      setShowOthers(false);
      setAssignOpen(true);
    }
  };

  const openAssignFromUnassigned = () => {
    const target = activeId ?? overview?.batches[0]?.id ?? null;
    if (!target) return;
    if (activeId !== target) selectBatch(target);
    setAssignError(null);
    setSelected(new Set());
    setShowOthers(false);
    setAssignOpen(true);
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmAssign = () => {
    const ids = [...selected];
    if (ids.length === 0 || !activeId) return;
    setAssignLoading(true);
    setAssignError(null);
    assignStudentsToBatch({ batchId: activeId, studentIds: ids })
      .then((res) => {
        if (!res.ok) {
          setAssignError(res.message ?? "Could not assign students.");
          return;
        }
        setAssignOpen(false);
        setSelected(new Set());
        void loadDetail(activeId);
        void fetchOverview();
      })
      .catch(() => setAssignError("Could not assign students — please try again."))
      .finally(() => setAssignLoading(false));
  };

  const confirmRemove = () => {
    const ids = [...selected];
    if (ids.length === 0 || !activeId) return;
    void removeStudentFromBatch({ batchId: activeId, studentIds: ids }).then((res) => {
      if (res.ok) {
        setSelected(new Set());
        void loadDetail(activeId);
        void fetchOverview();
      }
    });
  };

  const confirmMove = () => {
    const ids = [...selected];
    const target = overview?.batches.find((b) => b.name === moveTarget);
    if (ids.length === 0 || !target) return;
    setMoveLoading(true);
    setMoveError(null);
    assignStudentsToBatch({ batchId: target.id, studentIds: ids })
      .then((res) => {
        if (!res.ok) {
          setMoveError(res.message ?? "Could not move students.");
          return;
        }
        setMoveOpen(false);
        setMoveTarget("");
        setSelected(new Set());
        if (activeId) void loadDetail(activeId);
        void fetchOverview();
      })
      .catch(() => setMoveError("Could not move students — please try again."))
      .finally(() => setMoveLoading(false));
  };

  const openEdit = () => {
    if (!detail) return;
    setEditName(detail.batch.name);
    setEditCourse(detail.batch.course);
    setEditCapacity(detail.batch.capacity);
    setEditStart(detail.batch.startDate);
    setEditEnd(detail.batch.endDate);
    setEditDesc(detail.batch.description);
    setEditError(null);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!activeId) return;
    setEditLoading(true);
    setEditError(null);
    updateBatch(activeId, {
      name: editName.trim(),
      course: editCourse.trim(),
      capacity: editCapacity,
      startDate: editStart,
      endDate: editEnd,
      description: editDesc.trim(),
    })
      .then((res) => {
        if (!res.ok) {
          setEditError(res.message ?? "Could not update the batch.");
          return;
        }
        setEditOpen(false);
        void loadDetail(activeId);
        void fetchOverview();
      })
      .catch(() => setEditError("Could not update the batch — please try again."))
      .finally(() => setEditLoading(false));
  };

  const confirmDelete = () => {
    if (!activeId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    deleteBatch(activeId)
      .then((res) => {
        if (!res.ok) {
          setDeleteError(res.message ?? "Could not delete the batch.");
          return;
        }
        setDeleteOpen(false);
        setActiveId(null);
        setDetail(null);
        setSelected(new Set());
        void fetchOverview();
      })
      .catch(() => setDeleteError("Could not delete the batch — please try again."))
      .finally(() => setDeleteLoading(false));
  };

  const q = search.trim().toLowerCase();
  const filteredBatches = (overview?.batches ?? []).filter(
    (b) => b.name.toLowerCase().includes(q) || b.course.toLowerCase().includes(q),
  );

  const stats = overview?.stats;
  const vacant = stats ? Math.max(0, stats.totalCapacity - stats.totalEnrolled) : 0;
  const overCapacity = stats && stats.totalEnrolled > stats.totalCapacity;

  const courseOptions: ComboboxOption[] = (ctx?.courses ?? []).map((c) => ({
    value: c.name,
    hint: c.studentCount > 0 ? `${c.studentCount} student${c.studentCount === 1 ? "" : "s"}` : "No students yet",
  }));

  const moveBatchOptions: ComboboxOption[] = (overview?.batches ?? [])
    .filter((b) => b.id !== activeId)
    .map((b) => ({ value: b.name, hint: `${b.enrolled}/${b.capacity} students` }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Batch Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cohorts with courses and timelines — students join by batch name, so every test, worksheet and filter stays in sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={refresh} loading={refreshing}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Link href="/admin-dashboard/lms/students/batches/create">
            <Button size="md">
              <Plus size={16} />
              Create Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Batches" value={stats?.total ?? 0} icon={<Users size={16} />} accent="purple" />
        <StatCard label="Active" value={stats?.active ?? 0} icon={<CheckCircle2 size={16} />} accent="emerald" />
        <StatCard label="Enrolled" value={stats?.totalEnrolled ?? 0} icon={<BookOpen size={16} />} accent="blue" />
        <StatCard label="Vacant Seats" value={vacant} icon={<Clock size={16} />} accent="slate" delta={overCapacity ? "Over capacity" : undefined} />
        <div onClick={openAssignFromUnassigned} className="cursor-pointer" title="Open assign students">
          <StatCard label="Unassigned" value={stats?.unassigned ?? 0} icon={<UserPlus size={16} />} accent="amber" className="hover:border-white/20 transition-colors" />
        </div>
        <StatCard label="Orphan Strings" value={stats?.orphan ?? 0} icon={<AlertTriangle size={16} />} accent={stats && stats.orphan > 0 ? "red" : "slate"} />
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: batch list */}
        <div className="w-full lg:w-72 lg:max-w-xs bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col shadow-sm flex-shrink-0">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Users size={18} className="text-slate-400" />
              Batches
            </div>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
              {overview?.batches.length ?? 0}
            </span>
          </div>
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[560px]">
            {filteredBatches.map((b) => (
              <div
                key={b.id}
                onClick={() => selectBatch(b.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  activeId === b.id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${b.status === "active" ? "bg-emerald-400" : b.status === "upcoming" ? "bg-blue-400" : "bg-slate-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{b.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{b.course}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium shrink-0 ml-2 ${b.overfull ? "text-red-400" : "text-slate-400"}`}>
                  {b.enrolled}/{b.capacity}
                </span>
              </div>
            ))}
            {overview && filteredBatches.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No matching batches.</p>
            )}
            {!overview && loading && (
              <div className="flex items-center justify-center py-10 text-slate-500">
                <Loader2 size={18} className="animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[500px]">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-6 shadow-inner">
                <Users size={36} />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Batch Management</h2>
              <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
                Select a batch from the left to see its course, timeline and enrolled students. Create a batch first, then use Assign
                Students to add cohorts — the batch page keeps every student&apos;s batch and course in sync.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/admin-dashboard/lms/students/batches/create"
                  className="px-6 py-2.5 bg-[#5E9A2E] hover:bg-[#4A7E24] text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Create New Batch
                </Link>
                {overview && overview.batches.length > 0 && (
                  <button
                    onClick={() => selectBatch(overview.batches[0].id)}
                    className="px-6 py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-medium rounded-lg transition-colors"
                  >
                    View Batches
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex border-b border-slate-800 p-2 gap-2 overflow-x-auto">
                <button
                  onClick={() => setTab("overview")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === "overview" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Overview
                </button>
                <button
                  onClick={() => setTab("students")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === "students" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Users size={16} />
                  Students
                  <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">
                    {detail?.students.length ?? 0}
                  </span>
                </button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-24 text-slate-400">
                  <Loader2 size={22} className="animate-spin mr-2" /> Loading batch...
                </div>
              ) : detail ? (
                tab === "overview" ? (
                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Users size={22} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <h2 className="text-xl font-bold text-white">{detail.batch.name}</h2>
                            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded border ${statusPill[detail.batch.status]}`}>
                              {statusLabel[detail.batch.status]}
                            </span>
                            {detail.batch.capacity > 0 && detail.students.length > detail.batch.capacity && (
                              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded border bg-red-500/10 text-red-400 border-red-500/20">
                                Overfull
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{detail.batch.course}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="secondary" size="sm" onClick={openEdit}>
                          <Pencil size={14} /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Strength</p>
                        <p className={`text-sm text-white font-semibold mt-1 ${detail.students.length > detail.batch.capacity ? "text-red-400" : ""}`}>
                          {detail.students.length} / {detail.batch.capacity}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Start Date</p>
                        <p className="text-sm text-white font-semibold mt-1">{detail.batch.startDate}</p>
                      </div>
                      <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">End Date</p>
                        <p className="text-sm text-white font-semibold mt-1">{detail.batch.endDate}</p>
                      </div>
                      <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Course</p>
                        <p className="text-sm text-white font-semibold mt-1 truncate" title={detail.batch.course}>
                          {detail.batch.course}
                        </p>
                      </div>
                    </div>

                    {detail.batch.description && (
                      <p className="text-sm text-slate-400 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3">
                        {detail.batch.description}
                      </p>
                    )}

                    {detail.students.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                        <CheckCircle2 size={14} className="shrink-0" />
                        {detail.students.length} student{detail.students.length === 1 ? "" : "s"} enrolled —
                        their tests, worksheets and scorecards already read this batch.
                      </div>
                    )}
                    {detail.students.length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                        <AlertTriangle size={14} className="shrink-0" />
                        No students yet — add from the Unassigned pool, or move someone out of another batch via the Students tab.
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="secondary" size="md" onClick={() => setTab("students")}>
                        <ArrowRight size={15} /> Students
                      </Button>
                      <Button size="md" onClick={openAssign}>
                        <UserPlus size={15} /> Assign Students
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">Enrolled Students</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {detail.students.length} of {detail.batch.capacity} — assigning also syncs each student&apos;s course.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selected.size > 0 && (
                          <>
                            <span className="text-xs text-slate-400">{selected.size} selected</span>
                            <Button variant="secondary" size="sm" onClick={() => setMoveOpen(true)}>
                              <ArrowRight size={14} /> Move to…
                            </Button>
                            <Button variant="danger" size="sm" onClick={confirmRemove}>
                              <X size={14} /> Remove
                            </Button>
                          </>
                        )}
                        <Button size="sm" onClick={openAssign}>
                          <UserPlus size={14} /> Assign Students
                        </Button>
                      </div>
                    </div>

                    {                      detail.students.length === 0 ? (
                      <EmptyState
                        title="No students in this batch"
                        message="Add students from the Unassigned pool, or move someone from another batch. Both actions update the student's batch and course."
                        action={
                          <Button size="md" onClick={openAssign}>
                            <UserPlus size={16} /> Assign / Move Students
                          </Button>
                        }
                      />
                    ) : (
                      <div className="overflow-x-auto border border-white/10 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02] text-left">
                              <th className="px-3 py-2.5 w-8"></th>
                              <th className="px-3 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Student</th>
                              <th className="px-3 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Admission No</th>
                              <th className="hidden md:table-cell px-3 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Roll No</th>
                              <th className="hidden lg:table-cell px-3 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Course</th>
                              <th className="hidden sm:table-cell px-3 py-2.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">Branch</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.students.map((s) => (
                              <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <td className="px-3 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={selected.has(s.id)}
                                    onChange={() => toggleSelected(s.id)}
                                    className="w-4 h-4 rounded accent-emerald-500"
                                  />
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                                      {initials(s.name)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-white truncate">{s.name}</p>
                                      <p className="text-[11px] text-slate-500 truncate">{s.batch}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-slate-300">{s.admissionNo}</td>
                                <td className="hidden md:table-cell px-3 py-2.5 text-slate-400">{s.rollNo}</td>
                                <td className="hidden lg:table-cell px-3 py-2.5 text-slate-400 truncate max-w-[180px]" title={s.course}>
                                  {s.course}
                                </td>
                                <td className="hidden sm:table-cell px-3 py-2.5 text-slate-400">{s.branch}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {(detail.unassigned.length > 0 || detail.others.length > 0) && (
                      <p className="text-xs text-slate-500">
                        <Eye size={12} className="inline mr-1" />
                        {detail.unassigned.length} unassigned student{detail.unassigned.length === 1 ? "" : "s"} can join
                        {detail.others.length > 0 ? ` · ${detail.others.length} in other batches can be moved` : ""}.
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm text-slate-400 py-10 text-center">Batch not found.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign students modal */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        size="xl"
        title={detail ? `Assign Students — ${detail.batch.name}` : "Assign Students"}
        description="Add students with no batch (they keep their course). Students already in another batch are MOVED here — their old batch loses them."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={confirmAssign} loading={assignLoading} disabled={selected.size === 0}>
              <Send size={15} /> Assign {selected.size > 0 ? `(${selected.size})` : ""}
            </Button>
          </>
        }
      >
        {assignError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{assignError}</div>
        )}
        {!detail ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : detail.unassigned.length === 0 && detail.others.length === 0 ? (
          <EmptyState title="No students to add" message="Every student is already in this batch." />
        ) : (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-5">
            {/* Amber warning when any currently-in-other-batch student is selected */}
            {[...selected].some((id) => detail.others.some((o) => o.id === id)) && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Moving selected students out of their current batch — their course also updates to this batch&apos;s course.
              </div>
            )}

            {/* Section 1 — Unassigned */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
                Students without a batch ({detail.unassigned.length})
              </h4>
              {detail.unassigned.length === 0 ? (
                <p className="text-xs text-slate-500 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-4 text-center">
                  No unassigned students left — everyone already belongs to a batch.
                </p>
              ) : (
                <div className="space-y-2">
                  {detail.unassigned.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors ${
                        selected.has(s.id)
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleSelected(s.id)}
                        className="w-4 h-4 rounded accent-emerald-500"
                      />
                      <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{s.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{s.admissionNo}</p>
                      </div>
                      <span className="text-[11px] text-emerald-400 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1">
                        Unassigned
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2 — Students already in another batch (collapsed by default) */}
            {detail.others.length > 0 && (
              <div className="border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOthers((v) => !v)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Currently in another batch ({detail.others.length})
                  </h4>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${showOthers ? "rotate-180" : ""} text-slate-500 group-hover:text-white`}
                  />
                </button>
                {!showOthers && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Expanding this section shows students already in a batch — selecting them is a MOVE, not an assign.
                  </p>
                )}
                {showOthers && (
                  <>
                    <p className="text-[11px] text-slate-500 mt-1 mb-2">
                      These students belong to other batches — selecting them removes them from their current batch and gives them this batch&apos;s course.
                    </p>
                    <div className="space-y-2">
                      {detail.others.map((s) => (
                        <label
                          key={s.id}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors ${
                            selected.has(s.id)
                              ? "border-amber-500/40 bg-amber-500/5"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(s.id)}
                            onChange={() => toggleSelected(s.id)}
                            className="w-4 h-4 rounded accent-amber-500"
                          />
                          <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                            {initials(s.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{s.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{s.admissionNo}</p>
                          </div>
                          <span className="text-[11px] text-amber-400 shrink-0 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
                            In {s.batch}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Move to batch modal */}
      <Modal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        size="md"
        title="Move Selected Students"
        description={`Moving ${selected.size} student(s) to another batch — their course updates to the target batch's course.`}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={confirmMove} loading={moveLoading} disabled={!moveTarget}>
              <ArrowDownToLine size={15} /> Move
            </Button>
          </>
        }
      >
        {moveError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{moveError}</div>
        )}
        <Combobox
          value={moveTarget}
          onChange={setMoveTarget}
          options={moveBatchOptions}
          allowCustom={false}
          placeholder="Select the target batch"
          className={inputCls}
        />
      </Modal>

      {/* Edit batch modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        size="lg"
        title="Edit Batch"
        description="Renaming or changing the course also updates the students currently in this batch."
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button size="md" onClick={saveEdit} loading={editLoading}>
              <Save size={15} /> Save Changes
            </Button>
          </>
        }
      >
        {editError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{editError}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Batch name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Course</label>
            <Combobox value={editCourse} onChange={setEditCourse} options={courseOptions} placeholder="Select or type a course" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Capacity</label>
              <input
                type="number"
                min={1}
                max={10000}
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start date</label>
              <input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End date</label>
              <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className={inputCls} />
          </div>
        </div>
      </Modal>

      {/* Delete batch modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        size="sm"
        title="Delete Batch"
        description={detail ? `Delete "${detail.batch.name}"?` : undefined}
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={confirmDelete} loading={deleteLoading}>
              <Trash2 size={15} /> Delete
            </Button>
          </>
        }
      >
        {deleteError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{deleteError}</div>
        )}
        <p className="text-sm text-slate-400 leading-relaxed">
          {detail && detail.students.length > 0
            ? `This batch still has ${detail.students.length} student(s). Deletion is refused until you move them out — that keeps their records from pointing at a batch that no longer exists.`
            : "This batch has no enrolled students. Deleting it is permanent."}
        </p>
      </Modal>
    </div>
  );
}
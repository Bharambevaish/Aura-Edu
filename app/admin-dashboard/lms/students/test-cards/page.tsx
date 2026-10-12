"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getAdminTestCards,
  getAdminTestCardDetail,
  type TestCardRowDTO,
  type TestCardDetailDTO,
} from "@/lib/actions/tests/admin-tests";
import {
  RefreshCw,
  Filter,
  LayoutGrid,
  List,
  Users,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Eye,
  Loader2,
  FileText,
  Download,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

type CardRow = TestCardRowDTO;

const PAGE_SIZE = 9;

export default function TestCardsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [cards, setCards] = useState<CardRow[]>([]);
  const [stats, setStats] = useState<{ students: number; attempts: number; attempted: number; notAttempted: number; avgPct: number; topPct: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [preview, setPreview] = useState<CardRow | null>(null);
  const [detail, setDetail] = useState<TestCardDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => await getAdminTestCards(), []);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((data) => {
        if (!ignore) {
          setCards(data.cards);
          setStats(data.stats);
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
      setCards(data.cards);
      setStats(data.stats);
    });
  };

  const counts = {
    All: cards.length,
    Strong: cards.filter((c) => c.tier === "strong").length,
    Average: cards.filter((c) => c.tier === "average").length,
    "At Risk": cards.filter((c) => c.tier === "at_risk").length,
    "Not Attempted": cards.filter((c) => c.tier === "none").length,
  };

  const tabs = [
    { id: "All", label: "All", count: counts.All },
    { id: "Strong", label: "Strong (≥75%)", count: counts.Strong },
    { id: "Average", label: "Average (40-75%)", count: counts.Average },
    { id: "At Risk", label: "At Risk (<40%)", count: counts["At Risk"] },
    { id: "Not Attempted", label: "Not Attempted", count: counts["Not Attempted"] },
  ];

  function tierFrom(tab: string): CardRow["tier"] {
    if (tab === "Strong") return "strong";
    if (tab === "Average") return "average";
    if (tab === "At Risk") return "at_risk";
    return "none";
  }

  const batches = [...new Set(cards.map((c) => c.batch).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const q = search.trim().toLowerCase();
  const tierFiltered =
    activeTab === "All" ? cards : cards.filter((c) => (activeTab === "Not Attempted" ? c.tier === "none" : tierFrom(activeTab) === c.tier));
  const batchFiltered = batchFilter === "All" ? tierFiltered : tierFiltered.filter((c) => c.batch === batchFilter);
  const filtered = q
    ? batchFiltered.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    : batchFiltered;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageIndex = Math.min(page, totalPages) - 1;
  const paginated = filtered.length > PAGE_SIZE ? filtered.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE) : filtered;
  const goToPage = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const openCard = (card: CardRow) => {
    setPreview(card);
    setDetail(null);
    setDetailLoading(true);
    getAdminTestCardDetail(card.id)
      .then((d) => setDetail(d))
      .finally(() => setDetailLoading(false));
  };

  const tierStyle: Record<CardRow["tier"], string> = {
    strong: "border-emerald-500/20",
    average: "border-amber-500/20",
    at_risk: "border-red-500/20",
    none: "border-white/10",
  };

  const tierText: Record<CardRow["tier"], string> = {
    strong: "text-emerald-400",
    average: "text-amber-400",
    at_risk: "text-red-400",
    none: "text-slate-500",
  };

  const tierPill: Record<CardRow["tier"], string> = {
    strong: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    average: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    at_risk: "bg-red-500/10 text-red-400 border-red-500/20",
    none: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const tierLabel: Record<CardRow["tier"], string> = {
    strong: "Strong",
    average: "Average",
    at_risk: "At Risk",
    none: "Not Attempted",
  };

  const avatarColors: Record<number, string> = {
    0: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    1: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    2: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    3: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const renderCard = (card: CardRow, index: number) => (
    <div key={card.id} className={`glass-panel border ${tierStyle[card.tier]} rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-colors`}>
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${avatarColors[index % 4]} flex items-center justify-center font-bold text-sm border`}>
              {card.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{card.name}</h3>
              <p className="text-xs text-slate-400">{card.email}</p>
            </div>
          </div>
          {card.avgPct === null ? (
            <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-2 py-1 rounded border border-white/10">No attempts</span>
          ) : (
            <span className={`text-xs font-bold ${tierText[card.tier]}`}>{card.avgPct.toFixed(2)}%</span>
          )}
        </div>

        <div className="space-y-2 mt-4 text-sm">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Admission</span>
            <span className="text-slate-300 font-medium">{card.admissionNo}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Batch</span>
            <span className="text-amber-400 font-medium text-xs">{card.batch}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">Attempts</span>
            <span className="text-slate-300 font-medium">{card.attempts}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-slate-500">Last attempt</span>
            <span className={card.lastAttempt ? "text-slate-300" : "text-slate-500"}>{card.lastAttempt ?? "-"}</span>
          </div>
        </div>
      </div>

      {card.avgPct !== null && card.avgPct !== undefined && (
        <div className="w-full h-1 bg-slate-800/70">
          <div
            className={`h-full ${card.tier === "strong" ? "bg-emerald-500" : card.tier === "average" ? "bg-amber-500" : "bg-red-500"}`}
            style={{ width: `${Math.min(card.avgPct, 100)}%` }}
          ></div>
        </div>
      )}

      <div className="border-t border-white/10 p-3 bg-white/[0.02] flex justify-center">
        <Button
          variant="ghost"
          size="md"
          onClick={() => openCard(card)}
          className="text-blue-400 hover:text-blue-300"
        >
          <Eye size={16} />
          View
        </Button>
      </div>
    </div>
  );

  const renderRow = (card: CardRow, index: number) => (
    <div key={card.id} className={`glass-panel border ${tierStyle[card.tier]} rounded-xl px-4 py-3 flex flex-wrap items-center gap-4`}>
      <div className={`w-9 h-9 rounded-full ${avatarColors[index % 4]} flex items-center justify-center font-bold text-xs border shrink-0`}>
        {card.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
      </div>
      <div className="flex-1 min-w-[160px]">
        <p className="text-sm font-semibold text-white">{card.name}</p>
        <p className="text-xs text-slate-400">{card.email}</p>
      </div>
      <div className="hidden md:block text-xs text-slate-400 w-28">
        <span className="block text-slate-500">Admission</span>
        <span className="text-slate-300">{card.admissionNo}</span>
      </div>
      <div className="hidden lg:block text-xs text-slate-400 w-40">
        <span className="block text-slate-500">Batch</span>
        <span className="text-amber-400">{card.batch}</span>
      </div>
      <div className="hidden lg:block text-xs text-slate-400 w-24">
        <span className="block text-slate-500">Attempts</span>
        <span className="text-slate-300">{card.attempts}</span>
      </div>
      {card.avgPct === null ? (
        <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-2 py-1 rounded border border-white/10">No attempts</span>
      ) : (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${tierPill[card.tier]}`}>
          {tierLabel[card.tier]} · {card.avgPct.toFixed(2)}%
        </span>
      )}
      <Button
        variant="ghost"
        size="md"
        onClick={() => openCard(card)}
        className="text-blue-400 hover:text-blue-300"
      >
        <Eye size={16} />
        View
      </Button>
    </div>
  );

  const hasActiveFilters = q !== "" || batchFilter !== "All";
  const clearFilters = () => {
    setSearch("");
    setBatchFilter("All");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Print-only report card (Download PDF) */}
      {preview && detail && (
        <div id="print-card" className="hidden print:block">
          <PrintCard {...detail} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <FileText size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Test Cards</h1>
            <p className="text-sm text-slate-400 mt-0.5">Batch-wise report cards: open a student to preview the card.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="secondary" size="md" onClick={() => setShowFilters((v) => !v)}>
            <Filter size={14} />
            Filter
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </Button>
          <div className="flex items-center bg-slate-900/50 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded transition-colors ${view === "grid" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded transition-colors ${view === "list" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Students" value={loading ? "—" : (stats?.students ?? 0)} icon={<Users size={16} />} accent="blue" />
        <StatCard label="Attempts" value={loading ? "—" : (stats?.attempts ?? 0)} icon={<Activity size={16} />} accent="purple" />
        <StatCard label="Attempted" value={loading ? "—" : (stats?.attempted ?? 0)} icon={<CheckCircle size={16} />} accent="emerald" />
        <StatCard label="Not Attempted" value={loading ? "—" : (stats?.notAttempted ?? 0)} icon={<Clock size={16} />} accent="slate" />
        <StatCard label="Avg %" value={loading ? "—" : `${(stats?.avgPct ?? 0).toFixed(2)}%`} icon={<TrendingUp size={16} />} accent="amber" />
        <StatCard label="Top %" value={loading ? "—" : `${(stats?.topPct ?? 0).toFixed(2)}%`} icon={<Award size={16} />} accent="red" />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by student name or email..."
                className="w-full pl-9 pr-9 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={batchFilter}
                onChange={(e) => {
                  setBatchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full appearance-none pl-4 pr-10 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white cursor-pointer"
              >
                <option value="All">All Batches ({cards.length} students)</option>
                {batches.map((b) => {
                  const n = cards.filter((c) => c.batch === b).length;
                  return (
                    <option key={b} value={b}>
                      {b} ({n})
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-400">
                <X size={13} /> Clear filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filters/Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-slate-900/50 text-slate-300 border border-white/10 hover:bg-white/5"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? "bg-white/20" : "bg-slate-800"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading student cards...
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={activeTab === "All" && !hasActiveFilters ? "No students found" : "No students match these filters"}
          message="Try a different batch, tier or search term."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((card, index) => renderCard(card, index))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((card, index) => renderRow(card, index))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-between items-center text-sm border-t border-white/10 pt-4">
          <span className="text-slate-400">
            Page {pageIndex + 1} of {totalPages}
            <span className="text-slate-500"> · {filtered.length} student{filtered.length === 1 ? "" : "s"}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(pageIndex)}
              disabled={pageIndex === 0}
              className="px-3 py-1.5 bg-slate-900/50 border border-white/10 text-slate-300 rounded-md font-medium transition-colors hover:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed"
            >
              &lt; Previous
            </button>
            <button
              onClick={() => goToPage(pageIndex + 2)}
              disabled={pageIndex + 1 >= totalPages}
              className="px-3 py-1.5 bg-slate-900/50 border border-white/10 text-slate-300 rounded-md font-medium transition-colors hover:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}

      {/* Preview modal */}
      <Modal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview ? "Student Test Card" : ""}
        description={preview ? `${preview.name} · ${preview.admissionNo}` : ""}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>
            <Button onClick={() => window.print()} disabled={!detail}>
              <Download size={16} /> Download PDF
            </Button>
          </>
        }
      >
        {detailLoading && (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading report card...
          </div>
        )}
        {!detailLoading && detail && <CardDetail detail={detail} />}
      </Modal>
    </div>
  );
}

/* ---- report card detail (screen + reused for print) ------------------------ */

function DetailMetric({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "cyan" | "amber" | "purple" | "red" }) {
  const tones: Record<string, string> = {
    emerald: "text-emerald-400",
    cyan: "text-cyan-400",
    amber: "text-amber-400",
    purple: "text-purple-400",
    red: "text-red-400",
  };
  return (
    <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10">
      <span className="text-xs text-slate-400">{label}</span>
      <p className={`text-2xl font-black font-mono mt-1 ${tone ? tones[tone] : "text-white"}`}>{value}</p>
    </div>
  );
}

function CardDetail({ detail }: { detail: TestCardDetailDTO }) {
  const { student, summary, rows } = detail;
  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
          {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{student.name}</p>
          <p className="text-xs text-slate-400 truncate">
            {student.rollNo !== "-" && <>Roll {student.rollNo} · </>}
            {student.batch}
            {student.course && <> · {student.course}</>}
          </p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Grade</span>
          <p className={`text-lg font-black font-mono ${summary.completed ? "text-emerald-400" : "text-slate-500"}`}>
            {summary.completed ? summary.grade : "—"}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailMetric label="Average" value={summary.completed ? `${summary.avgPct}%` : "—"} tone="emerald" />
        <DetailMetric label="Best Score" value={summary.completed ? `${summary.bestPct}%` : "—"} tone="cyan" />
        <DetailMetric label="Best Rank" value={summary.completed ? `#${summary.bestRank}` : "—"} tone="amber" />
        <DetailMetric label="Pass Rate" value={summary.completed ? `${summary.passRate}%` : "—"} tone="purple" />
      </div>

      {summary.completed > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-400">
          <span>
            Percentile <span className="text-cyan-400 font-semibold">{summary.percentile}%</span>
          </span>
          <span>
            Tests completed <span className="text-white font-semibold">{summary.completed}</span>
          </span>
          {summary.pendingWritten > 0 ? (
            <span className="text-amber-400">
              {summary.pendingWritten} result{summary.pendingWritten === 1 ? "" : "s"} awaiting written grading
            </span>
          ) : (
            <span className="text-emerald-400">All results fully graded</span>
          )}
        </div>
      )}

      {/* Transcript table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-white/[0.03] text-xs font-semibold text-slate-300 border-b border-white/10">
          Test History ({rows.length})
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-500">No attempted tests yet — student has no results on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 font-mono uppercase border-b border-white/10">
                <tr>
                  <th className="p-3 pl-4">Test</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {rows.map((r) => (
                  <tr key={r.testId} className="hover:bg-white/[0.02]">
                    <td className="p-3 pl-4">
                      <span className="font-semibold text-white">{r.title}</span>
                      {r.subject && <span className="block text-[10px] text-slate-500">{r.subject}</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{r.date}</td>
                    <td className="p-3">
                      <span className={`font-bold font-mono ${r.passed ? "text-emerald-400" : "text-red-400"}`}>{r.marks}</span>
                      <span className="text-slate-500"> / {r.totalMarks}</span>
                      <span className="block text-[10px] text-slate-500">{r.pct}%</span>
                    </td>
                    <td className="p-3 font-bold font-mono text-cyan-400">
                      #{r.rank}<span className="text-slate-500 font-normal"> / {r.totalStudents}</span>
                    </td>
                    <td className="p-3">
                      {!r.fullyGraded && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mr-1">
                          Grading
                        </span>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {r.passed ? "PASSED" : "AT RISK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- printable report card (light, document-style) ------------------------- */

function PrintCard({ student, summary, rows }: TestCardDetailDTO) {
  return (
    <div style={{ padding: 32, fontFamily: "system-ui, Arial, sans-serif", color: "#0f172a", background: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0f172a", paddingBottom: 16 }}>
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: 4, color: "#334155", fontWeight: 700 }}>OFFICIAL ACADEMIC TRANSCRIPT · AURAEDU</p>
          <h1 style={{ margin: "6px 0 2px", fontSize: 22, fontWeight: 800 }}>{student.name}</h1>
          <p style={{ margin: 0, fontSize: 11, color: "#475569" }}>Admission {student.admissionNo}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 10, color: "#475569" }}>CUMULATIVE GRADE</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#16a34a" }}>{summary.completed ? summary.grade : "—"}</p>
        </div>
      </div>
      <p style={{ margin: "10px 0 18px", fontSize: 11, color: "#475569" }}>
        {student.rollNo !== "-" && <>Roll: {student.rollNo} &nbsp;·&nbsp; </>}
        Batch: {student.batch}
        {student.course && <> &nbsp;·&nbsp; Course: {student.course}</>}
        &nbsp;·&nbsp; Email: {student.email}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <tbody>
          <tr>
            {[
              { label: "Average Score", value: summary.completed ? `${summary.avgPct}%` : "—" },
              { label: "Best Score", value: summary.completed ? `${summary.bestPct}%` : "—" },
              { label: "Best Rank", value: summary.completed ? `#${summary.bestRank}` : "—" },
              { label: "Pass Rate", value: summary.completed ? `${summary.passRate}%` : "—" },
            ].map((m) => (
              <td key={m.label} style={{ border: "1px solid #cbd5e1", padding: 10, width: "25%" }}>
                <span style={{ fontSize: 9, color: "#64748b" }}>{m.label}</span>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{m.value}</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 20 }}>
        <thead>
          <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Test</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Date</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Marks Obtained</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Total</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Batch Rank</th>
            <th style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={6} style={{ border: "1px solid #cbd5e1", padding: 12, textAlign: "center", color: "#64748b" }}>No attempted tests on record.</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.testId}>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontWeight: 700 }}>{r.title}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>{r.date}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontWeight: 700, color: "#16a34a" }}>{r.marks}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px" }}>{r.totalMarks}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontWeight: 700 }}>#{r.rank} / {r.totalStudents}</td>
                <td style={{ border: "1px solid #cbd5e1", padding: "8px 10px", fontWeight: 700, color: r.passed ? "#16a34a" : "#dc2626" }}>
                  {r.passed ? "PASSED" : "AT RISK"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p style={{ marginTop: 24, fontSize: 9, color: "#94a3b8", textAlign: "center" }}>
        Generated by AuraEdu Admin · Printed {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}
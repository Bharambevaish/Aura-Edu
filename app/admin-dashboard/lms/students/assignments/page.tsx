"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAssignmentsOverview,
  getAssignmentDetail,
  reviewSubmission,
  type AssignmentsOverview,
  type AdminAssignmentRow,
} from "@/lib/actions/assignments";
import {
  Plus,
  RefreshCw,
  Calendar,
  FileText,
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Users,
  Eye,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

type Detail = NonNullable<Awaited<ReturnType<typeof getAssignmentDetail>>>;

const statusPill: Record<AdminAssignmentRow["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  due_soon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  overdue: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusLabel: Record<AdminAssignmentRow["status"], string> = {
  active: "Active",
  due_soon: "Due Soon",
  overdue: "Overdue",
};

export default function AssignmentManagementPage() {
  const [overview, setOverview] = useState<AssignmentsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [marksInput, setMarksInput] = useState("");
  const [verdictInput, setVerdictInput] = useState<"complete" | "needs_work">("complete");
  const [noteInput, setNoteInput] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchOverview = async () => {
    const data = await getAssignmentsOverview();
    setOverview(data);
  };

  useEffect(() => {
    let ignore = false;
    getAssignmentsOverview()
      .then((data) => {
        if (!ignore) setOverview(data);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const refresh = () => {
    setRefreshing(true);
    void fetchOverview().finally(() => setRefreshing(false));
  };

  const openDetail = (id: string) => {
    setActiveId(id);
    setReviewingId(null);
    setDetail(null);
    setDetailLoading(true);
    getAssignmentDetail(id)
      .then(setDetail)
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => {
    setActiveId(null);
    setReviewingId(null);
    setDetail(null);
  };

  const startReview = (submissionId: string) => {
    const sub = detail?.submissions.find((s) => s.id === submissionId);
    setReviewingId(submissionId);
    setMarksInput(sub?.marks != null ? String(sub.marks) : "");
    setVerdictInput("complete");
    setNoteInput("");
    setReviewError(null);
  };

  const saveReview = (submissionId: string) => {
    const marks = Number(marksInput);
    if (Number.isNaN(marks) || marks < 0) {
      setReviewError("Enter valid marks.");
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    reviewSubmission(submissionId, {
      marks,
      verdict: verdictInput,
      note: noteInput.trim() || undefined,
    })
      .then((res) => {
        if (!res.ok) {
          setReviewError(res.message);
          return;
        }
        setReviewingId(null);
        if (activeId) void getAssignmentDetail(activeId).then(setDetail);
        void fetchOverview();
      })
      .finally(() => setReviewLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assignment Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Online worksheet + reminder notifications across the full submission lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={refresh} loading={refreshing}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Link href="/admin-dashboard/lms/students/assignments/create">
            <Button size="md">
              <Plus size={16} />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <StatCard label="Total" value={overview?.stats.total ?? 0} icon={<ClipboardList size={16} />} accent="slate" />
        <StatCard label="Active" value={overview?.stats.active ?? 0} icon={<CheckCircle2 size={16} />} accent="emerald" />
        <StatCard label="Due Soon" value={overview?.stats.dueSoon ?? 0} icon={<Clock size={16} />} accent="amber" />
        <StatCard label="Overdue" value={overview?.stats.overdue ?? 0} icon={<AlertCircle size={16} />} accent="red" />
        <StatCard label="Submitted" value={overview?.stats.submitted ?? 0} icon={<Send size={16} />} accent="blue" />
        <StatCard label="Pending Review" value={overview?.stats.pendingReview ?? 0} icon={<Hourglass size={16} />} accent="purple" />
        <StatCard label="Reviewed" value={overview?.stats.reviewed ?? 0} icon={<CheckCircle2 size={16} />} accent="emerald" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={22} className="animate-spin mr-2" /> Loading assignments...
        </div>
      ) : overview && overview.assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          message="Create your first worksheet — a reminder notification is sent to every student in the batch."
          action={
            <Link href="/admin-dashboard/lms/students/assignments/create">
              <Button size="md">
                <Plus size={16} /> Create Assignment
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.assignments.map((a) => (
            <div
              key={a.id}
              className="glass-panel border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-colors"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="font-semibold text-white text-sm leading-snug">{a.title}</h3>
                  <span className={`shrink-0 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded border ${statusPill[a.status]}`}>
                    {statusLabel[a.status]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] mb-4">
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-300 border border-white/10">{a.subject}</span>
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-amber-400 border border-white/10">{a.batch}</span>
                  <span className="px-2 py-1 rounded bg-slate-800/80 text-slate-400 border border-white/10">
                    {a.course}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Questions</span>
                    <span className="text-slate-300 font-medium">{a.questionsCount}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Total marks</span>
                    <span className="text-slate-300 font-medium">{a.totalMarks}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-500">Due</span>
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" /> {a.dueDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submissions</span>
                    <span className="text-slate-300 font-medium">{a.submitted}</span>
                  </div>
                </div>

                {a.pendingReview > 0 && (
                  <p className="mt-3 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                    <Hourglass size={13} /> {a.pendingReview} pending review, {a.reviewed} reviewed
                  </p>
                )}
              </div>

              <div className="border-t border-white/10 p-3 bg-white/[0.02] flex justify-center">
                <Button variant="ghost" size="md" className="text-blue-400 hover:text-blue-300" onClick={() => openDetail(a.id)}>
                  <Eye size={16} />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / Grading modal */}
      <Modal
        open={activeId !== null}
        onClose={closeDetail}
        size="xl"
        title={detail?.assignment.title ?? "Assignment"}
        description={detail ? `${detail.assignment.batch} · ${detail.assignment.course}` : undefined}
        footer={
          <Button variant="secondary" size="md" onClick={closeDetail}>
            Close
          </Button>
        }
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 size={22} className="animate-spin mr-2" /> Loading worksheet...
          </div>
        ) : detail ? (
          <div className="space-y-6">
            {/* Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Subject</p>
                <p className="text-sm text-white font-semibold mt-1">{detail.assignment.subject}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Status</p>
                <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded border ${statusPill[detail.assignment.status]}`}>
                  {statusLabel[detail.assignment.status]}
                </span>
              </div>
              <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Due</p>
                <p className="text-sm text-white font-semibold mt-1">{detail.assignment.dueDate}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total marks</p>
                <p className="text-sm text-white font-semibold mt-1">{detail.assignment.totalMarks}</p>
              </div>
            </div>

            {detail.assignment.description && (
              <p className="text-sm text-slate-400 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3">
                {detail.assignment.description}
              </p>
            )}

            {/* Questions */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={15} className="text-emerald-400" /> Questions ({detail.assignment.questions.length})
              </h4>
              <div className="space-y-2">
                {detail.assignment.questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-200 flex-1">{q.text}</p>
                    <span className="shrink-0 text-[11px] text-slate-400 bg-slate-800/80 border border-white/10 rounded px-2 py-1">
                      {q.marks} marks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submissions */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users size={15} className="text-emerald-400" /> Submissions ({detail.submissions.length})
              </h4>
              <div className="space-y-3">
                {detail.submissions.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">
                          {s.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{s.studentName}</p>
                          <p className="text-[11px] text-slate-500">Submitted {s.submittedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.status === "reviewed" ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> Reviewed · {s.marks}/{detail.assignment.totalMarks}
                          </span>
                        ) : (
                          <>
                            <span className="text-xs font-bold px-2.5 py-1 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1.5">
                              <Hourglass size={13} /> Pending Review
                            </span>
                            {reviewingId !== s.id && (
                              <Button variant="outline" size="sm" onClick={() => startReview(s.id)}>
                                Grade
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {s.status === "reviewed" && (
                      <div className="mt-2 pl-11">
                        <span className={`text-xs font-bold ${s.verdict === "needs_work" ? "text-amber-400" : "text-emerald-400"}`}>
                          {s.verdict === "complete" ? "Complete" : "Needs Work"}
                        </span>
                        {s.note && <p className="text-xs text-slate-400 mt-1 italic">&quot;{s.note}&quot;</p>}
                      </div>
                    )}

                    {reviewingId === s.id && (
                      <div className="mt-3 pl-0 md:pl-11 space-y-3 border-t border-white/5 pt-3">
                        <div className="flex flex-wrap gap-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Marks (out of {detail.assignment.totalMarks})</label>
                            <input
                              type="number"
                              min={0}
                              max={detail.assignment.totalMarks}
                              value={marksInput}
                              onChange={(e) => setMarksInput(e.target.value)}
                              className="w-28 px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Verdict</label>
                            <div className="flex gap-2">
                              {(["complete", "needs_work"] as const).map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setVerdictInput(v)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                    verdictInput === v
                                      ? v === "complete"
                                        ? "bg-emerald-600 text-white border-emerald-500"
                                        : "bg-amber-600 text-white border-amber-500"
                                      : "bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700"
                                  }`}
                                >
                                  {v === "complete" ? "Complete" : "Needs Work"}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Short note (optional)</label>
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            rows={2}
                            placeholder="One-line feedback for the student..."
                            className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500"
                          />
                        </div>
                        {reviewError && (
                          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{reviewError}</p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveReview(s.id)} loading={reviewLoading}>
                            <Send size={14} /> Save review
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setReviewingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {detail.submissions.length === 0 && (
                  <p className="text-sm text-slate-500 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-6 text-center">
                    No submissions yet.
                  </p>
                )}
              </div>
            </div>

            {/* Not submitted */}
            {detail.notSubmitted.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Not submitted ({detail.notSubmitted.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detail.notSubmitted.map((ns) => (
                    <span key={ns.id} className="text-xs text-slate-400 bg-slate-900/50 border border-white/10 rounded-lg px-2.5 py-1.5">
                      {ns.studentName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-10 text-center">Worksheet not found.</p>
        )}
      </Modal>
    </div>
  );
}
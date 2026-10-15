"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getAdminAttempts, getAdminTests, type AttemptRowDTO } from "@/lib/actions/tests/admin-tests";
import { getGradingAccess } from "@/lib/actions/tests/grading";
import { GRADING_LOCKED_MESSAGE } from "@/lib/permissions";
import { ArrowLeft, Loader2, CheckCircle2, Clock3, Lock, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function TestReportPage() {
  const params = useParams<{ testId: string }>();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptRowDTO[]>([]);
  const [meta, setMeta] = useState<{ title: string; batch: string; status: string; passRate: number } | null>(null);
  const [canGrade, setCanGrade] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [data, all, access] = await Promise.all([
      getAdminAttempts(params.testId),
      getAdminTests(),
      getGradingAccess(),
    ]);
    const test = all.tests.find((t) => t.id === params.testId);
    return {
      attempts: data,
      canGrade: access,
      meta: test
        ? { title: test.title, batch: test.batch, status: test.status, passRate: test.passRate }
        : null,
    };
  }, [params.testId]);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((res) => {
        if (!ignore) {
          setAttempts(res.attempts);
          setCanGrade(res.canGrade);
          if (res.meta) setMeta(res.meta);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const statusBadge = (status: string) => {
    if (status === "completed")
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    if (status === "active")
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/admin-dashboard/lms/students/tests"
            className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Test Management
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList size={20} className="text-emerald-400" />
            {meta?.title ?? "Test Report"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {meta?.batch ?? ""} · {loading ? "Loading..." : `${attempts.length} submitted attempt(s)`}
          </p>
        </div>
        {meta && (
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge(meta.status)}`}>
              {meta.status === "completed" ? "COMPLETED" : meta.status === "active" ? "ACTIVE" : "UPCOMING"}
            </span>
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
              {meta.passRate}% pass rate
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm gap-2">
          <Loader2 size={18} className="animate-spin" /> Loading attempts...
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          message="No submissions yet for this test."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-xs border-b border-white/10">
              <tr>
                <th className="px-4 py-4 font-semibold">Student</th>
                <th className="px-4 py-4 font-semibold">Score</th>
                <th className="px-4 py-4 font-semibold">Submitted</th>
                <th className="px-4 py-4 font-semibold">Written Pending</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-4 font-semibold text-white">{a.studentName}</td>
                  <td className="px-4 py-4 font-mono font-bold text-white">
                    {a.score} <span className="text-slate-400 font-normal">/ {a.totalMarks}</span>
                  </td>
                  <td className="px-4 py-4">{a.submittedAt}</td>
                  <td className="px-4 py-4">
                    {a.pendingWritten > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                        <Clock3 size={12} /> {a.pendingWritten}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Graded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      a.pendingWritten > 0
                        ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {a.pendingWritten > 0 ? "GRADE PENDING" : "COMPLETE"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      size="md"
                      variant={a.pendingWritten > 0 && !canGrade ? "secondary" : undefined}
                      title={a.pendingWritten > 0 && !canGrade ? GRADING_LOCKED_MESSAGE : undefined}
                      onClick={() => router.push(`/admin-dashboard/lms/students/tests/attempts/${a.id}`)}
                    >
                      {a.pendingWritten > 0 && canGrade ? (
                        "Grade Written"
                      ) : a.pendingWritten > 0 ? (
                        <>
                          <Lock size={13} /> View (admins grade)
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
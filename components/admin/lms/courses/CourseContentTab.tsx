"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Search, BookOpen, Layers, FileText, Pencil, Trash2, Loader2 } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCourseContentList, deleteCourse } from "@/lib/actions/courses";
import type { CourseContentOverview, CourseContentRow } from "@/lib/actions/courses";

/**
 * "Course Content" tab of the combined Courses page — the curriculum editor.
 * Reads/writes the same Course collection as CourseCenterTab.
 */
export function CourseContentTab() {
  const [overview, setOverview] = useState<CourseContentOverview | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const load = useCallback(async () => {
    const data = await getCourseContentList();
    setOverview(data);
  }, []);

  useEffect(() => {
    let ignore = false;
    getCourseContentList()
      .then((data) => {
        if (!ignore) setOverview(data);
      })
      .catch(() => toast("Failed to load courses.", "error"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [toast]);

  const q = search.trim().toLowerCase();
  const rows = (overview?.courses ?? []).filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );

  const onDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const r = await deleteCourse(deleteId);
      if (r.ok) {
        toast(r.message ?? "Course deleted.");
        setDeleteId(null);
        setDeleteName("");
        await load();
      } else {
        toast(r.message ?? "Could not delete.", "error");
      }
    } catch {
      toast("Could not delete course.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openDelete = (c: CourseContentRow) => {
    setDeleteId(c.id);
    setDeleteName(c.title);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Course Content Studio</h2>
          <p className="text-sm text-slate-400 mt-1">Create & manage courses, modules and lessons.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin-dashboard/lms/courses/create"
            className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-sm gap-2 bg-[#5E9A2E] text-white hover:bg-[#4A7E24] shadow-sm shadow-black/20"
          >
            <Plus size={16} /> Create Course
          </Link>
          <Button variant="secondary" onClick={() => { setLoading(true); load(); }} loading={loading}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Courses"
          value={overview?.stats.total ?? 0}
          icon={<BookOpen size={16} />}
          accent="blue"
        />
        <StatCard
          label="Published"
          value={overview?.stats.published ?? 0}
          icon={<BookOpen size={16} />}
          accent="emerald"
        />
        <StatCard
          label="Modules"
          value={overview?.stats.modules ?? 0}
          icon={<Layers size={16} />}
          accent="purple"
        />
        <StatCard
          label="Lessons"
          value={overview?.stats.lessons ?? 0}
          icon={<FileText size={16} />}
          accent="amber"
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-[#5E9A2E] placeholder-slate-500"
          />
        </div>
        <span className="text-xs text-slate-500">{rows.length} courses</span>
      </div>

      {/* Grid */}
      {loading && !overview ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="text-slate-500 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="No courses found"
          message="Create your first course to start building curriculum."
          action={
            <Link
              href="/admin-dashboard/lms/courses/create"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors px-4 py-2 text-sm gap-2 bg-[#5E9A2E] text-white hover:bg-[#4A7E24] shadow-sm shadow-black/20"
            >
              <Plus size={16} /> Create Course
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rows.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/admin-dashboard/lms/courses/${c.id}`)}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-600 hover:ring-1 hover:ring-[#5E9A2E]/40 transition-all cursor-pointer"
            >
              <div className="h-32 relative overflow-hidden bg-slate-800 flex items-center justify-center">
                {c.thumbnail ? (
                  <Image
                    src={c.thumbnail}
                    alt={c.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-600">{c.code.slice(0, 4)}</span>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold rounded capitalize">
                  {c.published ? "active" : "draft"}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">{c.title}</h3>
                <p className="text-xs text-slate-500 font-mono mb-4">{c.code}</p>
                <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-auto">
                  <span className="flex items-center gap-1"><Layers size={12} /> {c.modules} modules</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {c.lessons} lessons</span>
                  <span className="flex items-center gap-1"><BookOpen size={12} /> {c.enrolled} enrolled</span>
                </div>
              </div>
              <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2 bg-slate-900/50">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/admin-dashboard/lms/courses/${c.id}`); }}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-colors"
                  title="View course"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); openDelete(c); }}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      <Modal
        open={!!deleteId}
        onClose={() => { if (!deleting) { setDeleteId(null); setDeleteName(""); } }}
        title="Delete Course"
        description={`Permanently delete "${deleteName}"? This cannot be undone.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => { setDeleteId(null); setDeleteName(""); }} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={onDelete} loading={deleting}>
              <Trash2 size={14} /> Delete
            </Button>
          </>
        }
        size="sm"
      >
        <p className="text-sm text-slate-400">
          Students enrolled in this course will lose access. Make sure the course is unpublished first.
        </p>
      </Modal>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  RefreshCw,
  Search,
  BookOpen,
  IndianRupee,
  Eye,
  Loader2,
  Star,
  Users,
  BadgeCheck,
  Tag,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getCourseCatalog,
  getCourseStudents,
  updateCourseStoreSettings,
} from "@/lib/actions/courses";
import type {
  CourseCatalog,
  CourseCatalogRow,
  CourseStudentDTO,
} from "@/lib/actions/courses";

const input =
  "w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-[#5E9A2E] focus:ring-1 focus:ring-[#5E9A2E] placeholder-slate-500 text-sm";

/**
 * "Course Center" tab of the combined Courses page — the storefront manager.
 * Reads/writes the same Course collection as CourseContentTab.
 */
export function CourseCenterTab() {
  const [catalog, setCatalog] = useState<CourseCatalog | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Store-settings modal
  const [editRow, setEditRow] = useState<CourseCatalogRow | null>(null);
  const [spublished, setSPublished] = useState(false);
  const [sIsPaid, setSIsPaid] = useState(true);
  const [sPrice, setSPrice] = useState(0);
  const [sOriginalPrice, setSOriginalPrice] = useState(0);
  const [sBadge, setSBadge] = useState("");
  const [saving, setSaving] = useState(false);

  // Students modal
  const [studentsCourseId, setStudentsCourseId] = useState<string | null>(null);
  const [studentsCourseName, setStudentsCourseName] = useState("");
  const [students, setStudents] = useState<CourseStudentDTO[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const load = useCallback(async () => {
    const data = await getCourseCatalog();
    setCatalog(data);
  }, []);

  useEffect(() => {
    let ignore = false;
    getCourseCatalog()
      .then((data) => {
        if (!ignore) setCatalog(data);
      })
      .catch(() => toast("Failed to load course catalog.", "error"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [toast]);

  const q = search.trim().toLowerCase();
  const rows = (catalog?.courses ?? []).filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q),
  );

  /* ---------------- store settings modal ---------------- */

  const openEdit = (r: CourseCatalogRow) => {
    setEditRow(r);
    setSPublished(r.published);
    setSIsPaid(r.isPaid);
    setSPrice(r.price);
    setSOriginalPrice(r.originalPrice);
    setSBadge(r.badge);
  };

  const onSave = async () => {
    if (!editRow) return;
    setSaving(true);
    try {
      const r = await updateCourseStoreSettings(editRow.id, {
        published: spublished,
        isPaid: sIsPaid,
        price: sPrice,
        originalPrice: sOriginalPrice,
        badge: sBadge,
      });
      if (r.ok) {
        toast(r.message ?? "Store settings saved.");
        setEditRow(null);
        await load();
      } else toast(r.message ?? "Could not save.", "error");
    } catch {
      toast("Could not save store settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- students modal ---------------- */

  const openStudents = async (r: CourseCatalogRow) => {
    setStudentsCourseId(r.id);
    setStudentsCourseName(r.title);
    setLoadingStudents(true);
    setStudents([]);
    try {
      setStudents(await getCourseStudents(r.id));
    } catch {
      toast("Could not load students.", "error");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fmtINR = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Course Store Manager</h2>
          <p className="text-sm text-slate-400 mt-1">Manage price, publishing and storefront settings for every course.</p>
        </div>
        <Button variant="secondary" onClick={() => { setLoading(true); load(); }} loading={loading}>
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Courses"
          value={catalog?.stats.total ?? 0}
          icon={<BookOpen size={16} />}
          accent="blue"
        />
        <StatCard
          label="Published"
          value={catalog?.stats.published ?? 0}
          icon={<Eye size={16} />}
          accent="emerald"
        />
        <StatCard
          label="Paid Courses"
          value={catalog?.stats.paid ?? 0}
          icon={<Tag size={16} />}
          accent="purple"
        />
        <StatCard
          label="Configured Value"
          value={fmtINR(catalog?.stats.configuredValue ?? 0)}
          icon={<IndianRupee size={16} />}
          accent="amber"
          delta="Sum of enrolled × price across all paid courses"
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
      {loading && !catalog ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="text-slate-500 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title="No courses found"
          message="Create courses from the Course Content tab."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-colors"
            >
              {/* Thumbnail */}
              <div className="h-32 relative overflow-hidden bg-slate-800 flex items-center justify-center">
                {c.thumbnail ? (
                  <Image src={c.thumbnail} alt={c.title} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-2xl font-bold text-slate-600">{c.code.slice(0, 4)}</span>
                )}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 backdrop-blur-sm text-[10px] font-bold rounded text-white capitalize">
                  {c.published ? "Published" : "Draft"}
                </span>
                {c.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#5E9A2E]/80 backdrop-blur-sm text-[10px] font-bold rounded text-white">
                    {c.badge}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{c.code}</p>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${c.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/15 text-slate-400"}`}>
                    <BadgeCheck size={10} /> {c.published ? "Published" : "Draft"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold ${c.isPaid ? "bg-blue-500/15 text-blue-300" : "bg-slate-500/15 text-slate-400"}`}>
                    <Tag size={10} /> {c.isPaid ? "Paid" : "Free"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Price</p>
                    <p className="text-white font-bold mt-0.5">
                      {c.isPaid ? `₹${c.price.toLocaleString("en-IN")}` : <span className="text-slate-500">Free</span>}
                    </p>
                    {c.isPaid && c.originalPrice > c.price && (
                      <p className="text-slate-500 text-[10px] line-through">₹{c.originalPrice.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Revenue</p>
                    <p className="text-white font-bold mt-0.5">{fmtINR(c.revenue)}</p>
                    <p className="text-slate-500 text-[10px]">{c.enrolled} enrolled</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Star size={11} className="text-amber-400" />
                  {c.rating} · {c.reviewsCount} reviews · {c.modules} modules · {c.lessons} lessons
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-800 px-4 py-3 flex justify-between items-center bg-slate-900/50">
                <Button size="sm" variant="ghost" onClick={() => openStudents(c)}>
                  <Users size={14} /> View Students
                </Button>
                <Button size="sm" onClick={() => openEdit(c)}>
                  Edit Store Settings
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store settings modal */}
      <Modal
        open={!!editRow}
        onClose={() => { if (!saving) setEditRow(null); }}
        title="Edit Store Settings"
        description={editRow?.title}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditRow(null)} disabled={saving}>Cancel</Button>
            <Button onClick={onSave} loading={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={spublished}
                onChange={(e) => setSPublished(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-[#5E9A2E] focus:ring-[#5E9A2E]"
              />
              <span className="text-sm text-slate-300">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sIsPaid}
                onChange={(e) => setSIsPaid(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-[#5E9A2E] focus:ring-[#5E9A2E]"
              />
              <span className="text-sm text-slate-300">Paid Course</span>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Price (₹)</label>
              <input type="number" min={0} value={sPrice} onChange={(e) => setSPrice(Number(e.target.value))} className={input} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Original Price (₹)</label>
              <input type="number" min={0} value={sOriginalPrice} onChange={(e) => setSOriginalPrice(Number(e.target.value))} className={input} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Storefront Badge</label>
            <input value={sBadge} onChange={(e) => setSBadge(e.target.value)} className={input} placeholder="e.g. BESTSELLER or FLASH OFFER ₹1" />
          </div>
        </div>
      </Modal>

      {/* View students modal */}
      <Modal
        open={!!studentsCourseId}
        onClose={() => { setStudentsCourseId(null); setStudents([]); }}
        title="Enrolled Students"
        description={studentsCourseName}
        size="md"
      >
        {loadingStudents ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-slate-500 animate-spin" />
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No students enrolled in this course.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {students.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div>
                  <p className="text-sm text-white font-medium">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.admissionNo} · {s.batch}</p>
                </div>
                <span className="text-[10px] text-slate-500">{s.course}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
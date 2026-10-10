"use client";

import React, { useState } from "react";
import { BookOpen, LayoutDashboard } from "lucide-react";
import { CourseContentTab } from "@/components/admin/lms/courses/CourseContentTab";
import { CourseCenterTab } from "@/components/admin/lms/courses/CourseCenterTab";

type Tab = "content" | "center";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "content", label: "Course Content", icon: <BookOpen size={15} /> },
  { key: "center", label: "Course Center", icon: <LayoutDashboard size={15} /> },
];

/**
 * Single "Courses" sidebar entry — curriculum editing (Content) and the
 * storefront manager (Center) live as tabs on one page, both backed by the
 * same live Course collection.
 */
export default function CoursesPage() {
  const [tab, setTab] = useState<Tab>("content");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Courses</h1>
        <p className="text-sm text-slate-400 mt-1">
          Build curriculum and manage your course storefront from one place.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 glass-panel border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[#5E9A2E] text-white shadow-sm shadow-black/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "content" ? <CourseContentTab /> : <CourseCenterTab />}
    </div>
  );
}
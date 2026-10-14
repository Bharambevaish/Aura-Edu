"use client";

/** Reports Hub — every link opens a live report (lib/actions/reports.ts). */
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PieChart, IndianRupee, TrendingUp, TrendingDown, Users, Activity, ChevronRight } from "lucide-react";
import { REPORT_CATEGORIES } from "@/lib/reports";
import { useIsAdmin } from "@/components/admin/shell/AdminUserContext";

const ICONS: Record<string, React.ElementType> = {
  Revenue: IndianRupee,
  Receivables: TrendingUp,
  "Expenses & Payroll": TrendingDown,
  "Students & Courses": Users,
  Leads: Activity,
};
const TONE: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10",
  blue: "text-blue-400 bg-blue-500/10",
  red: "text-red-400 bg-red-500/10",
  purple: "text-purple-400 bg-purple-500/10",
  orange: "text-orange-400 bg-orange-500/10",
};

export default function ReportsHubPage() {
  const isAdmin = useIsAdmin();
  const categories = REPORT_CATEGORIES.map((c) => ({ ...c, reports: c.reports.filter((r) => isAdmin || !r.adminOnly) })).filter((c) => c.reports.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <PieChart className="text-emerald-400" /> Reports Hub
        </h1>
        <p className="text-sm text-slate-400 mt-1">Live reports across fees, expenses, academics and admissions — each exports to CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => {
          const Icon = ICONS[cat.title] ?? PieChart;
          return (
            <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-panel rounded-2xl p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 ${TONE[cat.tone]}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{cat.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{cat.description}</p>
                </div>
              </div>
              <div className="space-y-1 mt-auto">
                {cat.reports.map((r) => (
                  <Link key={r.key} href={`/admin-dashboard/reports/${r.key}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white group/link">
                    {r.title}
                    <ChevronRight size={14} className="text-slate-500 group-hover/link:text-emerald-400" />
                  </Link>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

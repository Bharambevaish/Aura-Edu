"use client";

/**
 * Admin/staff dashboard home — live numbers from `getAdminOverview()`.
 * Every tile links to the screen that owns the number.
 */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  IndianRupee,
  RefreshCw,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ClipboardList,
  Wallet,
  GraduationCap,
} from 'lucide-react';
import { getAdminOverview, type AdminOverview, type ActivityItem } from '@/lib/actions/dashboard';
import { useIsAdmin } from '@/components/admin/shell/AdminUserContext';
import { BranchChip } from '@/components/admin/shell/BranchContext';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

const ACTIVITY_STYLE: Record<ActivityItem['kind'], { icon: React.ElementType; color: string; bg: string }> = {
  lead: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  payment: { icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  student: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  submission: { icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
};

export default function AdminDashboardPage() {
  const isAdmin = useIsAdmin();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);
  const [range, setRange] = useState<'week' | 'months'>('months');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    getAdminOverview()
      .then((d) => {
        if (!ignore) {
          setData(d);
          setError(false);
        }
      })
      .catch(() => {
        if (!ignore) setError(true);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const collectedDelta =
    data && data.collections.lastMonth > 0
      ? Math.round(((data.collections.thisMonth - data.collections.lastMonth) / data.collections.lastMonth) * 100)
      : null;

  const stats = data
    ? [
        { label: 'Active Students', value: data.students.active.toLocaleString('en-IN'), icon: Users, note: `+${data.students.newThisMonth} this month`, href: '/admin-dashboard/lms/students', color: 'from-blue-500 to-blue-700' },
        { label: 'Published Courses', value: String(data.courses.published), icon: BookOpen, note: `${data.courses.batches} batches`, href: '/admin-dashboard/lms/courses', color: 'from-emerald-500 to-emerald-700' },
        { label: 'Collected This Month', value: inr(data.collections.thisMonth), icon: IndianRupee, note: collectedDelta === null ? `Last month ${inr(data.collections.lastMonth)}` : `${collectedDelta >= 0 ? '+' : ''}${collectedDelta}% vs last month`, href: '/admin-dashboard/finance/payments', color: 'from-indigo-500 to-indigo-700' },
        { label: 'Lead Conversion', value: `${data.leads.conversionRate}%`, icon: Target, note: `${data.leads.open} open · ${data.leads.followUpsDue} due today`, href: '/admin-dashboard/lms/leads', color: 'from-orange-500 to-orange-700' },
      ]
    : [];

  const tiles = data
    ? [
        { label: 'Outstanding fees', value: inr(data.collections.outstanding), icon: Wallet, href: '/admin-dashboard/finance/invoices', tone: 'text-amber-400' },
        { label: 'Overdue', value: inr(data.collections.overdue), icon: AlertCircle, href: '/admin-dashboard/finance/invoices', tone: data.collections.overdue > 0 ? 'text-rose-400' : 'text-slate-300' },
        { label: 'Attendance (30 days)', value: data.attendancePct === null ? '—' : `${data.attendancePct}%`, icon: ClipboardList, href: '/admin-dashboard/lms/students/attendance', tone: 'text-cyan-400' },
        { label: 'Test pass rate', value: data.passRate === null ? '—' : `${data.passRate}%`, icon: GraduationCap, href: '/admin-dashboard/lms/students/tests', tone: 'text-purple-400' },
        { label: 'Assignments to review', value: String(data.pendingReviews), icon: FileCheck, href: '/admin-dashboard/lms/students/assignments', tone: 'text-blue-400' },
        ...(isAdmin
          ? [{ label: 'Expenses to approve', value: String(data.pendingExpenseApprovals), icon: CheckCircle2, href: '/admin-dashboard/finance/expense-approvals', tone: 'text-emerald-400' }]
          : [{ label: 'New leads (7 days)', value: String(data.leads.newThisWeek), icon: Target, href: '/admin-dashboard/lms/leads', tone: 'text-emerald-400' }]),
      ]
    : [];

  const bars = data ? (range === 'week' ? data.revenue.last7Days : data.revenue.last6Months) : [];
  const maxBar = Math.max(1, ...bars.map((b) => b.amount));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back, here&apos;s what&apos;s happening in your workspace today.</p>
          <BranchChip className="mt-2" />
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p className="text-sm text-rose-400">Could not load the dashboard. Try Refresh.</p>}
      {!data && !error && <p className="text-sm text-slate-400">Loading live numbers…</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
          >
            <Link href={stat.href} className="block glass-panel p-5 rounded-2xl relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <div className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{stat.note}</div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {data && data.myClassesToday.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" /> My classes today
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.myClassesToday.map((c) => (
              <div key={`${c.batch}-${c.startTime}`} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="font-mono text-xs text-emerald-400">{c.startTime}–{c.endTime}</p>
                <p className="text-sm font-semibold text-white mt-1">{c.subject}</p>
                <p className="text-xs text-slate-400">
                  {c.batch}
                  {c.room ? ` · ${c.room}` : ""}
                  {c.link && (
                    <>
                      {" · "}
                      <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Join</a>
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tiles.map((t) => (
            <Link key={t.label} href={t.href} className="glass-panel rounded-xl p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <t.icon size={14} className={t.tone} /> {t.label}
              </div>
              <p className={`text-xl font-bold mt-2 ${t.tone}`}>{t.value}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Fee Collections</h2>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as 'week' | 'months')}
              className="bg-slate-900 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="months">Last 6 Months</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-white/10 pb-4">
            {bars.map((b) => (
              <div key={b.label} className="w-full h-full relative group flex flex-col justify-end">
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {inr(b.amount)}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-emerald-600/80 to-emerald-400/80 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{ height: `${Math.max(b.amount > 0 ? 3 : 0, (b.amount / maxBar) * 90)}%` }}
                  title={`${b.label}: ${inr(b.amount)}`}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            {bars.map((b) => <span key={b.label}>{b.label}</span>)}
          </div>
          {data && bars.every((b) => b.amount === 0) && (
            <p className="text-xs text-slate-500 mt-3">No payments recorded in this period.</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
          {data && data.activity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
          <div className="space-y-6">
            {data?.activity.map((activity, i) => {
              const style = ACTIVITY_STYLE[activity.kind];
              return (
                <div key={`${activity.kind}-${activity.at}-${i}`} className="flex gap-4 relative">
                  {i !== data.activity.length - 1 && <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-white/10"></div>}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color} z-10 ring-4 ring-[#070B14]`}>
                    <style.icon size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{activity.text}</p>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{activity.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                      <Clock size={10} /> {timeAgo(activity.at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

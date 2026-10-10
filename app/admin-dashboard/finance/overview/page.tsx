"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getFinanceOverview, type OverviewData } from "@/lib/actions/finance";
import { CircleDollarSign, DollarSign, AlertCircle, Users, ArrowRight, CreditCard, Loader2, PiggyBank, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const stats = [
  { key: "collected", label: "Total Collected", accent: "text-blue-400", icon: <DollarSign size={14} /> },
  { key: "outstanding", label: "Outstanding Fees", accent: "text-amber-400", icon: <AlertCircle size={14} /> },
  { key: "overdue", label: "Overdue Students", accent: "text-red-400", icon: <Users size={14} /> },
  { key: "expense", label: "Expense (Approved)", accent: "text-purple-400", icon: <CreditCard size={14} /> },
  { key: "pending", label: "Pending Expenses", accent: "text-amber-400", icon: <ReceiptText size={14} /> },
  { key: "profit", label: "Net Profit", accent: "text-emerald-400", icon: <PiggyBank size={14} /> },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const last5Colors = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-purple-600", "bg-rose-600"];

export default function FinanceOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    getFinanceOverview()
      .then((d) => { if (!ignore) setData(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const expectTotal = (data?.collected ?? 0) + (data?.outstanding ?? 0);
  const rate = data?.collectionRate ?? 0;
  const profit = (data?.collected ?? 0) - (data?.approvedExpenses ?? 0);
  const maxMonth = Math.max(...(data?.monthlyCollected.map((m) => m.amount) ?? [0]), 1);
  const maxCat = Math.max(...(data?.expenseByCategory.map((c) => c.amount) ?? [0]), 1);

  const statValues = { collected: `₹${(data?.collected ?? 0).toLocaleString("en-IN")}`, outstanding: `₹${(data?.outstanding ?? 0).toLocaleString("en-IN")}`, overdue: data?.overdueStudents ?? 0, expense: `₹${(data?.approvedExpenses ?? 0).toLocaleString("en-IN")}`, pending: `₹${(data?.pendingExpenses ?? 0).toLocaleString("en-IN")}`, profit: `₹${profit.toLocaleString("en-IN")}` };

  return (
    <div className="space-y-6">
      <PageHeader title="Finance Overview" subtitle="Money received, money still owed, and where it goes." icon={<CircleDollarSign size={20} className="text-blue-400" />}>
        <span className="px-3 py-1.5 bg-slate-900/50 border border-white/10 text-slate-300 rounded-lg text-xs font-medium">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <Link href="/admin-dashboard/finance/payments" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-[#5E9A2E] text-white hover:bg-[#4A7E24] text-sm">
          View All Payments
        </Link>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <>
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">HEADLINE NUMBERS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {stats.map((s) => (
                <div key={s.key} className="glass-panel rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
                    <span className={s.accent}>{s.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">{statValues[s.key as keyof typeof statValues]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee collection progress */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">FEE COLLECTION PROGRESS</h3>
                  <p className="text-xs text-slate-500">Of total expected fees, how much has been collected.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-400">{rate}%</span>
                  <p className="text-[10px] text-slate-500">collected</p>
                </div>
              </div>
              <div className="w-full h-6 bg-slate-900/50 rounded-full overflow-hidden mb-2 relative">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span><span className="text-emerald-400 font-bold">₹{(data?.collected ?? 0).toLocaleString("en-IN")}</span> collected</span>
                <span><span className="text-slate-300 font-bold">₹{expectTotal.toLocaleString("en-IN")}</span> expected</span>
                <span><span className="text-amber-400 font-bold">₹{(data?.outstanding ?? 0).toLocaleString("en-IN")}</span> owed</span>
              </div>
            </div>

            {/* Monthly collected bar chart */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">MONTHLY COLLECTION</h3>
              <p className="text-xs text-slate-500 mb-4">Successful payments per month (Apr–Sep 2026).</p>
              <div className="flex items-end gap-3 h-32">
                {(data?.monthlyCollected ?? []).map((m) => (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400">{m.amount > 0 ? `₹${(m.amount / 1000).toFixed(0)}k` : ""}</span>
                    <div className="w-full rounded-md bg-emerald-500/70 transition-all" style={{ height: `${Math.max(4, (m.amount / maxMonth) * 100)}%` }} />
                    <span className="text-[9px] text-slate-500">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense by category */}
            <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm h-fit">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">EXPENSE BY CATEGORY</h3>
              <p className="text-xs text-slate-500 mb-4">Approved expenses, grouped.</p>
              <div className="space-y-3">
                {(data?.expenseByCategory.length ? data.expenseByCategory : [{ name: "No approved expense", count: 0, amount: 0 }]).map((c) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{c.name} <span className="text-slate-500">({c.count})</span></span>
                      <span className="text-white font-bold">₹{c.amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${(c.amount / maxCat) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest payments */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">LATEST PAYMENTS</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Last 5 settled transactions.</p>
                </div>
                <Link href="/admin-dashboard/finance/payments" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">View all <ArrowRight size={12} /></Link>
              </div>
              <div className="divide-y divide-slate-800/50">
                {(data?.latestPayments.length ? data.latestPayments : []).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
                    <div className={`w-9 h-9 ${last5Colors[i % last5Colors.length]} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initials(p.studentName)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{p.studentName}</h4>
                      <p className="text-[11px] text-slate-500">{p.receiptNo} · {p.mode}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">₹{p.amount.toLocaleString("en-IN")}</p>
                      <span className="text-[10px] text-emerald-400 font-bold">success</span>
                    </div>
                  </div>
                ))}
                {!data?.latestPayments.length && <div className="px-5 py-10 text-center text-sm text-slate-500">No successful payments yet.</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
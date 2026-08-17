"use client";

import React from 'react';
import Link from 'next/link';
import { 
  RefreshCw,
  DollarSign,
  AlertCircle,
  Users,
  TrendingUp,
  ArrowRight,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  BarChart3,
  FileText,
  RotateCw,
  CircleDollarSign
} from 'lucide-react';

export default function FinanceOverviewPage() {
  const latestPayments = [
    { initials: 'NR', name: 'Nikhil Raghuwanshi', course: 'NEET', date: '', amount: 5001, status: 'cancelled', color: 'bg-blue-600' },
    { initials: 'RM', name: 'Rohan More', course: 'JEE', date: '02 Jul 2026', amount: 4500, status: 'success', color: 'bg-green-600' },
    { initials: 'AP', name: 'Ansh Patthe', course: 'MERN-Demo', date: '', amount: 0, status: 'cancelled', color: 'bg-purple-600' },
    { initials: 'NR', name: 'Nikhil Raghuwanshi', course: 'NEET', date: '01 May 2026', amount: 2436, status: 'success', color: 'bg-blue-600' },
    { initials: 'NR', name: 'Nikhil Raghuwanshi', course: 'NEET', date: '11 Jun 2026', amount: 4564, status: 'success', color: 'bg-blue-600' },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <CircleDollarSign size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Finance Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5">Money received and money still owed by students.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium">
            Today: 10 Jul 2026
          </span>
          <button className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            All Branches
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/admin-dashboard/finance/payments" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Eye size={16} /> View All Payments
          </Link>
        </div>
      </div>

      {/* Headline Numbers */}
      <div className="mb-6">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">HEADLINE NUMBERS</h3>
        <p className="text-xs text-slate-500 mb-3">Top-only, like a super-lite marketing list of transactions.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-blue-400" />
              <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">TOTAL COLLECTED</h4>
            </div>
            <p className="text-xl font-bold text-white">₹32,550</p>
            <p className="text-[10px] text-slate-500 mt-1">All successful payments received</p>
          </div>
          <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-amber-400" />
              <h4 className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">OUTSTANDING FEES</h4>
            </div>
            <p className="text-xl font-bold text-white">₹7,453</p>
            <p className="text-[10px] text-slate-500 mt-1">Money still owed by students</p>
          </div>
          <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-red-400" />
              <h4 className="text-[9px] font-bold text-red-400 uppercase tracking-wider">OVERDUE STUDENTS</h4>
            </div>
            <p className="text-xl font-bold text-white">6</p>
            <p className="text-[10px] text-slate-500 mt-1">8 students past due date</p>
          </div>
          <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-400" />
              <h4 className="text-[9px] font-bold text-green-400 uppercase tracking-wider">COLLECTED TODAY</h4>
            </div>
            <p className="text-xl font-bold text-white">₹0</p>
            <p className="text-[10px] text-slate-500 mt-1">No payments yet today</p>
          </div>
          <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={14} className="text-purple-400" />
              <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">TOTAL EXPENSE</h4>
            </div>
            <p className="text-xl font-bold text-white">₹43,967</p>
            <p className="text-[10px] text-slate-500 mt-1">Approved & paid expenses</p>
          </div>
          <div className="bg-[#171717] border border-emerald-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <h4 className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">PROFIT</h4>
            </div>
            <p className="text-xl font-bold text-white">-₹39,467</p>
            <p className="text-[10px] text-slate-500 mt-1">Collected minus expenses</p>
          </div>
        </div>
      </div>

      {/* Fee Collection Progress */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">FEE COLLECTION PROGRESS</h3>
            <p className="text-xs text-slate-500">Of total expected fees, how much has been collected so far.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-green-400">81%</span>
            <p className="text-[10px] text-slate-500">collected</p>
          </div>
        </div>
        <div className="w-full h-6 bg-[#262626] rounded-full overflow-hidden mb-2 relative">
          <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: '81%' }}>
            <span className="text-[10px] font-bold text-white drop-shadow-sm">₹32,550 collected</span>
          </div>
          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
            <span className="text-[10px] font-bold text-slate-400">₹7,453 still owed</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Total expected: <span className="text-white font-bold">₹42,003</span></span>
        </div>
      </div>

      {/* Student Context */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">STUDENT CONTEXT</h3>
        <p className="text-xs text-slate-500 mb-4">How many students are behind these numbers.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <div className="p-2 bg-blue-900/30 rounded-full">
              <CheckCircle size={18} className="text-blue-400" />
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE STUDENTS</h4>
              <p className="text-xl font-bold text-white">10</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <div className="p-2 bg-amber-900/30 rounded-full">
              <AlertCircle size={18} className="text-amber-400" />
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">WITH UNPAID DUES</h4>
              <p className="text-xl font-bold text-white">6</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <div className="p-2 bg-green-900/30 rounded-full">
              <CreditCard size={18} className="text-green-400" />
            </div>
            <div>
              <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PAYMENTS TODAY</h4>
              <p className="text-xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Payments + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Payments */}
        <div className="lg:col-span-2 bg-[#171717] border border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">LATEST PAYMENTS</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 5 transactions · click any row to open it.</p>
            </div>
            <Link href="/admin-dashboard/finance/payments" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800/50">
            {latestPayments.map((payment, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#262626]/40 transition-colors cursor-pointer">
                <div className={`w-9 h-9 ${payment.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {payment.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{payment.name}</h4>
                  <p className="text-[11px] text-slate-500">{payment.course} {payment.date ? `· ${payment.date}` : '· -'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">₹{payment.amount.toLocaleString()}</p>
                  <span className={`text-[10px] font-bold ${payment.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl p-5 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-white mb-1">QUICK LINKS</h3>
          <p className="text-xs text-slate-500 mb-4">Jump to a filtered view of payments.</p>
          <div className="space-y-3">
            <Link href="/admin-dashboard/finance/payments" className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
              <div className="p-1.5 bg-blue-900/30 rounded"><Eye size={14} className="text-blue-400" /></div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">View All Payments</h4>
                <p className="text-[10px] text-slate-500">Every transaction, every status</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-blue-400 transition-colors" />
            </Link>
            <Link href="/admin-dashboard/finance/invoices" className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
              <div className="p-1.5 bg-amber-900/30 rounded"><AlertCircle size={14} className="text-amber-400" /></div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Outstanding Fees</h4>
                <p className="text-[10px] text-slate-500">Yet to be paid · follow-ups</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-amber-400 transition-colors" />
            </Link>
            <Link href="/admin-dashboard/finance/invoices" className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
              <div className="p-1.5 bg-red-900/30 rounded"><Clock size={14} className="text-red-400" /></div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">Overdue Follow-ups</h4>
                <p className="text-[10px] text-slate-500">Past due date · needs action</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-red-400 transition-colors" />
            </Link>
            <Link href="/admin-dashboard/finance/payments" className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group">
              <div className="p-1.5 bg-green-900/30 rounded"><CheckCircle size={14} className="text-green-400" /></div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">Successful Payments</h4>
                <p className="text-[10px] text-slate-500">Settled receipts · downloads</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-green-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

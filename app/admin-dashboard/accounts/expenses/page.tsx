"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw,
  Search,
  Download,
  FileText,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Calendar
} from 'lucide-react';

export default function ExpenseTrackerPage() {
  const expenses = [
    { id: 'EXP-2026-00007', title: 'Stationery', desc: 'Books and other Tu...', category: 'Stationery Material', vendor: 'Scholar Stationers Pvt. Ltd.', amount: 500, date: '7/8/2026', payment: 'Bank Transfer', source: 'Company', staff: 'N/A', receipt: '-', submittedBy: 'Charudatta Warke', approvedBy: 'Charudatta Warke', rejectedBy: '-', remarks: 'Essential Expenses', reimbursement: 'N/A', status: 'approved' },
    { id: 'EXP-2026-00001', title: 'Light Bill', desc: 'May 2024 Light Bill', category: 'Admin Maintenance', vendor: 'Campus Stationery & Office Supplies', amount: 2500, date: '7/8/2026', payment: 'Bank Transfer', source: 'Company', staff: 'N/A', receipt: '-', submittedBy: 'Charudatta Warke', approvedBy: 'Charudatta Warke', rejectedBy: '-', remarks: 'monthly light Bill', reimbursement: 'N/A', status: 'approved' },
    { id: 'EXP-2026-00003', title: 'Guest Travelling', desc: 'Travel Expenses', category: 'Travel Expenses', vendor: 'Scholar Stationers Pvt. Ltd.', amount: 500, date: '7/4/2026', payment: 'Bank Transfer', source: 'Company', staff: 'N/A', receipt: '-', submittedBy: 'Charudatta Warke', approvedBy: 'Charudatta Warke', rejectedBy: '-', remarks: 'travel expenses', reimbursement: 'N/A', status: 'approved' },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-900/30 rounded-lg">
            <DollarSign size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Expense Tracker</h1>
            <p className="text-sm text-slate-400 mt-0.5">Submit, verify, approve and audit every outgoing expense.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            All Branches
          </button>
          <span className="text-xs text-slate-500 font-medium">3 records</span>
          <Link 
            href="/admin-dashboard/accounts/expenses/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Expense
          </Link>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-4 mb-6 text-xs text-slate-500 border-b border-slate-800 pb-3 overflow-x-auto">
        <span className="text-slate-400 font-medium whitespace-nowrap">Q2/25 · Pending: 0 · Approved: 3 · Voided: 0</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 whitespace-nowrap">Jul 26: ₹0 · Jun 26: ₹200 · Trend: -100.05</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400 whitespace-nowrap">Pending: 0 · Approved: 3 · Voided: 0</span>
      </div>

      {/* Expense Comparison Chart Area */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">EXPENSE COMPARISON</h3>
            <p className="text-sm text-white font-bold mb-4">Jul 26 vs Jun 26</p>
            
            <div className="flex items-center gap-4 mb-4 text-xs">
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                <input type="radio" name="period" defaultChecked className="text-blue-500 focus:ring-blue-500" />
                Jul 26
              </label>
              <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                <input type="radio" name="period" className="text-blue-500 focus:ring-blue-500" />
                Jun 26
              </label>
              <span className="ml-auto flex items-center gap-1 text-red-400 font-medium">
                <TrendingDown size={14} /> -100.05
              </span>
            </div>
            
            {/* Simplified Chart */}
            <div className="relative h-40 border-l border-b border-slate-700">
              <div className="absolute left-0 top-0 text-[9px] text-slate-500 -translate-x-full pr-2">500</div>
              <div className="absolute left-0 top-1/4 text-[9px] text-slate-500 -translate-x-full pr-2">400</div>
              <div className="absolute left-0 top-1/2 text-[9px] text-slate-500 -translate-x-full pr-2">300</div>
              <div className="absolute left-0 top-3/4 text-[9px] text-slate-500 -translate-x-full pr-2">200</div>
              <div className="absolute left-0 bottom-0 text-[9px] text-slate-500 -translate-x-full pr-2">0</div>
              
              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <polyline points="0,20 100,40 200,140 300,140 400,140 500,140" fill="none" stroke="#38bdf8" strokeWidth="2"/>
                <circle cx="0" cy="20" r="4" fill="#38bdf8"/>
                <circle cx="100" cy="40" r="4" fill="#38bdf8"/>
                <circle cx="200" cy="140" r="4" fill="#38bdf8"/>
                <circle cx="300" cy="140" r="4" fill="#38bdf8"/>
                <circle cx="400" cy="140" r="4" fill="#38bdf8"/>
                <circle cx="500" cy="140" r="4" fill="#38bdf8"/>
              </svg>
              
              <div className="absolute bottom-0 left-0 right-0 flex justify-between -mb-5 text-[9px] text-slate-500">
                <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span>
              </div>
            </div>
          </div>
          
          {/* Right Stats */}
          <div className="w-full lg:w-56 space-y-3 flex-shrink-0">
            <div className="bg-blue-900/20 border border-blue-900/40 rounded-lg p-3">
              <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">This Month</h4>
              <p className="text-xl font-bold text-white">₹0</p>
            </div>
            <div className="bg-emerald-900/20 border border-emerald-900/40 rounded-lg p-3">
              <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Previous Month</h4>
              <p className="text-xl font-bold text-white">₹500</p>
            </div>
            <div className="bg-amber-900/20 border border-amber-900/40 rounded-lg p-3">
              <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">Pending</h4>
              <p className="text-xl font-bold text-white">0</p>
            </div>
            <div className="bg-green-900/20 border border-green-900/40 rounded-lg p-3">
              <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">Approved Value</h4>
              <p className="text-xl font-bold text-white">₹3,500</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by title, description, or expense number" 
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="relative">
          <select className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none pr-8">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative">
          <select className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none pr-8">
            <option>All Vendors</option>
            <option>Scholar Stationers Pvt. Ltd.</option>
            <option>Campus Stationery</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="dd-mm-yyyy" className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500 w-32" />
          <span className="text-slate-500 text-xs">to</span>
          <input type="text" placeholder="dd-mm-yyyy" className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500 w-32" />
        </div>
      </div>

      {/* Filtered Summary */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">EXPENSE REPORT</h3>
            <h2 className="text-base font-bold text-white">Filtered Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">Use date range and branch scope for approval/reimbursement-aware fields.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
              <RefreshCw size={14} /> Refresh Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-900/50 text-green-400 rounded-lg text-xs font-medium hover:bg-green-900/50 transition-colors">
              <Download size={14} /> Excel
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-900/50 text-red-400 rounded-lg text-xs font-medium hover:bg-red-900/50 transition-colors">
              <FileText size={14} /> PDF
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</h4>
            <p className="text-lg font-bold text-green-400">₹3,500</p>
          </div>
          <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Count</h4>
            <p className="text-lg font-bold text-white">3</p>
          </div>
          <div className="bg-[#0a0a0a] border border-slate-800 rounded-lg p-4">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rows for Export</h4>
            <p className="text-lg font-bold text-white">3</p>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-3">EXPENSE #</th>
              <th className="py-3 px-3">TITLE</th>
              <th className="py-3 px-3">CATEGORY</th>
              <th className="py-3 px-3">VENDOR</th>
              <th className="py-3 px-3">AMOUNT</th>
              <th className="py-3 px-3">DATE</th>
              <th className="py-3 px-3">PAYMENT</th>
              <th className="py-3 px-3">PAYMENT SOURCE</th>
              <th className="py-3 px-3">STAFF PAYER</th>
              <th className="py-3 px-3">SUBMITTED BY</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-3 px-3">
                  <span className="text-xs text-slate-400 font-mono">{exp.id}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-white text-xs">{exp.title}</div>
                  <div className="text-[11px] text-slate-500">{exp.desc}</div>
                </td>
                <td className="py-3 px-3 text-xs text-slate-300">{exp.category}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.vendor}</td>
                <td className="py-3 px-3 text-xs font-bold text-white">₹{exp.amount.toLocaleString()}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.date}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.payment}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.source}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.staff}</td>
                <td className="py-3 px-3 text-xs text-slate-400">{exp.submittedBy}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-900/50">
                    {exp.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <button className="text-slate-500 hover:text-blue-400 transition-colors" title="View"><Eye size={14} /></button>
                    <button className="text-slate-500 hover:text-amber-400 transition-colors" title="Edit"><Edit size={14} /></button>
                    <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

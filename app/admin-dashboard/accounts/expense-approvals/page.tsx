"use client";

import React, { useState } from 'react';
import { 
  RefreshCw,
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Columns
} from 'lucide-react';

export default function ExpenseApprovalQueuePage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Expense Approval Queue</h1>
          <p className="text-sm text-slate-400 mt-1">Branch: <span className="text-white font-medium">All Branches</span></p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors shadow-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <Clock size={16} className="text-amber-400" />
          <div>
            <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">PENDING</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400" />
          <div>
            <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">APPROVED</h3>
            <p className="text-xl font-bold text-white">3</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <XCircle size={16} className="text-red-400" />
          <div>
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">REJECTED</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <FileText size={16} className="text-slate-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VOIDED</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <Columns size={16} className="text-blue-400" />
          <div>
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">TOTAL</h3>
            <p className="text-xl font-bold text-white">₹0</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#171717] border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search expense #, vendor, description..." 
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-900/50 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-900/50 transition-colors">
            <Filter size={14} />
            Filters
            <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 rounded text-[10px] font-bold">1</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-700 text-slate-400 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            <X size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-4">EXPENSE #</th>
              <th className="py-3 px-4">VENDOR / CATEGORY</th>
              <th className="py-3 px-4">BRANCH</th>
              <th className="py-3 px-4">DESCRIPTION</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">METHOD</th>
              <th className="py-3 px-4">SUBMITTED BY</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={9} className="py-16 text-center text-slate-500 text-sm">
                No expenses match this filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { 
  Plus,
  RefreshCw,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  XCircle,
  DollarSign
} from 'lucide-react';

export default function RefundsPage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Refund Management</h1>
          <p className="text-sm text-slate-400 mt-1">Branch: <span className="text-white font-medium">All Branches</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> New Refund
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-amber-400" />
            <h4 className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">PENDING</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={13} className="text-green-400" />
            <h4 className="text-[9px] font-bold text-green-400 uppercase tracking-wider">APPROVED</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={13} className="text-blue-400" />
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">PROCESSED</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={13} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">COMPLETED</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={13} className="text-red-400" />
            <h4 className="text-[9px] font-bold text-red-400 uppercase tracking-wider">REJECTED</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={13} className="text-purple-400" />
            <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">REFUNDED</h4>
          </div>
          <p className="text-xl font-bold text-white">₹0</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#171717] border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search refund #, reason..." className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-4">REFUND #</th>
              <th className="py-3 px-4">PAYEE</th>
              <th className="py-3 px-4">BRANCH</th>
              <th className="py-3 px-4">ORIGINAL</th>
              <th className="py-3 px-4">REFUND</th>
              <th className="py-3 px-4">METHOD</th>
              <th className="py-3 px-4">REASON</th>
              <th className="py-3 px-4">REQUESTED</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={10} className="py-16 text-center text-sm text-slate-500">
                No refunds yet – create one from a settled payment.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

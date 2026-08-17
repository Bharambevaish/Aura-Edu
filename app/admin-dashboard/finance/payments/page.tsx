"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  RotateCcw,
  TrendingUp,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export default function PaymentsPage() {
  const payments = [
    { invoice: '-', student: 'Nikhil Raghuwanshi', admNo: 'ADM-2026-0006', branch: 'Main Branch', mobile: '8787654543', email: 'nraghuwanshi100@gmail.com', course: 'NEET', batch: 'NEET BATCH', amount: 5001, gst: '₹0', gateway: '₹0', net: 5001, mode: 'Razorpay', source: 'Student Portal', date: '-', status: 'cancelled' },
    { invoice: 'RCP-202607-5203', student: 'Rohan More', admNo: 'ADM-2026-0005', branch: 'Main Branch', mobile: '5668787160', email: 'katturwaromkar23@gmail.com', course: 'JEE', batch: '-', amount: 4500, gst: '₹0', gateway: '₹0', net: 4500, mode: 'Cash', source: 'Admin', date: '02 Jul 2026', status: 'success' },
    { invoice: '-', student: 'Ansh Patthe', admNo: 'ADM-2026-0009', branch: 'Main Branch', mobile: '9022549936', email: 'anshpatthe90@gmail.com', course: 'MERN-Demo', batch: '-', amount: '₹1', gst: '₹0', gateway: '₹0', net: '₹1', mode: 'Razorpay', source: 'Student Portal', date: '-', status: 'cancelled' },
    { invoice: 'RCP-202606-5095', student: 'Nikhil Raghuwanshi', admNo: 'ADM-2026-0006', branch: 'Main Branch', mobile: '8787654543', email: 'nraghuwanshi100@gmail.com', course: 'NEET', batch: '-', amount: 2436, gst: '₹0', gateway: '₹0', net: 2436, mode: 'Cash', source: 'Admin', date: '01 May 2026', status: 'success' },
    { invoice: 'RCP-202606-0430', student: 'Nikhil Raghuwanshi', admNo: 'ADM-2026-0006', branch: 'Main Branch', mobile: '5187654543', email: 'nraghuwanshi100@gmail.com', course: 'NEET', batch: '-', amount: 4564, gst: '₹0', gateway: '₹0', net: 4564, mode: 'Cash', source: 'Admin', date: '11 Jun 2026', status: 'success' },
    { invoice: 'RCP-202606-3072', student: 'Sumit Power', admNo: 'ADM-2026-0007', branch: 'Main Branch', mobile: '9876545453', email: 'sumit@gmail.com', course: 'JEE', batch: '-', amount: 5000, gst: '₹0', gateway: '₹0', net: 5000, mode: 'Cash', source: 'Admin', date: '11 Jun 2026', status: 'success' },
    { invoice: 'RCP-202606-1298', student: 'Sumit Power', admNo: 'ADM-2026-0007', branch: 'Main Branch', mobile: '9876545453', email: 'sumit@gmail.com', course: 'NEET', batch: '-', amount: 25000, gst: '₹0', gateway: '₹0', net: 25000, mode: 'Cash', source: 'Admin', date: '11 Jun 2026', status: 'success' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-900/30 text-green-400 border-green-900/50';
      case 'cancelled': return 'bg-red-900/30 text-red-400 border-red-900/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <DollarSign size={20} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Student Payments</h1>
            <p className="text-sm text-slate-400 mt-0.5">Record offline payments, review the ledger, save receipts.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">All Branches</button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-blue-400" />
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">TOTAL COLLECTED</h4>
          </div>
          <p className="text-xl font-bold text-white">₹50,551</p>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PAYMENTS</h4>
          </div>
          <p className="text-xl font-bold text-white">40</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <h4 className="text-[9px] font-bold text-green-400 uppercase tracking-wider">SUCCESSFUL</h4>
          </div>
          <p className="text-xl font-bold text-white">20</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-amber-400" />
            <h4 className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">PENDING</h4>
          </div>
          <p className="text-xl font-bold text-white">5</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw size={14} className="text-red-400" />
            <h4 className="text-[9px] font-bold text-red-400 uppercase tracking-wider">REFUNDS</h4>
          </div>
          <p className="text-xl font-bold text-white">₹0</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-purple-400" />
            <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">WAIVERS</h4>
          </div>
          <p className="text-xl font-bold text-white">₹0</p>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL EXPENSE</h4>
          </div>
          <p className="text-xl font-bold text-white">₹3,500</p>
        </div>
        <div className="bg-[#171717] border border-emerald-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <h4 className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">PROFIT</h4>
          </div>
          <p className="text-xl font-bold text-white">₹47,051</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search invoice, receipt, transaction ID, student..." className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Amount Range */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-6">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MIN AMOUNT</label>
          <input type="number" defaultValue={0} className="block mt-1 px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 w-32" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MAX AMOUNT</label>
          <input type="number" defaultValue={100000} className="block mt-1 px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500 w-32" />
        </div>
        <div className="flex items-end gap-2 ml-auto">
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition-colors">Apply</button>
          <button className="px-3 py-1.5 bg-transparent border border-slate-700 text-slate-400 rounded text-xs font-medium hover:bg-[#262626] transition-colors">Reset</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1500px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-3">INVOICE NO</th>
              <th className="py-3 px-3">STUDENT</th>
              <th className="py-3 px-3">BRANCH</th>
              <th className="py-3 px-3">MOBILE</th>
              <th className="py-3 px-3">EMAIL</th>
              <th className="py-3 px-3">COURSE</th>
              <th className="py-3 px-3">BATCH</th>
              <th className="py-3 px-3">AMOUNT</th>
              <th className="py-3 px-3">GST</th>
              <th className="py-3 px-3">GATEWAY FEE</th>
              <th className="py-3 px-3">NET AMOUNT</th>
              <th className="py-3 px-3">PAYMENT MODE</th>
              <th className="py-3 px-3">SOURCE</th>
              <th className="py-3 px-3">DATE</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-3">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {payments.map((p, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-3 px-3 text-slate-400 font-mono">{p.invoice}</td>
                <td className="py-3 px-3">
                  <div className="font-bold text-white">{p.student}</div>
                  <div className="text-[10px] text-slate-500">{p.admNo}</div>
                </td>
                <td className="py-3 px-3"><span className="px-1.5 py-0.5 bg-blue-900/20 text-blue-400 rounded text-[10px] font-medium">{p.branch}</span></td>
                <td className="py-3 px-3 text-slate-400">{p.mobile}</td>
                <td className="py-3 px-3 text-slate-400 max-w-[150px] truncate">{p.email}</td>
                <td className="py-3 px-3 text-slate-300 font-medium">{p.course}</td>
                <td className="py-3 px-3 text-slate-400">{p.batch}</td>
                <td className="py-3 px-3 text-white font-bold">₹{typeof p.amount === 'number' ? p.amount.toLocaleString() : p.amount}</td>
                <td className="py-3 px-3 text-slate-400">{p.gst}</td>
                <td className="py-3 px-3 text-slate-400">{p.gateway}</td>
                <td className="py-3 px-3 text-white font-bold">₹{typeof p.net === 'number' ? p.net.toLocaleString() : p.net}</td>
                <td className="py-3 px-3 text-slate-300">{p.mode}</td>
                <td className="py-3 px-3 text-slate-400">{p.source}</td>
                <td className="py-3 px-3 text-slate-400">{p.date}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(p.status)}`}>{p.status}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <button className="text-slate-500 hover:text-blue-400 transition-colors"><Eye size={13} /></button>
                    <button className="text-slate-500 hover:text-green-400 transition-colors"><Download size={13} /></button>
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

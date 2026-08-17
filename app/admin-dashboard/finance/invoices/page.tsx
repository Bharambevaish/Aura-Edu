"use client";

import React from 'react';
import { 
  RefreshCw,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  Eye,
  Download,
  ChevronDown,
  Zap
} from 'lucide-react';

export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-00018', student: 'N/A', sub: 'NEET -', total: 1000, paid: 1000, due: '₹0', mode: 'N/A', status: 'Paid', date: '25 Jun 2026' },
    { id: 'INV-2026-00017', student: 'N/A', sub: 'Neet - NEET BATCH', total: 5000, paid: 5000, due: '₹0', mode: 'Cash', status: 'Paid', date: '11 Jun 2026' },
    { id: 'INV-2026-00016', student: 'N/A', sub: 'JEE -', total: 5000, paid: 5000, due: '₹0', mode: 'Cash', status: 'Paid', date: '11 Jun 2026' },
    { id: 'INV-2026-00015', student: 'N/A', sub: 'NEET -', total: 5000, paid: 5000, due: '₹0', mode: 'Cash', status: 'Paid', date: '11 Jun 2026' },
    { id: 'INV-2026-00014', student: 'Charudatta Warke', sub: '- Python Programming', total: 5999, paid: 5999, due: '₹0', mode: 'Cash', status: 'Paid', date: '08 Jun 2026' },
    { id: 'INV-2026-00013', student: 'Charudatta Warke', sub: '- Python Programming', total: 3999, paid: 3999, due: '₹0', mode: 'Cash', status: 'Paid', date: '06 Jun 2026' },
    { id: 'INV-2026-00002', student: 'Charudatta Warke', sub: 'MERN Demo - Python Programming', total: '₹1', paid: '₹1', due: '₹0', mode: 'Online', status: 'Paid', date: '06 Jun 2026' },
    { id: 'INV-2026-00001', student: 'Rohan More', sub: 'MERN Demo - JEE BATCH', total: '₹1', paid: '₹1', due: '₹0', mode: 'Online', status: 'Paid', date: '08 Jun 2026' },
    { id: 'INV-2026-00010', student: 'Charudatta Warke', sub: '- Python Programming', total: 3000, paid: 3000, due: '₹0', mode: 'Cash', status: 'Paid', date: '08 Jun 2026' },
    { id: 'INV-2026-00009', student: 'Charudatta Warke', sub: '- Python Programming', total: 5000, paid: 5000, due: '₹0', mode: 'Cash', status: 'Paid', date: '08 Jun 2026' },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <FileText size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Invoices</h1>
            <p className="text-sm text-slate-400 mt-0.5">Student invoices, outstanding balances, payment lifecycle.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">All Branches</button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Zap size={16} /> Sync Invoices
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={13} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL INVOICES</h4>
          </div>
          <p className="text-xl font-bold text-white">18</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Within current filter scope</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={13} className="text-green-400" />
            <h4 className="text-[9px] font-bold text-green-400 uppercase tracking-wider">PAID</h4>
          </div>
          <p className="text-xl font-bold text-white">17</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={13} className="text-amber-400" />
            <h4 className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">ISSUED</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={13} className="text-blue-400" />
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">COLLECTED</h4>
          </div>
          <p className="text-xl font-bold text-white">₹51,551</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-red-400" />
            <h4 className="text-[9px] font-bold text-red-400 uppercase tracking-wider">OUTSTANDING</h4>
          </div>
          <p className="text-xl font-bold text-white">₹900</p>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={13} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">OVERDUE</h4>
          </div>
          <p className="text-xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-4 mb-2 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search invoice no. or name..." className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
        </div>
        <div className="relative min-w-[140px]">
          <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none pr-8">
            <option>All Status</option>
            <option>Paid</option>
            <option>Issued</option>
            <option>Overdue</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <input type="text" placeholder="dd-mm-yyyy" className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 w-32 focus:outline-none focus:border-blue-500" />
        <input type="text" placeholder="dd-mm-yyyy" className="px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 placeholder-slate-500 w-32 focus:outline-none focus:border-blue-500" />
      </div>
      <div className="flex items-center gap-2 mb-6">
        <button className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1"><CheckCircle size={12} /> Apply</button>
        <button className="px-3 py-1.5 bg-transparent border border-slate-700 text-slate-400 rounded text-xs font-medium hover:bg-[#262626] transition-colors">Clear</button>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-4">INVOICE NO</th>
              <th className="py-3 px-4">STUDENT</th>
              <th className="py-3 px-4">TOTAL</th>
              <th className="py-3 px-4">PAID</th>
              <th className="py-3 px-4">DUE</th>
              <th className="py-3 px-4">PAYMENT MODE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {invoices.map((inv, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-3 px-4 text-xs font-mono text-slate-400">{inv.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
                      {inv.student.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{inv.student}</div>
                      <div className="text-[10px] text-slate-500">{inv.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs text-white font-bold">₹{typeof inv.total === 'number' ? inv.total.toLocaleString() : inv.total}</td>
                <td className="py-3 px-4 text-xs text-green-400 font-bold">₹{typeof inv.paid === 'number' ? inv.paid.toLocaleString() : inv.paid}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{inv.due}</td>
                <td className="py-3 px-4 text-xs text-slate-300">{inv.mode}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded text-[10px] font-bold border border-green-900/50 flex items-center gap-1 w-fit">
                    <CheckCircle size={10} /> {inv.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-400">{inv.date}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <button className="text-slate-500 hover:text-blue-400 transition-colors"><Eye size={14} /></button>
                    <button className="text-slate-500 hover:text-green-400 transition-colors"><Download size={14} /></button>
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

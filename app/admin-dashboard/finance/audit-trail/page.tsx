"use client";

import React from 'react';
import { 
  RefreshCw,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  Shield
} from 'lucide-react';

export default function AuditTrailPage() {
  const auditLogs = [
    { id: 'AUD-001', user: 'Charudatta Warke', role: 'Admin', action: 'Created Expense', target: 'EXP-2026-00007 · Stationery', ip: '192.168.1.1', date: '07 Jul 2026', time: '14:32:10' },
    { id: 'AUD-002', user: 'Charudatta Warke', role: 'Admin', action: 'Approved Expense', target: 'EXP-2026-00007 · Stationery', ip: '192.168.1.1', date: '07 Jul 2026', time: '14:33:45' },
    { id: 'AUD-003', user: 'Charudatta Warke', role: 'Admin', action: 'Recorded Payment', target: 'RCP-202607-5203 · Rohan More', ip: '192.168.1.1', date: '02 Jul 2026', time: '10:15:22' },
    { id: 'AUD-004', user: 'Charudatta Warke', role: 'Admin', action: 'Created Invoice', target: 'INV-2026-00018 · NEET', ip: '192.168.1.1', date: '25 Jun 2026', time: '09:45:00' },
    { id: 'AUD-005', user: 'Charudatta Warke', role: 'Admin', action: 'Added Vendor', target: 'Scholar Stationers Pvt. Ltd.', ip: '192.168.1.1', date: '20 Jun 2026', time: '11:20:33' },
    { id: 'AUD-006', user: 'System', role: 'System', action: 'Auto Invoice Sync', target: '3 invoices synced', ip: '-', date: '15 Jun 2026', time: '00:00:01' },
  ];

  const getActionColor = (action: string) => {
    if (action.includes('Created') || action.includes('Added') || action.includes('Recorded')) return 'text-green-400';
    if (action.includes('Approved')) return 'text-blue-400';
    if (action.includes('Rejected') || action.includes('Deleted')) return 'text-red-400';
    if (action.includes('Auto') || action.includes('Sync')) return 'text-purple-400';
    return 'text-slate-300';
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg">
            <Shield size={20} className="text-slate-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Audit Trail</h1>
            <p className="text-sm text-slate-400 mt-0.5">Complete log of all financial actions, changes, and system events.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={13} className="text-slate-400" />
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL EVENTS</h4>
          </div>
          <p className="text-xl font-bold text-white">{auditLogs.length}</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <User size={13} className="text-green-400" />
            <h4 className="text-[9px] font-bold text-green-400 uppercase tracking-wider">USER ACTIONS</h4>
          </div>
          <p className="text-xl font-bold text-white">5</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={13} className="text-purple-400" />
            <h4 className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">SYSTEM EVENTS</h4>
          </div>
          <p className="text-xl font-bold text-white">1</p>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-blue-400" />
            <h4 className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">LAST EVENT</h4>
          </div>
          <p className="text-sm font-bold text-white">07 Jul 2026</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#171717] border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by user, action, or target..." className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">USER</th>
              <th className="py-3 px-4">ACTION</th>
              <th className="py-3 px-4">TARGET</th>
              <th className="py-3 px-4">IP ADDRESS</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">TIME</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-3 px-4 text-xs font-mono text-slate-500">{log.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${log.role === 'System' ? 'bg-purple-700' : 'bg-blue-700'}`}>
                      {log.user.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{log.user}</div>
                      <div className="text-[10px] text-slate-500">{log.role}</div>
                    </div>
                  </div>
                </td>
                <td className={`py-3 px-4 text-xs font-bold ${getActionColor(log.action)}`}>{log.action}</td>
                <td className="py-3 px-4 text-xs text-slate-300">{log.target}</td>
                <td className="py-3 px-4 text-xs text-slate-500 font-mono">{log.ip}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{log.date}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

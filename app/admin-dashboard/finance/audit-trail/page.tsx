"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';

export default function AuditTrailPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const auditLogs = [
    { id: 'LOG-8891', date: '19 Jul 2026, 05:45 PM', actor: 'Charudatta Warke', role: 'Admin', action: 'Created Invoice', entity: 'INV-2026-089', status: 'Success', ip: '192.168.1.45', details: 'Generated new fee invoice for John Doe' },
    { id: 'LOG-8890', date: '19 Jul 2026, 04:30 PM', actor: 'System', role: 'System', action: 'Auto-Backup', entity: 'Database', status: 'Success', ip: 'Localhost', details: 'Daily automated backup completed' },
    { id: 'LOG-8889', date: '19 Jul 2026, 02:15 PM', actor: 'Nilam Thorat', role: 'Manager', action: 'Deleted Record', entity: 'Student-409', status: 'Failed', ip: '192.168.1.112', details: 'Permission denied for deletion' },
    { id: 'LOG-8888', date: '19 Jul 2026, 11:20 AM', actor: 'Omkar Katturwar', role: 'Staff', action: 'Updated Settings', entity: 'Tax Config', status: 'Success', ip: '192.168.1.88', details: 'Updated GST rate from 18% to 12%' },
    { id: 'LOG-8887', date: '18 Jul 2026, 06:10 PM', actor: 'Charudatta Warke', role: 'Admin', action: 'Login', entity: 'Session', status: 'Success', ip: '192.168.1.45', details: 'Successful login from new device' },
    { id: 'LOG-8886', date: '18 Jul 2026, 09:05 AM', actor: 'System', role: 'System', action: 'Payment Gateway', entity: 'PAY-776', status: 'Warning', ip: 'External', details: 'Payment delayed response from provider' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium"><CheckCircle2 size={12} /> Success</span>;
      case 'Failed':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium"><XCircle size={12} /> Failed</span>;
      case 'Warning':
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-medium"><AlertCircle size={12} /> Warning</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail</h1>
          <p className="text-sm text-slate-400 mt-1">System-wide immutable log of all activities and transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Total Entries: <span className="text-white font-bold">33,492</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg transition-colors text-sm font-medium">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02]">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Log ID, Actor, or Entity..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select className="bg-slate-900/50 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 w-full sm:w-auto">
              <option>All Actions</option>
              <option>Create</option>
              <option>Update</option>
              <option>Delete</option>
              <option>Login</option>
            </select>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg transition-colors text-sm w-full sm:w-auto shrink-0">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Log ID & Date</th>
                <th className="px-6 py-4 font-medium">Actor</th>
                <th className="px-6 py-4 font-medium">Action & Entity</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-emerald-400 font-medium">{log.id}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock size={10} /> {log.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300">
                        {log.role === 'System' ? <Settings size={14} /> : <User size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{log.actor}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{log.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200">{log.action}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <FileText size={10} /> {log.entity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-white/5 opacity-0 group-hover:opacity-100 focus:opacity-100" title={log.details}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 bg-white/[0.01]">
          <div>Showing 1 to 6 of 33,492 entries</div>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50" disabled><ChevronLeft size={16} /></button>
            <button className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-medium border border-emerald-500/30">1</button>
            <button className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors">2</button>
            <button className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors">3</button>
            <span>...</span>
            <button className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors">558</button>
            <button className="p-1 hover:bg-white/10 rounded transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

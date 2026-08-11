"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator,
  Plus,
  ToggleRight,
  ToggleLeft,
  X,
  History,
  AlertCircle
} from 'lucide-react';

export default function TaxConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeTaxes = [
    { name: 'Standard GST', rate: 18, code: 'SAC: 9992', desc: 'Standard rate for educational services', status: true },
    { name: 'Book Sale GST', rate: 5, code: 'HSN: 4901', desc: 'Printed books and materials', status: true },
    { name: 'Nil Rated (Exempt)', rate: 0, code: 'SAC: 99929', desc: 'Specific exempt courses', status: false },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="text-emerald-400" /> Tax Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage global tax rates, HSN/SAC codes, and effective ledgers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> New Tax Config
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTaxes.map((tax, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className={`glass-panel rounded-2xl p-6 border ${tax.status ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5 opacity-70'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold ${tax.status ? 'text-white' : 'text-slate-300'}`}>{tax.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">{tax.code}</p>
              </div>
              <button className={`p-1 -mr-2 -mt-2 transition-colors ${tax.status ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-400'}`}>
                {tax.status ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
            
            <div className="flex items-end gap-2 mb-4">
              <span className={`text-4xl font-black ${tax.status ? 'text-emerald-400' : 'text-slate-500'}`}>{tax.rate}%</span>
            </div>
            
            <p className="text-sm text-slate-400 min-h-[40px]">{tax.desc}</p>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
              <span>Applied to 42 fee heads</span>
              <button className="hover:text-emerald-400 transition-colors">Edit</button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <History size={18} className="text-blue-400" /> Tax Ledger History
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Effective Date</th>
                <th className="px-6 py-4 font-medium">Tax Name</th>
                <th className="px-6 py-4 font-medium">Rate</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Changed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { date: '01 Apr 2026', name: 'Standard GST', rate: '18%', action: 'Rate Update (15% -> 18%)', user: 'Admin' },
                { date: '01 Jan 2026', name: 'Book Sale GST', rate: '5%', action: 'Created New Rule', user: 'System' },
                { date: '15 Aug 2025', name: 'Service Tax', rate: '15%', action: 'Deactivated', user: 'Admin' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">{log.date}</td>
                  <td className="px-6 py-4 font-medium text-white">{log.name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">{log.rate}</td>
                  <td className="px-6 py-4 text-slate-400">{log.action}</td>
                  <td className="px-6 py-4 text-slate-500">{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator size={20} className="text-emerald-400" /> New Tax Config
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax Rule Name *</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Standard GST 18%" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax Rate (%) *</label>
                    <div className="relative">
                      <input type="number" className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-4 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" placeholder="18.0" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">HSN / SAC Code</label>
                    <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono" placeholder="SAC: 9992" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                  <textarea rows={2} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 custom-scrollbar" placeholder="Description..."></textarea>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={20} className="text-orange-400 shrink-0" />
                  <p className="text-xs text-orange-200">Warning: Changes to tax rules will only apply to invoices generated after the change. Past invoices remain unaffected.</p>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">Create Tax Rule</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

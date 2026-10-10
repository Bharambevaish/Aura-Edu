"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Settings,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react';

export default function BranchConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const branches = [
    { 
      name: 'Main Branch', 
      code: 'BR-MAIN',
      type: 'Headquarters',
      address: 'Tech Hub Building, Andheri East, Mumbai',
      phone: '+91 98765 43210',
      email: 'main@myedou.com',
      capacity: 1200,
      activeStudents: 845,
      status: 'Active',
      modules: ['All Modules Enabled'],
      color: 'blue'
    },
    { 
      name: 'Mumbai Branch', 
      code: 'BR-MUM01',
      type: 'Sub-Branch',
      address: 'Knowledge Park, Vashi, Navi Mumbai',
      phone: '+91 98765 12345',
      email: 'mumbai@myedou.com',
      capacity: 800,
      activeStudents: 403,
      status: 'Active',
      modules: ['LMS', 'Finance', 'ConnectSuite'],
      color: 'emerald'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="text-emerald-400" /> Branch Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage multiple centers, their capacities, and operational settings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20"
        >
          <Plus size={16} /> Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${branch.color}-500/20 border border-${branch.color}-500/30 text-${branch.color}-400 shadow-lg`}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {branch.name}
                    {branch.status === 'Active' && <CheckCircle2 size={16} className="text-emerald-400" />}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/10">{branch.code}</span>
                    <span className="text-xs text-slate-500">{branch.type}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/5">
                <Settings size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-300">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-300">{branch.email}</span>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1"><Users size={12}/> Capacity</span>
                    <span className="text-white font-medium">{branch.activeStudents} / {branch.capacity}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-${branch.color}-500 rounded-full`} style={{ width: `${(branch.activeStudents/branch.capacity)*100}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Module Access</h4>
                  <div className="flex flex-wrap gap-1">
                    {branch.modules.map((mod, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/10">{mod}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-500">Last updated: 12 Jan 2026</span>
              <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Manage Branch Details</button>
            </div>
          </motion.div>
        ))}
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
              className="relative w-full max-w-3xl glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-400" /> Add New Branch
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Basic Info */}
                <section>
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">1. Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch Name *</label>
                      <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Pune Branch" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch Code *</label>
                      <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono uppercase" placeholder="BR-PUN" />
                    </div>
                  </div>
                </section>

                {/* Address & Contact */}
                <section>
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">2. Address & Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Address</label>
                      <textarea rows={2} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 custom-scrollbar" placeholder="Enter full address..."></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Phone</label>
                        <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="+91" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Email</label>
                        <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="branch@myedou.com" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Operations & Access */}
                <section>
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">3. Operations & Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Maximum Capacity (Students)</label>
                      <input type="number" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Timezone</label>
                      <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                        <option>Asia/Kolkata (IST)</option>
                        <option>America/New_York (EST)</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-medium text-slate-300">Module Access</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          'LMS Core & Student Mgt',
                          'Finance & Accounts',
                          'ConnectSuite (Chat & Meetings)',
                          'Advanced Analytics'
                        ].map((mod, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-slate-900/30 cursor-pointer hover:bg-white/5 transition-colors group">
                            <div className="w-5 h-5 rounded flex items-center justify-center border border-slate-600 group-hover:border-slate-500 bg-transparent transition-colors">
                              {/* Using unchecked visual for demo, could be state driven */}
                            </div>
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{mod}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">Create Branch</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

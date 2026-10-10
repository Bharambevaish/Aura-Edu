"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  User, 
  ChevronDown, 
  Check, 
  ShieldAlert,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function StaffPermissionPage() {
  const [activeStaff, setActiveStaff] = useState('Ritu Sharma');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'LMS Operations': true,
    'Finance': false,
  });

  const staffList = [
    { name: 'Ritu Sharma', role: 'Manager', selected: true },
    { name: 'Amit Joshi', role: 'Staff', selected: false },
    { name: 'Priya Desai', role: 'Counselor', selected: false },
    { name: 'Rahul Sharma', role: 'Faculty', selected: false },
  ];

  const modules = [
    {
      name: 'LMS Operations',
      permissions: [
        { name: 'View Students', granted: true },
        { name: 'Edit Students', granted: true },
        { name: 'Delete Students', granted: false },
        { name: 'Manage Courses', granted: true },
        { name: 'Schedule Meetings', granted: true },
      ]
    },
    {
      name: 'Finance & Accounts',
      permissions: [
        { name: 'View Invoices', granted: true },
        { name: 'Create Invoices', granted: false },
        { name: 'Approve Expenses', granted: false },
        { name: 'View Audit Trail', granted: false },
      ]
    },
    {
      name: 'Reports & Analytics',
      permissions: [
        { name: 'View Dashboards', granted: true },
        { name: 'Export Reports', granted: true },
        { name: 'Legacy Analytics', granted: false },
      ]
    },
    {
      name: 'Master Data & Settings',
      permissions: [
        { name: 'Manage Master Data', granted: false },
        { name: 'Global Settings', granted: false },
        { name: 'Branch Config', granted: false },
      ]
    }
  ];

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" /> Role & Permission Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Granular access control for staff members across all modules.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Left sidebar - Staff List */}
        <div className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden shrink-0 hidden md:flex">
          <div className="p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {staffList.map((staff, i) => (
              <button 
                key={i}
                onClick={() => setActiveStaff(staff.name)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                  activeStaff === staff.name ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${activeStaff === staff.name ? 'text-emerald-400' : 'text-white'}`}>
                    {staff.name}
                  </h4>
                  <p className="text-xs text-slate-500">{staff.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Permissions Matrix */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shadow-lg">
                RS
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ritu Sharma</h2>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">Role: Manager</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Grant All</button>
              <div className="w-px h-4 bg-white/10"></div>
              <button className="text-sm text-red-400 hover:text-red-300 font-medium">Revoke All</button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {modules.map((mod, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/30">
                <button 
                  onClick={() => toggleModule(mod.name)}
                  className="w-full flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <span className="font-semibold text-white">{mod.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 hidden sm:inline-block">
                      {mod.permissions.filter(p => p.granted).length}/{mod.permissions.length} granted
                    </span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${expandedModules[mod.name] ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedModules[mod.name] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mod.permissions.map((perm, j) => (
                          <label key={j} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                              perm.granted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-slate-500 bg-transparent'
                            }`}>
                              {perm.granted && <Check size={12} className="text-[#070B14]" />}
                            </div>
                            <span className={`text-sm transition-colors ${perm.granted ? 'text-slate-200 font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                              {perm.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-3">
              <ShieldAlert size={20} className="text-orange-400 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-orange-400 mb-1">Administrative Privileges</h4>
                <p className="text-xs text-orange-200">Granting &apos;Manage Master Data&apos; or &apos;Global Settings&apos; gives this user administrative control over the entire workspace. Proceed with caution.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

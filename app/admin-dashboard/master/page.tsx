"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function MasterDataCenterPage() {
  const [activeTab, setActiveTab] = useState('Class');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    'Class', 'Department', 'Designation', 'Lead For', 'Lead Source', 
    'Course Duration', 'Semester & Year', 'College'
  ];

  // Mock data generator for tables
  const generateMockData = (type: string) => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `${type.toUpperCase().substring(0, 3)}-00${i + 1}`,
      name: `Sample ${type} ${i + 1}`,
      status: i % 3 === 0 ? 'Inactive' : 'Active',
      addedBy: 'Admin',
      date: '19 Jul 2026'
    }));
  };

  const data = generateMockData(activeTab);

  const getModalContent = () => {
    switch (activeTab) {
      case 'College':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">College Name *</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Enter college name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">University/Board</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="Enter university" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
              <textarea rows={2} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none custom-scrollbar" placeholder="Enter full address"></textarea>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">State</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">PIN Code</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Person Email</label>
              <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="email@college.edu" />
            </div>
          </div>
        );
      case 'Semester & Year':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Type *</label>
                <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option>Semester</option>
                  <option>Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Number/Name *</label>
                <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. 1, 2, First Year" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea rows={2} className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none custom-scrollbar" placeholder="Description"></textarea>
            </div>
          </div>
        );
      default:
        // Generic modal for Class, Department, Designation, Lead For, Lead Source, Duration
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{activeTab} Name *</label>
              <input 
                type="text" 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" 
                placeholder={`Enter ${activeTab.toLowerCase()} name`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
              <textarea 
                rows={3} 
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none custom-scrollbar" 
                placeholder="Enter description"
              ></textarea>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-300">Status:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" defaultChecked className="text-emerald-500 bg-slate-900 border-white/10" />
                  <span className="text-sm text-white">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" className="text-emerald-500 bg-slate-900 border-white/10" />
                  <span className="text-sm text-slate-400">Inactive</span>
                </label>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="text-emerald-400" /> Master Data Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage all central reference data, classifications, and parameters.</p>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-xl flex overflow-x-auto custom-scrollbar gap-2 bg-white/[0.02]">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.02]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20 w-full sm:w-auto"
          >
            <Plus size={16} /> Add {activeTab}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">{activeTab} Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Added By</th>
                <th className="px-6 py-4 font-medium">Added On</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono text-emerald-400 font-medium">{row.id}</td>
                  <td className="px-6 py-4 text-slate-200 font-medium">{row.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {row.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.addedBy}</td>
                  <td className="px-6 py-4 text-slate-400">{row.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/5">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-white/5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm text-slate-400 bg-white/[0.01]">
          <div>Showing 1 to 5 of 24 entries</div>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded hover:bg-white/10 transition-colors">Prev</button>
            <button className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30">1</button>
            <button className="px-2 py-1 rounded hover:bg-white/10 transition-colors">2</button>
            <button className="px-2 py-1 rounded hover:bg-white/10 transition-colors">Next</button>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
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
              className="relative w-full max-w-lg lg:max-w-xl glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Database size={20} className="text-emerald-400" />
                  Add New {activeTab}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {getModalContent()}
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
                  Save {activeTab}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw,
  Search,
  Edit,
  Trash2,
  Tag,
  FolderOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function ExpenseCategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 1, name: 'Stationery Material', description: 'Office stationery, pens, papers, and supplies', count: 1, status: 'Active' },
    { id: 2, name: 'Admin Maintenance', description: 'Office maintenance, repairs, and admin costs', count: 1, status: 'Active' },
    { id: 3, name: 'Travel Expenses', description: 'Staff and guest travel, conveyance, and fuel', count: 1, status: 'Active' },
    { id: 4, name: 'Utilities', description: 'Electricity, water, internet, and phone bills', count: 0, status: 'Active' },
    { id: 5, name: 'Marketing', description: 'Advertising, promotions, and marketing materials', count: 0, status: 'Inactive' },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <Tag size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Expense Categories</h1>
            <p className="text-sm text-slate-400 mt-0.5">Organize expenses by category for better tracking and reporting.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL CATEGORIES</h3>
          <p className="text-2xl font-bold text-white">5</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">ACTIVE</h3>
          <p className="text-2xl font-bold text-white">4</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">INACTIVE</h3>
          <p className="text-2xl font-bold text-white">1</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full pl-9 pr-3 py-2 bg-[#171717] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-5">CATEGORY NAME</th>
              <th className="py-3 px-5">DESCRIPTION</th>
              <th className="py-3 px-5">EXPENSES</th>
              <th className="py-3 px-5">STATUS</th>
              <th className="py-3 px-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-purple-900/20 rounded">
                      <FolderOpen size={14} className="text-purple-400" />
                    </div>
                    <span className="font-bold text-white">{cat.name}</span>
                  </div>
                </td>
                <td className="py-4 px-5 text-xs text-slate-400">{cat.description}</td>
                <td className="py-4 px-5">
                  <span className="px-2 py-0.5 bg-[#262626] text-slate-300 text-xs font-bold rounded">{cat.count}</span>
                </td>
                <td className="py-4 px-5">
                  {cat.status === 'Active' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                      <CheckCircle size={12} /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-400">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit"><Edit size={14} /></button>
                    <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Add Category</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#262626]">
                <span className="text-lg">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category Name</label>
                <input type="text" placeholder="e.g. Office Supplies" className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Brief description of this category" className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-y"></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked id="catActive" className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label htmlFor="catActive" className="text-sm font-medium text-slate-300 cursor-pointer">Category is active</label>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#111111]">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-[#262626] text-slate-300 rounded-lg font-medium transition-colors text-sm">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

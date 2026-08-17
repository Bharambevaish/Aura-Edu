"use client";

import React from 'react';
import Link from 'next/link';
import { X, Calendar, Info } from 'lucide-react';

export default function CreateBatchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Create New Batch</h2>
            <p className="text-sm text-slate-400 mt-1">Create a batch first, then add students later</p>
          </div>
          <Link href="/admin-dashboard/students/batches" className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#262626]">
            <X size={20} />
          </Link>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Batch Name <span className="text-red-400">*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g., Full Stack Development Batch 2026" 
                className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Capacity
              </label>
              <input 
                type="text" 
                placeholder="30" 
                className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description
            </label>
            <textarea 
              placeholder="Brief description of the batch" 
              rows={4}
              className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Start Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="18-07-2026" 
                  className="w-full pl-4 pr-10 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                End Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="18-10-2026" 
                  className="w-full pl-4 pr-10 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
            <Info size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-1">Next Steps</h4>
              <p className="text-sm text-blue-300/80 leading-relaxed">
                After creating the batch, you'll be able to add students and assign courses from the batch management interface.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-between gap-4">
          <Link href="/admin-dashboard/students/batches" className="flex-1">
            <button className="w-full px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-[#262626] text-slate-300 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </Link>
          <button className="flex-1 px-6 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium transition-colors shadow-sm">
            Create Batch
          </button>
        </div>
      </div>
    </div>
  );
}

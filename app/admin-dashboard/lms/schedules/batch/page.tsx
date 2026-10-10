"use client";

import React from 'react';
import { 
  RefreshCw,
  Search,
  Filter,
  Users,
  CheckCircle,
  Calendar,
  CalendarX,
  Monitor,
  ChevronDown
} from 'lucide-react';

export default function BatchwiseSchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Batch Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">Review class schedules, upcoming dates, and linked live sessions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors shadow-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400" />
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">TOTAL BATCHES</h3>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        <div className="bg-slate-900/50 border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider">ACTIVE</h3>
          </div>
          <p className="text-2xl font-bold text-white">3</p>
        </div>
        <div className="bg-slate-900/50 border border-emerald-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-emerald-400" />
            <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">WITH SCHEDULE</h3>
          </div>
          <p className="text-2xl font-bold text-white">1</p>
        </div>
        <div className="bg-slate-900/50 border border-orange-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CalendarX size={14} className="text-orange-400" />
            <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">WITHOUT SCHEDULE</h3>
          </div>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
        <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={14} className="text-cyan-400" />
            <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">LIVE SESSIONS</h3>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search batch or course" 
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Filter size={16} className="text-slate-500" />
          <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All schedule states</option>
            <option>With Schedule</option>
            <option>Without Schedule</option>
          </select>
        </div>
      </div>

      {/* Batch List */}
      <div className="space-y-4">
        
        {/* Batch Item 1 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-white text-base">JEE Batch A</h3>
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-900">active</span>
                <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-[10px] font-bold rounded border border-orange-900">No schedule</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-900/50 text-blue-400 rounded font-medium border border-slate-700">JEE</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-500" /> 2 / 30 students</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> 01 Jan 2026 - 30 Nov 2026</span>
              </div>
            </div>
            <button className="p-1 text-slate-500 group-hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Batch Item 2 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-white text-base">NEET Batch A</h3>
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-900 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> active
                </span>
                <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-[10px] font-bold rounded border border-orange-900">No schedule</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-900/50 text-purple-400 rounded font-medium border border-slate-700">NEET</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-500" /> 1 / 30 students</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> 01 Jan 2026 - 07 Dec 2026</span>
              </div>
            </div>
            <button className="p-1 text-slate-500 group-hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

        {/* Batch Item 3 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors cursor-pointer group">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-white text-base">Python Programming</h3>
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-900">active</span>
                <span className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-[10px] font-bold rounded border border-emerald-900">Schedule set</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="px-2 py-1 bg-slate-900/50 text-blue-400 rounded font-medium border border-slate-700">JEE</span>
                <span className="flex items-center gap-1.5"><Users size={14} className="text-slate-500" /> 1 / 30 students</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-500" /> 01 Jan 2026 - 30 Sept 2026</span>
              </div>
            </div>
            <button className="p-1 text-slate-500 group-hover:text-white transition-colors">
              <ChevronDown size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

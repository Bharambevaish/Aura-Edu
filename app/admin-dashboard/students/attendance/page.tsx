"use client";

import React from 'react';
import { 
  Download, 
  CheckSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  CalendarCheck,
  Calendar,
  Search
} from 'lucide-react';

export default function AttendanceManagementPage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Attendance Management</h1>
          <p className="text-sm text-slate-400 mt-1">Track and manage student attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-800/50 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <CheckSquare size={16} />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-blue-900/30 text-blue-400 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">TOTAL</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-green-900/30 text-green-400 rounded-lg">
            <CheckCircle size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">PRESENT</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-[#171717] border border-rose-900/50 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-rose-900/30 text-rose-400 rounded-lg">
            <XCircle size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">ABSENT</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-amber-900/30 text-amber-400 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">LATE</h3>
            <p className="text-xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2.5 bg-slate-800 text-slate-400 rounded-lg">
            <CalendarCheck size={20} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">ATTENDANCE</h3>
            <p className="text-xl font-bold text-white">0%</p>
          </div>
        </div>
      </div>

      {/* Filters & Actions Section */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Batch Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Batch</label>
            <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
              <option>Select Batch</option>
              <option>JEE BATCH</option>
              <option>Python Programming</option>
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="18-07-2026" 
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              />
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          
          {/* Search Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
            <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
              <option>All Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-transparent border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            Mark All Present
          </button>
          <button className="px-4 py-2 bg-transparent border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl min-h-[300px] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Select a batch to view attendance</p>
      </div>
    </div>
  );
}

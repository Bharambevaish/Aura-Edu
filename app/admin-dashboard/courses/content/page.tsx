"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Search,
  LayoutGrid,
  List,
  BookOpen,
  CheckCircle,
  EyeOff,
  Layers,
  FileText,
  Filter,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';

export default function CourseContentPage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Course Content Studio</h1>
          <p className="text-sm text-slate-400 mt-1">Create & manage courses, modules and lessons.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            href="/admin-dashboard/courses/content/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Course
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL COURSES</span>
          </div>
          <p className="text-xl font-bold text-blue-400">4</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE</span>
          </div>
          <p className="text-xl font-bold text-green-400">4</p>
        </div>
        <div className="bg-[#171717] border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <EyeOff size={14} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">INACTIVE</span>
          </div>
          <p className="text-xl font-bold text-slate-300">0</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-purple-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MODULES</span>
          </div>
          <p className="text-xl font-bold text-purple-400">1</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-amber-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LESSONS</span>
          </div>
          <p className="text-xl font-bold text-amber-400">0</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Filter size={14} className="text-red-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SHOWING</span>
          </div>
          <p className="text-xl font-bold text-red-400">4</p>
        </div>
      </div>

      {/* Filters & Actions Section */}
      <div className="bg-[#171717] border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
          <select className="w-full max-w-[200px] px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1"><BookOpen size={14} /> 4 courses</span>
          <div className="flex items-center bg-[#0a0a0a] border border-slate-700 rounded-lg p-0.5">
            <button className="px-3 py-1 bg-[#262626] text-blue-400 font-medium rounded text-xs shadow-sm flex items-center gap-1">
              <LayoutGrid size={14} /> Grid
            </button>
            <button className="px-3 py-1 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center gap-1 transition-colors">
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Course 1 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="h-32 bg-gradient-to-r from-orange-500 to-amber-500 relative flex items-center justify-center p-4">
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a0a0a]/50 backdrop-blur-sm text-white text-[10px] font-bold rounded">active</span>
            <div className="text-center">
              <h3 className="font-bold text-white text-lg leading-tight uppercase italic drop-shadow-md">UPSC TOPPERS</h3>
              <p className="text-white text-xs font-bold drop-shadow-md">20% PYQS - 80% PERFORMANCE!</p>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-white text-sm mb-1">Prarambh Batch</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">PBH++</p>
            
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-auto">
              <span className="flex items-center gap-1"><Clock size={12} /> 6 Months</span>
              <span className="flex items-center gap-1"><Layers size={12} /> 0 modules</span>
              <span className="flex items-center gap-1"><FileText size={12} /> 0 lessons</span>
            </div>
          </div>
          <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2 bg-[#0a0a0a]/50">
            <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Course 2 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="h-32 bg-slate-800 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a0a0a]/50 backdrop-blur-sm text-white text-[10px] font-bold rounded z-10">active</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80 z-0"></div>
            <h3 className="font-bold text-white text-2xl z-10 drop-shadow-lg">COURSE for JEE</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-white text-sm mb-1">JEE</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">COURSE-JEE</p>
            
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-auto">
              <span className="flex items-center gap-1"><Clock size={12} /> 1 Year</span>
              <span className="flex items-center gap-1"><Layers size={12} /> 0 modules</span>
              <span className="flex items-center gap-1"><FileText size={12} /> 0 lessons</span>
            </div>
          </div>
          <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2 bg-[#0a0a0a]/50">
            <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Course 3 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="h-32 bg-slate-800 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a0a0a]/50 backdrop-blur-sm text-white text-[10px] font-bold rounded z-10">active</span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-400 opacity-90 z-0"></div>
            <h3 className="font-bold text-blue-900 text-3xl z-10 drop-shadow-md tracking-wider">NEET</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-white text-sm mb-1">NEET</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">COURSE-NEET</p>
            
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-auto">
              <span className="flex items-center gap-1"><Clock size={12} /> 1 Year</span>
              <span className="flex items-center gap-1"><Layers size={12} /> 0 modules</span>
              <span className="flex items-center gap-1"><FileText size={12} /> 0 lessons</span>
            </div>
          </div>
          <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2 bg-[#0a0a0a]/50">
            <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Course 4 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-700 transition-colors">
          <div className="h-32 bg-slate-900 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#0a0a0a]/50 backdrop-blur-sm text-white text-[10px] font-bold rounded z-10">active</span>
            <div className="flex gap-2 z-10">
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center text-green-500 font-bold">M</div>
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-white font-bold">E</div>
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center text-cyan-500 font-bold">R</div>
              <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-green-400 flex items-center justify-center text-green-400 font-bold">N</div>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-white text-sm mb-1">MERN-Demo</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">MD01</p>
            
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-auto">
              <span className="flex items-center gap-1"><Clock size={12} /> 3 Months</span>
              <span className="flex items-center gap-1"><Layers size={12} /> 1 modules</span>
              <span className="flex items-center gap-1"><FileText size={12} /> 0 lessons</span>
            </div>
          </div>
          <div className="border-t border-slate-800 px-4 py-3 flex justify-end gap-2 bg-[#0a0a0a]/50">
            <button className="text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit size={14} />
            </button>
            <button className="text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

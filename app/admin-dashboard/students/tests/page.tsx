"use client";

import React, { useState } from 'react';
import { 
  RefreshCw, 
  Plus, 
  Search,
  Video,
  BarChart2,
  Edit,
  Copy,
  Download,
  Trash2
} from 'lucide-react';

export default function TestManagementPage() {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Test Management</h1>
          <p className="text-sm text-slate-500 mt-1">Batch-wise test assignment, scheduling, reporting, and exports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} />
            Create Test
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#f0f7ff] border border-blue-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">TOTAL TESTS</h3>
          <p className="text-2xl font-bold text-blue-600">1</p>
        </div>
        <div className="bg-[#fff9eb] border border-amber-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">TOTAL ATTEMPTS</h3>
          <p className="text-2xl font-bold text-amber-500">1</p>
        </div>
        <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">COMPLETED</h3>
          <p className="text-2xl font-bold text-green-500">1</p>
        </div>
        <div className="bg-[#faf5ff] border border-purple-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">PASS RATE</h3>
          <p className="text-2xl font-bold text-purple-600">100%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search test name or description" 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-slate-600 min-w-[140px]">
          <option>All Status</option>
          <option>Completed</option>
          <option>Active</option>
          <option>Upcoming</option>
        </select>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-slate-600 min-w-[140px]">
          <option>All Courses</option>
        </select>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-slate-600 min-w-[140px]">
          <option>All Batches</option>
        </select>
        <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 text-slate-600 min-w-[140px]">
          <option>Export...</option>
          <option>PDF</option>
          <option>CSV</option>
        </select>
      </div>

      {/* Test List */}
      <div className="grid grid-cols-1 gap-4">
        {/* Test Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm max-w-3xl">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-base font-semibold text-slate-800">#1 Aptitude Test</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md border border-slate-200">
              COMPLETED
            </span>
          </div>
          
          <p className="text-sm text-slate-500 mb-3">JEE, JEE BATCH</p>
          
          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            JEE Aptitude Test is intended to evaluate a student's problem-solving ability, logical reasoning, analytical thinking and quantitative aptitude. The test checks the student's speed, accuracy and approach towards solving aptitude based questions to determine his...
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 bg-[#f0f7ff] text-blue-600 text-xs font-medium rounded">10 marks</span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">30 min</span>
            <span className="px-2.5 py-1 bg-[#faf5ff] text-purple-600 text-xs font-medium rounded">1 attempt</span>
            <span className="px-2.5 py-1 bg-[#f0fdf4] text-green-600 text-xs font-medium rounded">pass {'>'} 0</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="text-xs text-slate-400 space-y-1">
              <p>Starts: 6/1/2026, 12:10:00 PM</p>
              <p>Ends: 7/12/2026, 12:51:00 PM</p>
            </div>
            
            <div className="flex gap-2">
              <button className="p-1.5 text-purple-500 bg-purple-50 hover:bg-purple-100 rounded border border-purple-100 transition-colors" title="Video/Meeting">
                <Video size={16} />
              </button>
              <button className="p-1.5 text-purple-500 bg-purple-50 hover:bg-purple-100 rounded border border-purple-100 transition-colors" title="Reports">
                <BarChart2 size={16} />
              </button>
              <button className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors" title="Edit">
                <Edit size={16} />
              </button>
              <button className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded border border-blue-100 transition-colors" title="Duplicate">
                <Copy size={16} />
              </button>
              <button className="p-1.5 text-green-500 bg-green-50 hover:bg-green-100 rounded border border-green-100 transition-colors" title="Download">
                <Download size={16} />
              </button>
              <button className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

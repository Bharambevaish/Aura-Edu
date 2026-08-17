"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Filter, 
  LayoutGrid, 
  List,
  Eye,
  Edit,
  CheckCircle,
  BarChart2,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';

export default function AssignmentManagementPage() {
  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assignment Management</h1>
          <p className="text-sm text-slate-500 mt-1">Plan, track and grade across the full assignment lifecycle.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            href="/admin-dashboard/students/assignments/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Assignment
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <LayoutGrid size={16} />
            Workspace
          </button>
          <div className="flex items-center bg-slate-900 rounded-lg p-1">
            <button className="px-3 py-1.5 bg-slate-800 text-white rounded shadow-sm flex items-center gap-2 text-sm font-medium">
              <List size={16} />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">TOTAL</h3>
          <p className="text-xl font-bold text-slate-800">1</p>
        </div>
        <div className="bg-[#f8f9fa] border border-slate-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">DRAFT</h3>
          <p className="text-xl font-bold text-slate-600">0</p>
        </div>
        <div className="bg-[#f0f7ff] border border-blue-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">ACTIVE</h3>
          <p className="text-xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-[#fff9eb] border border-amber-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">DUE TODAY</h3>
          <p className="text-xl font-bold text-amber-500">0</p>
        </div>
        <div className="bg-[#faf5ff] border border-purple-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">SUBMITTED</h3>
          <p className="text-xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-[#fff1f2] border border-red-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">PENDING REVIEW</h3>
          <p className="text-xl font-bold text-red-500">0</p>
        </div>
        <div className="bg-[#f0fdf4] border border-green-100 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">COMPLETED</h3>
          <p className="text-xl font-bold text-green-500">1</p>
        </div>
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Assignment Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-base font-bold text-slate-800">Chapter 1</h2>
            <button className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors">
              <LinkIcon size={12} />
              Link
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mb-4">JEE, JEE BATCH</p>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded border border-red-100 flex items-center gap-1">
                <Calendar size={12} />
                Overdue 9d
              </span>
              <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded border border-blue-100">
                4 days
              </span>
            </div>
            <span className="text-green-600 text-[10px] font-bold tracking-widest uppercase border border-green-200 bg-green-50 px-2 py-1 rounded">
              PUBLISHED
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div className="flex gap-4">
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Eye size={14} />
                View
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors">
                <Edit size={14} />
                Edit
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-green-600 transition-colors">
                <CheckCircle size={14} />
                Grade
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors">
              <BarChart2 size={14} />
              Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Users, 
  CheckCircle, 
  Folder, 
  BookOpen, 
  UserPlus,
  Search,
  LayoutDashboard,
  CalendarDays
} from 'lucide-react';

export default function BatchManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Batch Management</h1>
          <p className="text-sm text-slate-400 mt-1">Create batches first, then add students and assign courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <Link 
            href="/admin-dashboard/students/batches/create"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Batch
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Total Students</h3>
            <p className="text-2xl font-bold text-white">10</p>
          </div>
          <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg">
            <Users size={18} />
          </div>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Active Batches</h3>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="p-2 bg-green-900/30 text-green-400 rounded-lg">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Total Batches</h3>
            <p className="text-2xl font-bold text-white">3</p>
          </div>
          <div className="p-2 bg-purple-900/30 text-purple-400 rounded-lg">
            <Folder size={18} />
          </div>
        </div>
        <div className="bg-[#171717] border border-rose-900/50 rounded-xl p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Available Courses</h3>
            <p className="text-2xl font-bold text-white">4</p>
          </div>
          <div className="p-2 bg-rose-900/30 text-rose-400 rounded-lg">
            <BookOpen size={18} />
          </div>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-2">Selected Batch</h3>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="p-2 bg-amber-900/30 text-amber-400 rounded-lg">
            <UserPlus size={18} />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar - Batches List */}
        <div className="w-full lg:w-72 bg-[#171717] border border-slate-800 rounded-xl flex flex-col shadow-sm flex-shrink-0">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Users size={18} className="text-slate-400" />
              Batches
            </div>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">3</span>
          </div>
          <div className="p-3 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by name or capacity..." 
                className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="p-2 flex-1 overflow-y-auto">
            {/* Batch Item 1 */}
            <div className="flex justify-between items-center p-3 hover:bg-[#262626] rounded-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">JEE BATCH</span>
              </div>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-400">2</span>
            </div>
            {/* Batch Item 2 */}
            <div className="flex justify-between items-center p-3 hover:bg-[#262626] rounded-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Python Programming</span>
              </div>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-400">1</span>
            </div>
            {/* Batch Item 3 */}
            <div className="flex justify-between items-center p-3 hover:bg-[#262626] rounded-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">NEET BATCH</span>
              </div>
              <span className="text-xs font-medium text-slate-500 group-hover:text-slate-400">1</span>
            </div>
          </div>
        </div>

        {/* Right Main Area */}
        <div className="flex-1 bg-[#171717] border border-slate-800 rounded-xl shadow-sm flex flex-col min-h-[500px]">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 p-2 gap-2 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#262626]'
              }`}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'students' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#262626]'
              }`}
            >
              <Users size={16} />
              Students <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'courses' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#262626]'
              }`}
            >
              <BookOpen size={16} />
              Courses <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">0</span>
            </button>
            <button 
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'schedule' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#262626]'
              }`}
            >
              <CalendarDays size={16} />
              Schedule
            </button>
          </div>

          {/* Placeholder Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-6 shadow-inner">
              <Users size={36} />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">Batch Management System</h2>
            <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
              Start by creating a batch, then add students and assign courses. Manage everything from one place.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/admin-dashboard/students/batches/create"
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Create New Batch
              </Link>
              <button className="px-6 py-2.5 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 font-medium rounded-lg transition-colors">
                View Batches
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

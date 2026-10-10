"use client";

import React, { useState } from 'react';
import { 
  RefreshCw,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  VideoOff
} from 'lucide-react';

export default function MeetingSchedulePage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: 0 },
    { id: 'in-progress', label: 'In Progress', count: 0 },
    { id: 'completed', label: 'Completed', count: 0 },
    { id: 'all', label: 'All', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Meeting Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">Track upcoming, in-progress, and completed meetings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors shadow-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-blue-900/50 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">UPCOMING</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-green-900/50 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-green-400" />
              <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider">IN PROGRESS</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-purple-900/50 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-purple-400" />
              <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">COMPLETED</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-900/50 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search title, host, meeting ID" 
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm h-64">
        <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4">
          <VideoOff size={32} className="text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No meetings found</h3>
        <p className="text-sm text-slate-500">Try changing the tab or search keywords</p>
      </div>

    </div>
  );
}

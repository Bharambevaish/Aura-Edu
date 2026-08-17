"use client";

import React, { useState } from 'react';
import { 
  RefreshCw, 
  Filter, 
  LayoutGrid, 
  List,
  Users,
  Activity,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Eye
} from 'lucide-react';

export default function TestCardsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { id: 'All', label: 'All', count: 3 },
    { id: 'Strong', label: 'Strong (≥75%)', count: 0 },
    { id: 'Average', label: 'Average (40-75%)', count: 0 },
    { id: 'At Risk', label: 'At Risk (<40%)', count: 1 },
    { id: 'Not Attempted', label: 'Not Attempted', count: 2 },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Student Test Cards</h1>
            <p className="text-sm text-slate-400 mt-0.5">Batch-wise report cards: open a student to preview & download PDF.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <div className="flex items-center bg-[#171717] border border-slate-700 rounded-lg p-0.5">
            <button className="p-1.5 bg-[#262626] text-white rounded shadow-sm">
              <LayoutGrid size={16} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">STUDENTS</span>
          </div>
          <p className="text-xl font-bold text-blue-400">3</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATTEMPTS</span>
          </div>
          <p className="text-xl font-bold text-purple-400">1</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ATTEMPTED</span>
          </div>
          <p className="text-xl font-bold text-green-400">1</p>
        </div>
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NOT ATTEMPTED</span>
          </div>
          <p className="text-xl font-bold text-slate-300">2</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AVG %</span>
          </div>
          <p className="text-xl font-bold text-amber-400">30.00%</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-3 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-red-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TOP %</span>
          </div>
          <p className="text-xl font-bold text-red-400">30.00%</p>
        </div>
      </div>

      {/* Filters/Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-[#171717] text-slate-300 border border-slate-700 hover:bg-[#262626]'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-slate-800'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Card 1 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition-colors shadow-sm">
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-800/50">
                  CW
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Charudatta Warke</h3>
                  <p className="text-xs text-slate-400">chvarke12@gmail.com</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">No attempts</span>
            </div>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Test Card</span>
                <span className="text-slate-300 font-medium">TC-2026-000002</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Batch</span>
                <span className="text-amber-500 font-medium text-xs">JEE BATCH</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Attempts</span>
                <span className="text-slate-300 font-medium">0</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Last attempt</span>
                <span className="text-slate-500">-</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 bg-[#0f0f0f] flex justify-center">
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              <Eye size={16} />
              View
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition-colors shadow-sm">
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold text-sm border border-purple-800/50">
                  RM
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Rohan Mare</h3>
                  <p className="text-xs text-slate-400">rohanmare123@gmail.com</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-400">30.00%</span>
            </div>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Test Card</span>
                <span className="text-slate-300 font-medium">TC-2026-000003</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Batch</span>
                <span className="text-amber-500 font-medium text-xs">JEE BATCH</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Attempts</span>
                <span className="text-slate-300 font-medium">1</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Last attempt</span>
                <span className="text-slate-300">09 Jun 2026</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar for attempted */}
          <div className="w-full h-1 bg-slate-800">
            <div className="h-full bg-red-500" style={{ width: '30%' }}></div>
          </div>

          <div className="border-t border-slate-800 p-3 bg-[#0f0f0f] flex justify-center">
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              <Eye size={16} />
              View
            </button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition-colors shadow-sm">
          <div className="p-4 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-800/50">
                  SM
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">sanket Mule</h3>
                  <p className="text-xs text-slate-400">sanketmule123@gmail.com</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded">No attempts</span>
            </div>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Test Card</span>
                <span className="text-slate-300 font-medium">TC-2026-000004</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Batch</span>
                <span className="text-amber-500 font-medium text-xs">JEE BATCH</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Attempts</span>
                <span className="text-slate-300 font-medium">0</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Last attempt</span>
                <span className="text-slate-500">-</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 bg-[#0f0f0f] flex justify-center">
            <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              <Eye size={16} />
              View
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-4">
        <span className="text-slate-400">Page 1 of 1</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-500 rounded-md font-medium cursor-not-allowed">
            &lt; Previous
          </button>
          <button className="px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-500 rounded-md font-medium cursor-not-allowed">
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  Settings,
  Download,
  Filter,
  PieChart,
  BarChart,
  Activity,
  UserCheck
} from 'lucide-react';

export default function LegacyReportsPage() {
  const [activeTab, setActiveTab] = useState('Admissions');

  const tabs = [
    { id: 'Admissions', icon: GraduationCap },
    { id: 'Inquiries', icon: TrendingUp },
    { id: 'Faculty', icon: Users },
    { id: 'Batches', icon: BookOpen },
    { id: 'Attendance', icon: CalendarCheck },
    { id: 'System', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Detailed Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">Deep-dive reports with visualizations across all operational areas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-white/10 text-white rounded-lg transition-colors text-sm font-medium hover:bg-slate-700">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      <div className="glass-panel p-2 rounded-xl flex overflow-x-auto custom-scrollbar gap-2 bg-white/[0.02]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.id}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Admissions' && <AdmissionsTab />}
          {activeTab === 'Inquiries' && <InquiriesTab />}
          {activeTab === 'System' && <SystemTab />}
          {/* Other tabs can be implemented similarly; falling back to a placeholder for brevity */}
          {!['Admissions', 'Inquiries', 'System'].includes(activeTab) && (
            <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[400px]">
              <PieChart size={48} className="text-slate-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">{activeTab} Analytics</h2>
              <p className="text-slate-400">Detailed reports for {activeTab.toLowerCase()} will appear here.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AdmissionsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KPIs */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Admissions', value: '845', trend: '+12%', color: 'text-emerald-400' },
          { label: 'This Month', value: '124', trend: '+5%', color: 'text-blue-400' },
          { label: 'Conversion Rate', value: '32%', trend: '+2.4%', color: 'text-purple-400' },
          { label: 'Revenue (Adm)', value: '₹2.4M', trend: '+15%', color: 'text-orange-400' },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl">
            <p className="text-sm text-slate-400 font-medium mb-1">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
              <span className={`text-xs font-medium ${kpi.color} bg-white/5 px-2 py-1 rounded`}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Login & Activity Trends</h3>
        <div className="flex-1 border-b border-white/10 flex items-end gap-2 pb-4">
          {[35, 49, 25, 41, 39, 57, 55, 35, 33, 33, 58, 50].map((blueH, i) => {
            const greenH = [64, 93, 76, 58, 67, 71, 80, 45, 87, 70, 58, 45][i];
            return (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
              <div className="w-full bg-blue-500/80 rounded-t-sm transition-all group-hover:brightness-110" style={{ height: `${blueH}%` }}></div>
              <div className="w-full bg-emerald-500/80 rounded-t-sm transition-all group-hover:brightness-110" style={{ height: `${greenH}%` }}></div>
            </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-xs text-slate-500 px-2">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>

      {/* Side List */}
      <div className="glass-panel p-6 rounded-2xl h-[400px] overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Top Performers</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
          {[
            { name: 'Rahul Sharma', score: 98, course: 'JEE Advanced' },
            { name: 'Priya Patel', score: 95, course: 'NEET Bio' },
            { name: 'Amit Singh', score: 92, course: 'JEE Mains' },
            { name: 'Sneha K.', score: 90, course: 'Foundation' },
            { name: 'Vikram Mehta', score: 88, course: 'MERN Stack' },
          ].map((student, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-200 font-medium">{student.name}</span>
                <span className="text-emerald-400 font-bold">{student.score}%</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{student.course}</p>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${student.score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InquiriesTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <PieChart size={18} className="text-orange-400" /> Leads by Source
        </h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-48 h-48 rounded-full border-[16px] border-slate-800 relative">
            <div className="absolute inset-[-16px] border-[16px] border-orange-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)' }}></div>
            <div className="absolute inset-[-16px] border-[16px] border-blue-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
            <div className="absolute inset-[-16px] border-[16px] border-emerald-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">1,204</span>
              <span className="text-xs text-slate-400">Total Leads</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Website (65%)</div>
          <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Referrals (25%)</div>
          <div className="flex items-center gap-2 text-sm text-slate-300"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Walk-in (10%)</div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity size={18} className="text-blue-400" /> Leads by Status
        </h3>
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Count</th>
                <th className="pb-3 font-medium text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { status: 'New Inquiry', count: 345, percent: '28.6%', color: 'text-blue-400' },
                { status: 'Follow-up Scheduled', count: 412, percent: '34.2%', color: 'text-orange-400' },
                { status: 'Trial Class Attended', count: 189, percent: '15.7%', color: 'text-purple-400' },
                { status: 'Converted to Admission', count: 201, percent: '16.7%', color: 'text-emerald-400' },
                { status: 'Lost / Not Interested', count: 57, percent: '4.8%', color: 'text-red-400' },
              ].map((row, i) => (
                <tr key={i}>
                  <td className={`py-4 font-medium ${row.color}`}>{row.status}</td>
                  <td className="py-4 text-right text-white font-mono">{row.count}</td>
                  <td className="py-4 text-right text-slate-400">{row.percent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">99.9%</h2>
          <p className="text-sm text-slate-400">System Uptime</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-white mb-4">Error Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-red-400">500 Server Errors</span><span className="text-white">12</span></div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{width: '15%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-orange-400">404 Not Found</span><span className="text-white">45</span></div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{width: '35%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="text-blue-400">401 Unauthorized</span><span className="text-white">89</span></div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: '50%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-6">Top API Routes Performance</h3>
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Route Path</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium text-right">Avg Response (ms)</th>
                <th className="px-4 py-3 font-medium text-right">Calls (24h)</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { path: '/api/v1/students', method: 'GET', time: '124', calls: '45.2k', status: 'Healthy', color: 'text-emerald-400' },
                { path: '/api/v1/attendance', method: 'POST', time: '342', calls: '12.8k', status: 'Slow', color: 'text-orange-400' },
                { path: '/api/v1/auth/login', method: 'POST', time: '85', calls: '8.4k', status: 'Healthy', color: 'text-emerald-400' },
                { path: '/api/v1/reports/export', method: 'GET', time: '1450', calls: '1.2k', status: 'Warning', color: 'text-red-400' },
                { path: '/api/v1/fees/verify', method: 'POST', time: '412', calls: '3.1k', status: 'Healthy', color: 'text-emerald-400' },
              ].map((route, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-mono text-slate-300">{route.path}</td>
                  <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{route.method}</span></td>
                  <td className="px-4 py-4 text-right font-mono text-white">{route.time}</td>
                  <td className="px-4 py-4 text-right text-slate-400">{route.calls}</td>
                  <td className={`px-4 py-4 font-medium ${route.color}`}>{route.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

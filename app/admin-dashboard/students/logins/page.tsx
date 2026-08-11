"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  RefreshCw, 
  Download, 
  LayoutGrid, 
  List, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Ban, 
  Users,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function StudentLoginsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mockSessions = [
    {
      id: 1,
      name: 'Nikhil Raghuwanshi',
      email: 'nraghuwanshi100@gmail.com',
      status: 'Active',
      course: 'NEET',
      device: 'Chrome on Windows - 1',
      browser: 'Chrome',
      loginTime: '18 Jul 2026, 04:37 pm',
      initials: 'NR',
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      id: 2,
      name: 'Ansh Patthe',
      email: 'anshpatthe1904@gmail.com',
      status: 'Active',
      course: 'MERN - Demo',
      device: 'Chrome on Windows - 1',
      browser: 'Chrome',
      loginTime: '25 Jun 2026, 05:57 pm',
      initials: 'AP',
      color: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      id: 3,
      name: 'Rohan More',
      email: 'katturwarom313@gmail.com',
      status: 'Active',
      course: 'JEE',
      device: 'App (134Hz) on Unknown - 2',
      browser: 'App (134 Hz)',
      loginTime: '20 Jun 2026, 02:00 pm',
      initials: 'RM',
      color: 'bg-purple-500/10 text-purple-400'
    },
    {
      id: 4,
      name: 'Rhinhabh Raghu',
      email: 'nraghuwanshi2707@gmail.com',
      status: 'Active',
      course: 'N/A',
      device: 'Chrome on Windows - 1',
      browser: 'Chrome',
      loginTime: '08 Jun 2026, 03:42 pm',
      initials: 'RR',
      color: 'bg-orange-500/10 text-orange-400'
    },
    {
      id: 5,
      name: 'Charudatta Warke',
      email: 'chwarke121@gmail.com',
      status: 'Active',
      course: 'NEET',
      device: 'Edge on Windows - 3',
      browser: 'Edge',
      loginTime: '08 Jun 2026, 03:28 pm',
      initials: 'CW',
      color: 'bg-pink-500/10 text-pink-400'
    },
    {
      id: 6,
      name: 'Ramkrushna Warke',
      email: 'ramkrushnawarke123@gmail.com',
      status: 'Offline',
      course: 'NEET',
      device: 'N/A - 0',
      browser: 'N/A',
      loginTime: 'Never',
      initials: 'RW',
      color: 'bg-indigo-500/10 text-indigo-400'
    },
    {
      id: 7,
      name: 'sanket Mule',
      email: 'sanketmule3003@gmail.com',
      status: 'Offline',
      course: 'JEE',
      device: 'N/A - 0',
      browser: 'N/A',
      loginTime: 'Never',
      initials: 'SM',
      color: 'bg-teal-500/10 text-teal-400'
    },
    {
      id: 8,
      name: 'Shital Kolekar',
      email: 'shitalkolekar05@gmail.com',
      status: 'Offline',
      course: 'N/A',
      device: 'N/A - 0',
      browser: 'N/A',
      loginTime: 'Never',
      initials: 'SK',
      color: 'bg-rose-500/10 text-rose-400'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Monitor className="text-blue-400" /> Student Logins
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor student sessions, devices, and login activity.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500 hidden md:block">Updated 06:10:55 pm</p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-600/20">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm font-medium">
            <Download size={16} /> Export
          </button>
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Active Sessions</p>
            <p className="text-2xl font-bold text-emerald-400">5</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-4 border border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-400/80 mb-1 uppercase tracking-wider">Multi-Device</p>
            <p className="text-2xl font-bold text-orange-400">2</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <AlertTriangle size={20} className="text-orange-400" />
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-400/80 mb-1 uppercase tracking-wider">Blocked</p>
            <p className="text-2xl font-bold text-red-400">0</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Ban size={20} className="text-red-400" />
          </div>
        </div>
        
        <div className="glass-panel rounded-xl p-4 border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-400/80 mb-1 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-blue-400">10</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users size={20} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search student name, email, or student ID" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-panel border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors bg-white/[0.02]"
          />
        </div>
        <select className="glass-panel border border-white/10 text-sm text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white/[0.02] w-full sm:w-64">
          <option>All Students</option>
          <option>Active Sessions</option>
          <option>Offline</option>
          <option>Blocked</option>
        </select>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockSessions.map((session, index) => (
          <motion.div 
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col group hover:border-white/20 transition-all duration-300"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${session.color} border border-white/5`}>
                  {session.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{session.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{session.email}</p>
                </div>
              </div>
              <div>
                {session.status === 'Active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 bg-black/20">
              <div className="grid grid-cols-[80px_1fr] gap-y-3 gap-x-2 text-sm">
                <div className="text-slate-500 flex items-center gap-2 text-xs">
                  <GraduationCap size={14} className="opacity-70" /> Course
                </div>
                <div className="text-slate-200 font-medium text-right truncate">{session.course}</div>
                
                <div className="text-slate-500 flex items-center gap-2 text-xs">
                  <Smartphone size={14} className="opacity-70" /> Device
                </div>
                <div className="text-slate-200 text-right truncate">{session.device}</div>
                
                <div className="text-slate-500 flex items-center gap-2 text-xs">
                  <Globe size={14} className="opacity-70" /> Browser
                </div>
                <div className="text-slate-200 text-right truncate">{session.browser}</div>
                
                <div className="text-slate-500 flex items-center gap-2 text-xs">
                  <Clock size={14} className="opacity-70" /> Login
                </div>
                <div className="text-slate-200 text-right text-xs truncate">{session.loginTime}</div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="flex border-t border-white/10 bg-white/[0.01]">
              <button className="flex-1 py-3 flex items-center justify-center gap-2 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors border-r border-white/5">
                <Monitor size={14} /> Devices
              </button>
              <button className="flex-1 py-3 flex items-center justify-center gap-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors border-r border-white/5">
                <ShieldAlert size={14} /> Block
              </button>
              <button 
                disabled={session.status === 'Offline'}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
                  session.status === 'Active' 
                    ? 'text-orange-400 hover:bg-orange-500/10' 
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Temporary GraduationCap icon since it wasn't imported at the top
const GraduationCap = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
)

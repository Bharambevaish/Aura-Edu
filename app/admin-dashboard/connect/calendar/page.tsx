"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Video,
  Users,
  BookOpen,
  Clock,
  X
} from 'lucide-react';

export default function CalendarCenterPage() {
  const [view, setView] = useState('Month');
  const [showModal, setShowModal] = useState(false);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Mock calendar grid for July 2026
  const dates = Array.from({ length: 35 }, (_, i) => i - 2); 

  const events = [
    { date: 14, title: 'JEE Physics', type: 'class', time: '10:00 AM' },
    { date: 15, title: 'Staff Sync', type: 'meeting', time: '09:00 AM' },
    { date: 19, title: 'NEET Bio', type: 'class', time: '07:00 PM' },
    { date: 19, title: 'Parent Meeting', type: 'meeting', time: '02:00 PM' },
    { date: 22, title: 'Mock Test 4', type: 'exam', time: '09:00 AM' },
    { date: 28, title: 'Webinar', type: 'event', time: '05:00 PM' },
  ];

  const getEventStyle = (type: string) => {
    switch(type) {
      case 'class': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'meeting': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'exam': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'event': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-emerald-400" /> Calendar Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage schedules, classes, and events across the organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20"
          >
            <Plus size={16} /> New Event
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Calendar Header */}
        <div className="p-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white w-40">July 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Today
              </button>
              <button className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-slate-900 border border-white/10 rounded-lg hidden sm:flex">
              {['Month', 'Week', 'Day', 'Agenda'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    view === v ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-white/10 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        <div className="px-4 py-3 border-b border-white/10 flex flex-wrap gap-2 text-xs bg-slate-900/30">
          <span className="font-medium text-slate-400 mr-2 mt-1">Categories:</span>
          <button className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Classes</button>
          <button className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Meetings</button>
          <button className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Exams</button>
          <button className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Events</button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-slate-900/50">
          <div className="grid grid-cols-7 border-b border-white/10">
            {days.map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-slate-400 border-r border-white/5 last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-[120px]">
            {dates.map((date, i) => {
              const isCurrentMonth = date > 0 && date <= 31;
              const isToday = date === 19;
              const dayEvents = events.filter(e => e.date === date);

              return (
                <div 
                  key={i} 
                  className={`border-r border-b border-white/5 last:border-r-0 p-2 transition-colors hover:bg-white/[0.02] ${
                    !isCurrentMonth ? 'bg-slate-900/80 opacity-40' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${
                      isToday ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20' : 'text-slate-300'
                    }`}>
                      {isCurrentMonth ? date : (date <= 0 ? 30 + date : date - 31)}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1 overflow-y-auto custom-scrollbar h-[70px] pr-1">
                    {dayEvents.map((event, j) => (
                      <div 
                        key={j} 
                        className={`text-[10px] px-1.5 py-1 rounded border truncate font-medium cursor-pointer ${getEventStyle(event.type)}`}
                        title={`${event.title} at ${event.time}`}
                      >
                        {event.time.split(' ')[0]} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white">Create New Event</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Title</label>
                  <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Add title..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                    <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Time</label>
                    <input type="time" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Event Type</label>
                  <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                    <option>Class/Lecture</option>
                    <option>Meeting</option>
                    <option>Exam/Test</option>
                    <option>Other Event</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
                  Save Event
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Settings,
  Shield,
  Link as LinkIcon,
  Copy,
  Plus,
  X,
  Check
} from 'lucide-react';

export default function ScheduleMeetingPage() {
  const [meetingType, setMeetingType] = useState('internal'); // internal, class, webinar

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Schedule Meeting</h1>
        <p className="text-sm text-slate-400 mt-1">Set up a secure virtual meeting, class, or webinar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 space-y-6"
        >
          {/* Basic Details */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Video size={18} className="text-emerald-400" />
              Meeting Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Meeting Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Weekly Staff Sync or JEE Physics Chapter 4" 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Agenda or context for the meeting..." 
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors custom-scrollbar"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" /> Start
                    </label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" /> End
                    </label>
                    <input 
                      type="time" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Participants & Access
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4 p-1 bg-slate-900/50 border border-white/10 rounded-xl">
                {['internal', 'class', 'webinar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setMeetingType(type)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                      meetingType === type ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type === 'class' ? 'Class / Batch' : type}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Add Participants</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name, email, or select a batch..." 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-200">
                  <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold">NT</div>
                  Nilam Thorat
                  <button className="text-slate-400 hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
                  <Users size={12} />
                  JEE BATCH 2026
                  <button className="text-blue-400 hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Security & Settings */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield size={18} className="text-purple-400" />
              Security Options
            </h2>

            <div className="space-y-4">
              {[
                { id: 'ss', label: 'Disable Screenshot', checked: true },
                { id: 'rec', label: 'Disable Screen Recording', checked: true },
                { id: 'share', label: 'Disable Screen Share (Participants)', checked: true },
                { id: 'wm', label: 'Show Watermark', checked: true },
                { id: 'wait', label: 'Enable Waiting Room', checked: false },
                { id: 'mute', label: 'Mute Participants upon Entry', checked: true },
              ].map((setting) => (
                <label key={setting.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    setting.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-slate-500 bg-transparent'
                  }`}>
                    {setting.checked && <Check size={12} className="text-[#070B14]" />}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{setting.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass-panel rounded-2xl p-6">
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-600/20 mb-3">
              Schedule Meeting
            </button>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-xl font-medium transition-colors mb-4">
              Save as Draft
            </button>
            
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1.5">
                <LinkIcon size={12} /> Auto-generated Link
              </p>
              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/50 p-2 rounded">
                <span className="truncate pr-2 font-mono">meet.myedou.com/xyz-abcd-123</span>
                <button className="text-slate-400 hover:text-white"><Copy size={12} /></button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

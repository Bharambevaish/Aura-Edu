"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Video, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  ArrowRight,
  Plus,
  MoreVertical,
  Clock,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ConnectCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ConnectSuite</h1>
          <p className="text-sm text-slate-400 mt-1">Unified communication center for meetings, groups, and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin-dashboard/connect/groups" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg transition-colors text-sm font-medium">
            <MessageSquare size={16} /> New Chat
          </Link>
          <Link href="/admin-dashboard/connect/meetings/schedule" className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20">
            <Video size={16} /> Schedule Meeting
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Groups', icon: Users, desc: 'Manage study groups', href: '/admin-dashboard/connect/groups', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
          { label: 'Meetings', icon: Video, desc: 'Live virtual classes', href: '/admin-dashboard/connect/meetings/schedule', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
          { label: 'Calendar', icon: CalendarIcon, desc: 'View schedule', href: '/admin-dashboard/connect/calendar', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
          { label: 'Broadcasts', icon: MessageSquare, desc: 'Send announcements', href: '#', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        ].map((action, i) => (
          <Link href={action.href} key={i}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group h-full flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{action.label}</h3>
                <p className="text-sm text-slate-400 mt-1">{action.desc}</p>
              </div>
              <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={20} className="text-emerald-400" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Upcoming Meetings</h2>
            <Link href="/admin-dashboard/connect/calendar" className="text-sm text-emerald-400 hover:text-emerald-300">View All</Link>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'JEE Advanced Physics Doubt Session', time: 'Today, 07:00 PM', host: 'Rahul Sharma', attendees: 45, status: 'Starting soon' },
              { title: 'NEET Biology Chapter 4 Revision', time: 'Tomorrow, 10:00 AM', host: 'Dr. Priya Patel', attendees: 120, status: 'Scheduled' },
              { title: 'Staff Weekly Sync', time: 'Monday, 09:00 AM', host: 'Charudatta Warke', attendees: 12, status: 'Scheduled' },
            ].map((meeting, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold uppercase">{meeting.time.split(',')[0]}</span>
                    <span className="text-lg font-bold">{meeting.time.split(' ')[1]}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{meeting.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1"><User size={12} /> {meeting.host}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {meeting.attendees}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors border border-white/10 flex items-center gap-1.5">
                    <LinkIcon size={12} /> Copy Link
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Active Groups</h2>
            <button className="text-slate-400 hover:text-white p-1 rounded transition-colors"><Plus size={18} /></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'JEE BATCH 2026', unread: 24, lastMsg: 'Don\'t forget tomorrow\'s test', time: '10:45 AM', color: 'bg-blue-500' },
              { name: 'NEET Foundation', unread: 0, lastMsg: 'Notes uploaded in portal', time: 'Yesterday', color: 'bg-green-500' },
              { name: 'Staff Updates', unread: 3, lastMsg: 'New holiday schedule', time: '12:30 PM', color: 'bg-purple-500' },
              { name: 'MERN Stack 101', unread: 0, lastMsg: 'React hooks assignment', time: 'Monday', color: 'bg-orange-500' },
            ].map((group, i) => (
              <Link href="/admin-dashboard/connect/groups" key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors flex items-start gap-3 group/item">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${group.color}`}>
                  {group.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white truncate pr-2">{group.name}</h4>
                    {group.unread > 0 && (
                      <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {group.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{group.lastMsg}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{group.time}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pt-6 flex justify-center">
            <Link href="/admin-dashboard/connect/groups" className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              View all groups <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function User({ size }: { size: number }) {
  return <Users size={size} />;
}

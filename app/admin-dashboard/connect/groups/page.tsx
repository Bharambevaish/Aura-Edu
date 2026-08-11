"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Send,
  Users,
  Info,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export default function GroupsChatPage() {
  const [activeGroup, setActiveGroup] = useState('JEE BATCH 2026');
  
  const groups = [
    { name: 'JEE BATCH 2026', unread: 24, lastMsg: 'Don\'t forget tomorrow\'s test', time: '10:45 AM', color: 'bg-blue-500' },
    { name: 'NEET Foundation', unread: 0, lastMsg: 'Notes uploaded in portal', time: 'Yesterday', color: 'bg-green-500' },
    { name: 'Staff Updates', unread: 3, lastMsg: 'New holiday schedule', time: '12:30 PM', color: 'bg-purple-500' },
    { name: 'MERN Stack 101', unread: 0, lastMsg: 'React hooks assignment', time: 'Monday', color: 'bg-orange-500' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar - Group List */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 glass-panel rounded-2xl flex flex-col overflow-hidden shrink-0 hidden md:flex"
      >
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white mb-4">Groups</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {groups.map((group, i) => (
            <button 
              key={i}
              onClick={() => setActiveGroup(group.name)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${
                activeGroup === group.name ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${group.color}`}>
                {group.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium truncate ${activeGroup === group.name ? 'text-emerald-400' : 'text-white'}`}>
                    {group.name}
                  </h4>
                  <span className="text-[10px] text-slate-500">{group.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-slate-400 truncate pr-2">{group.lastMsg}</p>
                  {group.unread > 0 && (
                    <span className="px-1.5 min-w-[20px] h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {group.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              JE
            </div>
            <div>
              <h3 className="text-white font-medium">{activeGroup}</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                45 Members, 12 Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Phone size={18} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Video size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Info size={18} />
            </button>
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400">Today, 10:24 AM</span>
          </div>

          {/* Incoming Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
              RS
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-slate-200">Rahul Sharma</span>
                <span className="text-[10px] text-slate-500">10:24 AM</span>
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 max-w-md text-sm text-slate-200">
                Has everyone received the assignment for physics?
              </div>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex gap-3 justify-end">
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[10px] text-slate-500">10:26 AM</span>
                <span className="text-sm font-medium text-emerald-400">You</span>
              </div>
              <div className="bg-emerald-600 rounded-2xl rounded-tr-sm p-3 max-w-md text-sm text-white">
                Yes, I uploaded it to the portal this morning. Let me know if you face any issues accessing it.
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
              CW
            </div>
          </div>

          {/* Incoming File */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
              SK
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium text-slate-200">Sneha K.</span>
                <span className="text-[10px] text-slate-500">10:45 AM</span>
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm p-3 max-w-md">
                <p className="text-sm text-slate-200 mb-2">Here are my notes from yesterday's session.</p>
                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Physics_Notes_Ch4.pdf</p>
                    <p className="text-xs text-slate-400">2.4 MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl p-2">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors">
              <Paperclip size={20} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors hidden sm:flex">
              <ImageIcon size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 px-2"
            />
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors hidden sm:flex">
              <Smile size={20} />
            </button>
            <button className="w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-emerald-600/20">
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  Building
} from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth';
import type { SessionUser } from '@/lib/dal';

export default function AdminHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [time, setTime] = useState<Date | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Main Branch');

  useEffect(() => {
    const id = setTimeout(() => setTime(new Date()), 0);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  return (
    <header className="h-16 glass-nav border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10">
            <Building size={16} className="text-slate-300" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white flex items-center gap-2">
              MyEdou Workspace
              <ChevronDown size={14} className="text-slate-400" />
            </h1>
            <p className="text-xs text-slate-400">MyEdou</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <div className="flex flex-col items-end">
            <span className="text-green-400 font-mono tracking-wider">
              {time ? formatTime(time) : '--:--:-- --'}
            </span>
            <span className="text-slate-400 text-xs">
              {time ? formatDate(time) : '---, -- ---'}
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10 hidden md:block"></div>

        <div className="relative">
          <button 
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <MapPin size={16} className="text-emerald-400" />
            <span className="text-sm text-slate-200 font-medium">{selectedBranch}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          
          <AnimatePresence>
            {isBranchOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-xl overflow-hidden py-1 z-50"
              >
                {['Main Branch', 'Mumbai Branch', 'Pune Branch'].map(branch => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsBranchOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedBranch === branch ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {branch}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
          <Bell size={18} />
          <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 min-w-[18px] h-[18px] rounded-full bg-red-500 border-2 border-[#070B14] flex items-center justify-center text-[10px] font-bold text-white px-1">
            9+
          </span>
        </button>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              {user.name
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-white leading-tight">{user.name}</span>
              <span className="text-xs text-slate-400 font-medium">{user.role === "admin" ? "Admin" : "Staff"}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-xl py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <p className="text-sm text-white font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    router.push("/admin-dashboard/settings/profile");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/admin-dashboard/settings");
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings size={16} /> Settings
                </button>
                <div className="h-px bg-white/10 my-2"></div>
                <form action={logoutAction}>
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

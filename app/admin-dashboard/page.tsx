"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Active Students', value: '1,248', icon: Users, trend: '+12%', color: 'from-blue-500 to-blue-700' },
    { label: 'Active Courses', value: '34', icon: BookOpen, trend: '+3', color: 'from-emerald-500 to-emerald-700' },
    { label: 'Monthly Revenue', value: '₹4.2M', icon: IndianRupee, trend: '+8.4%', color: 'from-indigo-500 to-indigo-700' },
    { label: 'Lead Conversion', value: '28.5%', icon: Target, trend: '+2.1%', color: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back, here's what's happening in your workspace today.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-emerald-600/20">
          <TrendingUp size={16} /> Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass-panel p-5 rounded-2xl relative overflow-hidden group"
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={14} />
                {stat.trend}
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Analytics</h2>
            <select className="bg-slate-900 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500">
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 border-b border-white/10 pb-4">
            {/* Mock Chart Columns */}
            {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
              <div key={i} className="w-full relative group">
                <div 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600/80 to-emerald-400/80 rounded-t-sm transition-all duration-300 group-hover:brightness-110" 
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-slate-500">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[
              { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', text: 'New student registration', time: '10 mins ago', name: 'Rahul Sharma' },
              { icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10', text: 'Fee payment received', time: '1 hour ago', name: 'Priya Patel (JEE Batch)' },
              { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', text: 'New lead inquiry', time: '2 hours ago', name: 'Amit Singh' },
              { icon: CheckCircle2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', text: 'Course published', time: '3 hours ago', name: 'Advanced React Native' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-white/10"></div>}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.bg} ${activity.color} z-10 ring-4 ring-[#070B14]`}>
                  <activity.icon size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-200">{activity.text}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{activity.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                    <Clock size={10} /> {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

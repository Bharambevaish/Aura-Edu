"use client";

import React from 'react';
import { 
  User, 
  MapPin, 
  Building2, 
  CreditCard,
  ShieldAlert,
  Camera,
  CheckCircle2,
  Mail,
  Phone
} from 'lucide-react';

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-3xl text-white font-bold shadow-xl border-4 border-[#070B14]">
                SA
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white">System Administrator</h2>
            <p className="text-sm text-emerald-400 font-medium mb-1">Super Administrator</p>
            <p className="text-xs text-slate-400 mb-6">Joined: 12 Jan 2024</p>
            
            <div className="w-full">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Profile Completion</span>
                <span className="text-emerald-400 font-bold">56%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '56%' }}></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-left">Complete your profile to unlock all features.</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-slate-400">Subscription Plan</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <CreditCard size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Pro Enterprise</h4>
                <p className="text-xs text-slate-400">Valid till 31 Dec 2026</p>
              </div>
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">
              Manage Billing
            </button>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={18} className="text-blue-400" /> Personal Information
              </h2>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <p className="text-sm text-slate-200 font-medium">System Administrator</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role/Designation</label>
                <p className="text-sm text-slate-200 font-medium">System Administrator</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Mail size={12}/> Email Address</label>
                <p className="text-sm text-slate-200 font-medium flex items-center gap-2">
                  admin@auraedu.com
                  <CheckCircle2 size={14} className="text-emerald-400" />
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                <p className="text-sm text-slate-200 font-medium">+91 98765 43210</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-400" /> Organization & Branch
              </h2>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Organization Name</label>
                <p className="text-sm text-slate-200 font-medium">AuraEdu Institute of Technology</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Primary Branch</label>
                <p className="text-sm text-slate-200 font-medium">Main Campus, Mumbai</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Employee ID</label>
                <p className="text-sm text-slate-200 font-medium">EMP-0001</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Department</label>
                <p className="text-sm text-slate-200 font-medium">Management & Administration</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-orange-400" /> Reach & Location
              </h2>
              <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Edit</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Residential Address</label>
              <p className="text-sm text-slate-200 font-medium">B-402, Sunshine Apartments, Andheri West<br/>Mumbai, Maharashtra 400053<br/>India</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 bg-red-500/5 border-red-500/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-400" /> Security Notice
            </h2>
            <p className="text-sm text-slate-300 mb-4">Your account has Super Administrator privileges. Please ensure your password is secure and 2FA remains active.</p>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10">Review Audit Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

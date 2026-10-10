"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  History, 
  CheckCircle2, 
  XCircle,
  Monitor,
  Laptop
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const passwordReqs = [
    { label: 'Minimum 8 characters', met: newPassword.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'At least one number', met: /[0-9]/.test(newPassword) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="text-emerald-400" /> Security Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Manage your password, 2FA, and active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Change Password */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Key size={18} className="text-blue-400" /> Change Password
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-2 mt-4">
                {passwordReqs.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {req.met ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-slate-500" />}
                    <span className={req.met ? 'text-slate-300' : 'text-slate-500'}>{req.label}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={!passwordReqs.every(r => r.met) || !currentPassword}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors mt-4"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* 2FA Management */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Smartphone size={18} className="text-purple-400" /> Two-Factor Authentication
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-white">Authenticator App</p>
                <p className="text-xs text-slate-400 mt-1">Use an app like Google Authenticator to get 2FA codes.</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">Enabled</div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-sm font-medium transition-colors">Disable 2FA</button>
              <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-sm font-medium transition-colors">Backup Codes</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Active Sessions */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Monitor size={18} className="text-orange-400" /> Active Sessions
              </h2>
              <button className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors">Log out all devices</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Windows PC - Chrome</p>
                    <p className="text-xs text-slate-400 mt-0.5">Mumbai, India • 192.168.1.45</p>
                    <p className="text-xs text-emerald-400 mt-1">Active Now (This device)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-300">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">iPhone 14 Pro - Safari</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pune, India • 10.0.0.12</p>
                    <p className="text-xs text-slate-500 mt-1">Last active: 2 hours ago</p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" /> Recent Login History
            </h2>
            <div className="space-y-4">
              {[
                { date: '19 Jul 2026, 10:45 AM', ip: '192.168.1.45', status: 'Success', loc: 'Mumbai, IN' },
                { date: '18 Jul 2026, 09:12 AM', ip: '192.168.1.45', status: 'Success', loc: 'Mumbai, IN' },
                { date: '15 Jul 2026, 11:30 PM', ip: '45.22.11.9', status: 'Failed', loc: 'Unknown' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{log.date}</p>
                    <p className="text-xs text-slate-500 mt-1">{log.ip} • {log.loc}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

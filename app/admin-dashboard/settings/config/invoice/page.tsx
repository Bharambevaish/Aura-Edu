"use client";

import React from 'react';
import { 
  Receipt, 
  Upload, 
  Save, 
  History, 
  Eye,
  Building2,
  FileText
} from 'lucide-react';

export default function InvoiceConfigPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Receipt className="text-emerald-400" /> Invoice Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage branding, legal details, and version snapshots for system invoices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-white/10">
            <Eye size={16} /> Preview Template
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20">
            <Save size={16} /> Save New Version
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Company & Legal Details */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-blue-400" /> Company & Legal Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Registered Company Name *</label>
                <input 
                  type="text" 
                  defaultValue="AuraEdu Educational Services Pvt. Ltd."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Registered Address *</label>
                <textarea 
                  rows={3}
                  defaultValue="123, Tech Hub Building, MIDC, Andheri East, Mumbai, Maharashtra 400093"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors custom-scrollbar"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">GSTIN *</label>
                <input 
                  type="text" 
                  defaultValue="27AADCM1234E1Z5"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">PAN Number *</label>
                <input 
                  type="text" 
                  defaultValue="AADCM1234E"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@auraedu.com"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Support Phone</label>
                <input 
                  type="text" 
                  defaultValue="+91 1800 123 4567"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Upload size={18} className="text-purple-400" /> Branding & Media
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Company Logo</label>
                <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center h-40 bg-slate-900/30 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/10 font-bold text-xl">
                    M
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">Click to upload new logo</p>
                  <p className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 2MB (Recommended: 400x150px)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Authorized Signature</label>
                <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center justify-center text-center h-40 bg-slate-900/30 transition-colors cursor-pointer group">
                  <div className="w-full h-16 border-b border-white/20 mb-2 flex items-end justify-center pb-2">
                    <span className="font-[cursive] text-2xl text-slate-300 italic">System Admin</span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">Click to upload signature</p>
                  <p className="text-[10px] text-slate-500 mt-1">Transparent PNG up to 1MB</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Invoice Notes / Terms & Conditions</label>
              <textarea 
                rows={4}
                defaultValue="1. All fees are non-refundable.\n2. Late payment fee of ₹100 per day is applicable after due date.\n3. Subject to Mumbai Jurisdiction."
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors custom-scrollbar"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Snapshot History */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <History size={18} className="text-orange-400" /> Immutable Snapshots
            </h2>
            <p className="text-xs text-slate-400 mb-4">Past configurations are preserved immutably for compliance. Old invoices will always render using their respective snapshot.</p>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {[
                { version: 'v3.0.1 (Current)', date: '19 Jul 2026', author: 'System Administrator', active: true },
                { version: 'v2.1.0', date: '10 Jan 2026', author: 'System Administrator', active: false },
                { version: 'v2.0.0', date: '01 Apr 2025', author: 'System', active: false },
                { version: 'v1.5.2', date: '15 Aug 2024', author: 'Admin User', active: false },
                { version: 'v1.0.0', date: '01 Jan 2024', author: 'System', active: false },
              ].map((snap, i) => (
                <div key={i} className={`p-3 rounded-xl border flex flex-col gap-2 transition-colors ${
                  snap.active 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${snap.active ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {snap.version}
                    </span>
                    <span className="text-[10px] text-slate-500">{snap.date}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      By: {snap.author}
                    </span>
                    {!snap.active && (
                      <button className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        <FileText size={10} /> View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Calendar, Search } from 'lucide-react';

export default function GenerateCertificatePage() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Tabs */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('single')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'single' ? 'bg-[#262626] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Single
            </button>
            <button 
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'bulk' ? 'bg-[#262626] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bulk
            </button>
          </div>
          <Link href="/admin-dashboard/students/certificates" className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-[#262626] transition-colors">
            <X size={20} />
          </Link>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Form Panel */}
          <div className="w-full md:w-1/2 p-6 space-y-5 border-r border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Template <span className="text-red-400">*</span>
              </label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 appearance-none">
                <option>Premium Classic</option>
                <option>Modern Clean</option>
                <option>Elegant Gold</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="18-07-2026" 
                  className="w-full pl-4 pr-10 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
                <Calendar size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student <span className="text-red-400">*</span>
              </label>
              <div className="relative mb-2">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search student" 
                  className="w-full pl-9 pr-4 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 appearance-none">
                <option>Select a student</option>
                <option>Rohan More</option>
                <option>amkar Katturwar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Course <span className="text-red-400">*</span>
              </label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 appearance-none">
                <option>Select a course</option>
                <option>JEE BATCH</option>
                <option>NEET BATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email
              </label>
              <input 
                type="email" 
                placeholder="student@email.com" 
                className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            <button className="mt-4 px-6 py-2.5 bg-[#38bdf8] hover:bg-[#0284c7] text-slate-900 hover:text-white font-bold rounded-lg transition-colors shadow-sm w-full md:w-auto">
              + Create Certificate
            </button>
          </div>

          {/* Right Preview Panel */}
          <div className="w-full md:w-1/2 p-6 flex items-center justify-center bg-[#111111]">
            <div className="w-full max-w-sm aspect-[4/3] bg-white rounded-sm border-[8px] border-amber-600/80 shadow-2xl flex flex-col items-center p-6 relative overflow-hidden text-center">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-600 text-[10px] font-bold">Logo</span>
              </div>
              <span className="text-xs text-slate-800 font-bold uppercase tracking-wider mb-3">Certificate of<br/>Completion</span>
              <span className="text-[10px] text-slate-500 mb-1">This Certifies That</span>
              <span className="text-xl text-slate-900 font-serif font-bold italic mb-2 border-b border-slate-400 pb-1">Student</span>
              <span className="text-[9px] text-slate-600 mb-1">has successfully completed</span>
              <span className="text-sm font-bold text-slate-800 mb-4">Course Name</span>
              
              <div className="w-full flex justify-between mt-auto px-2">
                <div className="text-center">
                  <span className="block text-[8px] text-slate-500">Issued Date</span>
                  <span className="block text-[9px] font-bold text-slate-800">18/7/2026</span>
                </div>
                <div className="w-10 h-10 border border-slate-300 p-0.5">
                  <div className="w-full h-full border border-slate-200"></div>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] text-slate-500">Certificate ID</span>
                  <span className="block text-[9px] font-bold text-slate-800">CERT-YYYY-XXXXXX</span>
                </div>
              </div>
              <span className="block text-[6px] text-slate-400 mt-2">SCAN TO OPEN CERTIFICATE</span>
              
              {/* Watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <span className="text-6xl font-bold transform -rotate-45">VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

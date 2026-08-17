"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Filter, 
  Download,
  LayoutGrid,
  List,
  Award,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Share2,
  RotateCw,
  Image as ImageIcon
} from 'lucide-react';

export default function CertificateCenterPage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Certificate Center</h1>
          <p className="text-sm text-slate-400 mt-1">Issue, manage, verify & share certificates.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link 
            href="/admin-dashboard/students/certificates/generate"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Generate Certificate
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Download size={16} />
            Export
          </button>
          <div className="flex items-center bg-[#171717] border border-slate-700 rounded-lg p-0.5">
            <button className="p-1.5 bg-[#262626] text-white rounded shadow-sm">
              <LayoutGrid size={16} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 flex gap-3 items-center">
          <Award size={18} className="text-slate-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">TOTAL</h3>
            <p className="text-xl font-bold text-white">5</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 flex gap-3 items-center">
          <Clock size={18} className="text-blue-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">ISSUED TODAY</h3>
            <p className="text-xl font-bold text-blue-400">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 flex gap-3 items-center">
          <CheckCircle size={18} className="text-green-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">VERIFIED</h3>
            <p className="text-xl font-bold text-green-400">5</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 flex gap-3 items-center">
          <AlertCircle size={18} className="text-amber-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">PENDING</h3>
            <p className="text-xl font-bold text-amber-400">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 flex gap-3 items-center">
          <XCircle size={18} className="text-red-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">REVOKED</h3>
            <p className="text-xl font-bold text-red-400">0</p>
          </div>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 flex gap-3 items-center">
          <Clock size={18} className="text-purple-400" />
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">EXPIRED</h3>
            <p className="text-xl font-bold text-purple-400">0</p>
          </div>
        </div>
      </div>

      {/* Issued Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-[#171717] border border-slate-800 rounded-xl p-4 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-slate-500 font-mono">CERT-2026-24A71{item}</span>
              <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                Issued
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-white mb-2">Rohan More</h3>
            
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Award size={12} className="text-slate-500" />
                <span>JEE</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock size={12} className="text-slate-500" />
                <span>07 Jan 2026</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ImageIcon size={12} className="text-slate-500" />
                <span>Template: {item % 2 === 0 ? 'Modern Clean' : 'Premium Classic'}</span>
              </div>
            </div>
            
            <div className="mt-auto pt-3 border-t border-slate-800 flex justify-between items-center">
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-white transition-colors" title="View">
                  <Eye size={14} />
                </button>
                <button className="text-slate-400 hover:text-white transition-colors" title="Download">
                  <Download size={14} />
                </button>
                <button className="text-slate-400 hover:text-white transition-colors" title="Share">
                  <Share2 size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
                  <CheckCircle size={12} /> Verified
                </span>
                <button className="text-xs text-purple-400 flex items-center gap-1 font-medium hover:text-purple-300 transition-colors">
                  <RotateCw size={12} /> Reissue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates Section */}
      <div className="mb-4 flex justify-between items-end">
        <h2 className="text-lg font-bold text-white">Certificate Templates</h2>
        <span className="text-sm text-slate-400">3 templates</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Template 1 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 bg-[#262626] flex items-center justify-center min-h-[220px]">
            {/* Mockup */}
            <div className="w-full max-w-[280px] aspect-[4/3] bg-white rounded border-4 border-amber-600/80 shadow-lg flex flex-col items-center justify-center p-4 relative">
              <span className="text-[10px] text-slate-800 font-bold uppercase mb-2">Certificate of Completion</span>
              <span className="text-lg text-slate-900 font-serif font-bold mb-1">Student Name</span>
              <span className="text-[8px] text-slate-600 text-center">has successfully completed<br/>Course Title</span>
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <span className="text-4xl font-bold transform -rotate-45">VERIFIED</span>
              </div>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center border-t border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white">Premium Classic</h4>
              <p className="text-xs text-slate-400">2 issued</p>
            </div>
            <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-600/30 transition-colors">
              Use
            </button>
          </div>
        </div>

        {/* Template 2 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 bg-[#262626] flex items-center justify-center min-h-[220px]">
            {/* Mockup */}
            <div className="w-full max-w-[280px] aspect-[4/3] bg-white rounded shadow-lg flex flex-col items-center justify-center p-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 mb-2"></div>
              <span className="text-[10px] text-slate-800 font-bold uppercase mb-2 tracking-widest">Certificate of Completion</span>
              <span className="text-lg text-slate-900 font-sans font-bold mb-1">Student Name</span>
              <span className="text-[8px] text-slate-600 text-center">For successful completion of<br/>Course Title</span>
              <div className="w-full flex justify-between mt-4 px-4">
                <div className="w-12 h-px bg-slate-300"></div>
                <div className="w-12 h-px bg-slate-300"></div>
              </div>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center border-t border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white">Modern Clean</h4>
              <p className="text-xs text-slate-400">1 issued</p>
            </div>
            <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-600/30 transition-colors">
              Use
            </button>
          </div>
        </div>

        {/* Template 3 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 bg-[#262626] flex items-center justify-center min-h-[220px]">
            {/* Mockup */}
            <div className="w-full max-w-[280px] aspect-[4/3] bg-white rounded border-[6px] border-yellow-400 shadow-lg flex flex-col items-center justify-center p-4">
              <span className="text-xs text-slate-800 font-serif font-bold mb-2">Certificate of Completion</span>
              <span className="text-[8px] text-slate-500 mb-1">PROUDLY PRESENTED TO</span>
              <span className="text-lg text-slate-900 font-serif font-bold italic mb-1 border-b border-slate-300 pb-1">Student Name</span>
              <span className="text-[8px] text-slate-600 text-center font-serif mt-1">Course Title</span>
            </div>
          </div>
          <div className="p-4 flex justify-between items-center border-t border-slate-800">
            <div>
              <h4 className="font-bold text-sm text-white">Elegant Gold</h4>
              <p className="text-xs text-slate-400">1 issued</p>
            </div>
            <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-600/30 transition-colors">
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

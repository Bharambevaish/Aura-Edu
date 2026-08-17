"use client";

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CreateAssignmentPage() {
  return (
    <div className="min-h-screen bg-[#6b7280] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Create assignment</h2>
          <Link href="/admin-dashboard/students/assignments" className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </Link>
        </div>

        {/* Stepper */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          {/* Step 1 */}
          <div className="flex items-center gap-2 z-10 bg-white pr-2">
            <div className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <span className="font-semibold text-slate-800 text-sm">Basic Info</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-2"></div>
          
          {/* Step 2 */}
          <div className="flex items-center gap-2 z-10 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-medium text-sm">
              2
            </div>
            <span className="font-medium text-slate-400 text-sm">Course & Batch</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-2"></div>
          
          {/* Step 3 */}
          <div className="flex items-center gap-2 z-10 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-medium text-sm">
              3
            </div>
            <span className="font-medium text-slate-400 text-sm">Instructions</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-2"></div>
          
          {/* Step 4 */}
          <div className="flex items-center gap-2 z-10 bg-white px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-medium text-sm">
              4
            </div>
            <span className="font-medium text-slate-400 text-sm">Attachments</span>
          </div>
          <div className="flex-1 h-[1px] bg-slate-200 mx-2"></div>
          
          {/* Step 5 */}
          <div className="flex items-center gap-2 z-10 bg-white pl-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-medium text-sm">
              5
            </div>
            <span className="font-medium text-slate-400 text-sm">Publish</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 flex-1 border-b border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Chapter 4 problem set" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] placeholder-slate-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Total marks <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. 100" 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] placeholder-slate-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-between items-center bg-white">
          <button className="flex items-center gap-2 text-slate-400 font-medium hover:text-slate-600 transition-colors">
            <ArrowLeft size={18} />
            Back
          </button>
          <button className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

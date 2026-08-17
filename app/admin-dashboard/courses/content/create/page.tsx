"use client";

import React from 'react';
import Link from 'next/link';
import { X, UploadCloud } from 'lucide-react';

export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Add New Course</h2>
          <Link href="/admin-dashboard/courses/content" className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#262626]">
            <X size={20} />
          </Link>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Course Title" 
              className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="Course Code (e.g., CS-DS-101)" 
              className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>
          
          <div>
            <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 appearance-none placeholder-slate-500">
              <option value="">Select Duration</option>
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">1 Year</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="paidCourse" 
              className="w-4 h-4 rounded border-slate-700 bg-[#0a0a0a] text-blue-600 focus:ring-blue-500 focus:ring-offset-[#171717]"
            />
            <label htmlFor="paidCourse" className="text-sm font-medium text-slate-300 cursor-pointer">
              Paid Course
            </label>
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="Course Access Duration In Days" 
              className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>
          
          <div>
            <textarea 
              placeholder="Course Description" 
              rows={3}
              className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 resize-none"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Course Banner</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Paste an image URL, or upload →" 
                className="flex-1 px-4 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500 text-sm"
              />
              <button className="px-4 py-2 bg-[#262626] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#333333] transition-colors flex items-center gap-2">
                <UploadCloud size={16} /> Upload
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5">Appears on the course card in Course Center & My Courses.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#111111]">
          <Link href="/admin-dashboard/courses/content">
            <button className="px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-[#262626] text-slate-300 rounded-lg font-medium transition-colors text-sm">
              Cancel
            </button>
          </Link>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
}

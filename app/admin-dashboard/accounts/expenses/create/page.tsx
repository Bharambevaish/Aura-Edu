"use client";

import React from 'react';
import Link from 'next/link';
import { X, UploadCloud, Calendar } from 'lucide-react';

export default function CreateExpensePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Create Expense</h2>
          <Link href="/admin-dashboard/accounts/expenses" className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#262626]">
            <X size={20} />
          </Link>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title</label>
            <input type="text" className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (INR)</label>
              <input type="number" className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expense Date</label>
              <div className="relative">
                <input type="text" defaultValue="18-07-2026" className="w-full px-4 py-2.5 pr-10 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
                <option>Select category</option>
                <option>Stationery Material</option>
                <option>Admin Maintenance</option>
                <option>Travel Expenses</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vendor (optional)</label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
                <option>Select vendor</option>
                <option>Scholar Stationers Pvt. Ltd.</option>
                <option>Campus Stationery & Office Supplies</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Source</label>
              <select className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
                <option>Company</option>
                <option>Personal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reference Number (optional)</label>
            <input type="text" placeholder="Cheque no., UPI ref, receipt no." className="w-full px-4 py-2.5 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea rows={3} className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-y"></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Internal Notes (optional)</label>
            <textarea rows={2} placeholder="Any additional internal context" className="w-full px-4 py-3 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-y"></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Receipt (PDF, JPG, PNG up to 10MB)</label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center hover:border-slate-500 transition-colors cursor-pointer bg-[#0a0a0a]">
              <UploadCloud size={28} className="text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload receipt</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#111111]">
          <Link href="/admin-dashboard/accounts/expenses">
            <button className="px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-[#262626] text-slate-300 rounded-lg font-medium transition-colors text-sm">
              Cancel
            </button>
          </Link>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">
            Create Expense
          </button>
        </div>
      </div>
    </div>
  );
}

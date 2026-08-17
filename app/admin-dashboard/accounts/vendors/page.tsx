"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw,
  Search,
  Phone,
  Mail,
  FileText,
  Building2,
  Edit,
  CheckCircle,
  Store
} from 'lucide-react';

export default function VendorManagementPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const vendors = [
    {
      name: 'Campus Stationery & Office Supplies',
      contact: 'Rahul Patil',
      phone: '9876543210',
      email: 'sales@campusstationery.in',
      gstin: 'GSTIN: 27AABCC1234D1ZC',
      bank: 'State Bank of India',
      status: 'Active',
    },
    {
      name: 'Scholar Stationers Pvt. Ltd.',
      contact: 'Sneha Kulkarni',
      phone: '9765432108',
      email: 'orders@scholarstationers.com',
      gstin: 'GSTIN: 27ALUCS1871G1ZS',
      bank: 'HDFC Bank',
      status: 'Active',
    },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Store size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Vendor Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Maintain supplier contact, compliance, and payout details in one secure place.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-xs font-medium hover:bg-[#262626] transition-colors">
            All Branches
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">VENDORS</h3>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-1">ACTIVE</h3>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">INACTIVE</h3>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm">
          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">BANK PROFILES</h3>
          <p className="text-2xl font-bold text-white">2</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by vendor name, contact, phone, or email" 
            className="w-full pl-9 pr-3 py-2 bg-[#171717] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map((vendor, index) => (
          <div key={index} className="bg-[#171717] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors relative">
            <span className="absolute top-4 right-4 px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded border border-green-900/50 flex items-center gap-1">
              <CheckCircle size={10} /> {vendor.status}
            </span>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-blue-900/20 rounded-lg flex-shrink-0">
                <Building2 size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{vendor.name}</h3>
                <p className="text-xs text-slate-500">{vendor.contact}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Phone size={12} className="text-slate-500" />
                <span className="text-blue-400">{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail size={12} className="text-slate-500" />
                <span className="text-blue-400">{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FileText size={12} className="text-slate-500" />
                <span>{vendor.gstin}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building2 size={12} className="text-slate-500" />
                <span>{vendor.bank}</span>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-3 flex justify-center">
              <button className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors font-medium">
                <Edit size={14} /> Edit Vendor
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Add Vendor</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-[#262626]">
                <span className="text-lg">&times;</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Basic Information */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="p-1 bg-blue-900/30 rounded"><Building2 size={12} className="text-blue-400" /></span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Vendor Name</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Person</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                    <input type="email" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
                    <input type="tel" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">GSTIN</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">PAN</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Address</label>
                  <textarea rows={2} className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 resize-y"></textarea>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="p-1 bg-green-900/30 rounded"><Building2 size={12} className="text-green-400" /></span>
                  Bank Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Bank Name</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Account Number</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">IFSC</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Branch Name</label>
                    <input type="text" className="w-full px-3 py-2 bg-[#0a0a0a] rounded-lg border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked id="vendorActive" className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label htmlFor="vendorActive" className="text-sm font-medium text-slate-300 cursor-pointer">Vendor is active</label>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-[#111111]">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-transparent border border-slate-700 hover:bg-[#262626] text-slate-300 rounded-lg font-medium transition-colors text-sm">
                Cancel
              </button>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

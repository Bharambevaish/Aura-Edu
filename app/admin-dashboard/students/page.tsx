"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Download, 
  Upload, 
  Plus, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  User
} from 'lucide-react';
import AddStudentModal from '@/components/admin/students/AddStudentModal';

export default function StudentManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const mockStudents = [
    { id: 1, name: 'Nikhil Raghuwanshi', email: 'nraghuwanshi123@gmail.com', admNo: 'ADM-2026-0010', rollNo: '1780912252737', batch: 'N/A', phone: '7666781458', status: 'Active', admStatus: 'Active' },
    { id: 2, name: 'Ansh Patthe', email: 'anshpatthe1904@gmail.com', admNo: 'ADM-2026-0009', rollNo: '1780912252736', batch: 'N/A', phone: '9022369106', status: 'Active', admStatus: 'Active' },
    { id: 3, name: 'Sumit Pawar', email: 'sumit@gmail.com', admNo: 'ADM-2026-0007', rollNo: '1780912252734', batch: 'N/A', phone: '9876545453', status: 'Active', admStatus: 'Active' },
    { id: 4, name: 'Rhinhabh Raghu', email: 'nraghuwanshi2707@gmail.com', admNo: 'STU-1780912252733-CEA151', rollNo: 'RN-1780912252733-CEA151', batch: 'N/A', phone: '3364115142125644551...', status: 'Active', admStatus: 'Active' },
    { id: 5, name: 'Shital Kolekar', email: 'shitalkolekar05@gmail.com', admNo: 'STU-1750911552337-68D291', rollNo: 'RN-1780911552337-68D291', batch: 'N/A', phone: '8976545678', status: 'Active', admStatus: 'Active' },
    { id: 6, name: 'Nikhil Raghuwanshi', email: 'nraghuwanshi00@gmail.com', admNo: 'ADM-2026-0006', rollNo: '0006', batch: 'NEET BATCH', phone: '8787654543', status: 'Active', admStatus: 'Active' },
    { id: 7, name: 'Rohan More', email: 'katturwarom313@gmail.com', admNo: 'ADM-2026-0005', rollNo: '0005', batch: 'JEE BATCH', phone: '8668789160', status: 'Active', admStatus: 'Active' },
    { id: 8, name: 'sanket Mule', email: 'sanketmule3003@gmail.com', admNo: 'ADM-2026-0004', rollNo: '0004', batch: 'JEE BATCH', phone: '-', status: 'Active', admStatus: 'Active' },
    { id: 9, name: 'Ramkrushna Warke', email: 'ramkrushnawarke123@gmail.com', admNo: 'ADM-2026-0003', rollNo: '0003', batch: 'NEET BATCH', phone: '-', status: 'Active', admStatus: 'Active' },
    { id: 10, name: 'Charudatta Warke', email: 'chwarke121@gmail.com', admNo: 'ADM-2026-0002', rollNo: '0002', batch: 'Python Programming', phone: '8668789160', status: 'Active', admStatus: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" /> Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage student records, imports, exports, and profile insights.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-900/50 rounded-lg border border-white/10 p-1">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors">Current Page</button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1">Excel <ChevronDown size={14}/></button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"><Download size={14} /> Export</button>
          </div>
          
          <div className="flex items-center bg-slate-900/50 rounded-lg border border-white/10 p-1">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"><FileSpreadsheet size={14} /> Excel Template <ChevronDown size={14}/></button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"><FileSpreadsheet size={14} /> CSV Template</button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"><Upload size={14} /> Import</button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-600/20 ml-auto xl:ml-2"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-blue-500/10 rounded-bl-full flex items-start justify-end p-3 transition-transform group-hover:scale-110">
            <Users size={16} className="text-blue-400" />
          </div>
          <p className="text-xs font-medium text-slate-400 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-white">10</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full flex items-start justify-end p-3 transition-transform group-hover:scale-110">
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-xs font-medium text-emerald-400/80 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-400">10</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-red-500/20 bg-red-500/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-red-500/10 rounded-bl-full flex items-start justify-end p-3 transition-transform group-hover:scale-110">
            <XCircle size={16} className="text-red-400" />
          </div>
          <p className="text-xs font-medium text-red-400/80 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-red-400">0</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-16 h-16 bg-purple-500/10 rounded-bl-full flex items-start justify-end p-3 transition-transform group-hover:scale-110">
            <ChevronRight size={16} className="text-purple-400" />
          </div>
          <p className="text-xs font-medium text-purple-400/80 mb-1">Batches</p>
          <p className="text-2xl font-bold text-purple-400">4</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Bulk Actions */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/[0.02]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
            <span className="text-sm text-slate-300">Select page <span className="text-xs text-slate-500 ml-1">Select students to assign branch, course, or batch</span></span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {['Assign Branch', 'Assign Course', 'Assign Batch', 'Generate Login', 'Send Credentials'].map(action => (
              <button key={action} className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/5 transition-colors whitespace-nowrap">
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email, phone, admission, roll..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <select className="w-full sm:w-auto bg-slate-900/50 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
              <option>All Batches</option>
              <option>NEET BATCH</option>
              <option>JEE BATCH</option>
            </select>
            <select className="w-full sm:w-auto bg-slate-900/50 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm whitespace-nowrap">
              Current Page - Excel <ChevronDown size={14} />
            </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm">
              Export
            </button>
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm">
              <Filter size={14} /> Columns
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10 text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input type="checkbox" className="rounded bg-slate-900 border-white/20" />
                </th>
                <th className="px-4 py-4">SR NO</th>
                <th className="px-4 py-4">STUDENT ↕</th>
                <th className="px-4 py-4">ADMISSION ↕</th>
                <th className="px-4 py-4">BATCH</th>
                <th className="px-4 py-4">PHONE ↕</th>
                <th className="px-4 py-4 text-center">STATUS</th>
                <th className="px-4 py-4 text-center">ADMISSION STATUS</th>
                <th className="px-4 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockStudents.map((student) => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded bg-slate-900 border-white/20" />
                  </td>
                  <td className="px-4 py-4 text-slate-400">{student.id}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300 shrink-0">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 font-medium truncate">{student.name}</span>
                        <span className="text-[10px] text-slate-500 truncate">{student.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-200 font-mono text-xs">{student.admNo}</span>
                      <span className="text-[10px] text-slate-500">Roll: {student.rollNo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {student.batch}
                  </td>
                  <td className="px-4 py-4 text-slate-300 font-mono text-xs">
                    {student.phone}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {student.admStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <button className="text-xs text-slate-400 hover:text-slate-300 px-3 py-1.5 border border-white/10 rounded-lg">Clear Filters</button>
        </div>
      </motion.div>

      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

const ChevronRight = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
)

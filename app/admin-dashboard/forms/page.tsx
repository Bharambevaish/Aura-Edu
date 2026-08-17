"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCw, 
  Filter,
  Download,
  Search,
  LayoutGrid,
  Table,
  BarChart3,
  Edit,
  ExternalLink,
  Copy,
  Settings,
  Trash2,
  RotateCcw,
  Globe,
  FileText,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export default function AllFormsPage() {
  const [view, setView] = useState<'cards' | 'table' | 'insights'>('cards');

  const forms = [
    {
      id: 1,
      name: 'Admission Registration Form',
      description: 'No description provided.',
      tags: ['ADMS', 'Published'],
      submissions: 0,
      fields: 11,
      updatedBy: 'Charudatta Warke',
      updatedAt: 'Jun 08, 2024',
      isPublic: true,
      status: 'Published',
    },
  ];

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Form Management Center</h1>
          <p className="text-sm text-slate-400 mt-1">Create, share, and track your forms in one organized workspace.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Download size={16} /> Export
          </button>
          <Link href="/admin-dashboard/forms/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={16} /> Create Form
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'TOTAL FORMS', value: '1', icon: FileText, color: 'border-blue-900/50 text-blue-400' },
          { label: 'ACTIVE', value: '1', icon: CheckCircle, color: 'border-green-900/50 text-green-400' },
          { label: 'DRAFTS', value: '0', icon: Edit, color: 'border-amber-900/50 text-amber-400' },
          { label: 'SUBMISSIONS', value: '0', icon: FileText, color: 'border-purple-900/50 text-purple-400' },
          { label: 'TODAY', value: '0', icon: TrendingUp, color: 'border-cyan-900/50 text-cyan-400' },
          { label: 'CONVERSION', value: '100%', icon: TrendingUp, color: 'border-emerald-900/50 text-emerald-400' },
          { label: 'PUBLIC', value: '1', icon: Globe, color: 'border-red-900/50 text-red-400' },
        ].map((stat, i) => (
          <div key={i} className={`bg-[#171717] border ${stat.color.split(' ')[0]} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center gap-2 mb-1">
              <stat.icon size={13} className={stat.color.split(' ')[1]} />
              <h4 className={`text-[9px] font-bold ${stat.color.split(' ')[1]} uppercase tracking-wider`}>{stat.label}</h4>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search forms by name, description, or creator"
            className="w-full pl-9 pr-4 py-2 bg-[#171717] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="flex items-center bg-[#171717] border border-slate-700 rounded-lg p-0.5 gap-0.5">
          {[
            { id: 'cards', icon: LayoutGrid, label: 'Cards' },
            { id: 'table', icon: Table, label: 'Table' },
            { id: 'insights', icon: BarChart3, label: 'Insights' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                view === v.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Cards */}
      {view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forms.map((form) => (
            <div key={form.id} className="bg-[#171717] border border-slate-800 rounded-xl shadow-sm hover:border-slate-700 transition-colors flex flex-col">
              {/* Tags */}
              <div className="p-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {form.tags.map((tag) => (
                    <span key={tag} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      tag === 'Published' 
                        ? 'bg-green-900/30 text-green-400 border-green-900/50'
                        : 'bg-blue-900/20 text-blue-400 border-blue-900/30'
                    }`}>{tag}</span>
                  ))}
                </div>
                {form.isPublic && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-blue-400">
                    <Globe size={11} /> Public
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="px-4 pb-3 flex-1">
                <h3 className="font-bold text-white text-sm mb-1">{form.name}</h3>
                <p className="text-xs text-slate-500">{form.description}</p>
              </div>

              {/* Meta */}
              <div className="px-4 pb-3 flex items-center gap-5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><FileText size={12} className="text-slate-500" /> {form.submissions} submissions</span>
                <span className="flex items-center gap-1"><Settings size={12} className="text-slate-500" /> {form.fields} fields</span>
              </div>
              <div className="px-4 pb-3 text-[11px] text-slate-500">
                By {form.updatedBy} &nbsp;·&nbsp; Updated {form.updatedAt}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800 mx-4"></div>

              {/* Action Icons */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button title="Edit" className="text-slate-500 hover:text-blue-400 transition-colors"><Edit size={15} /></button>
                  <button title="Open" className="text-slate-500 hover:text-green-400 transition-colors"><ExternalLink size={15} /></button>
                  <button title="Copy Link" className="text-slate-500 hover:text-amber-400 transition-colors"><Copy size={15} /></button>
                  <button title="Settings" className="text-slate-500 hover:text-slate-200 transition-colors"><Settings size={15} /></button>
                  <button title="Reset" className="text-slate-500 hover:text-purple-400 transition-colors"><RotateCcw size={15} /></button>
                </div>
                <button title="Delete" className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}

          {/* Add new form card */}
          <Link href="/admin-dashboard/forms/create" className="bg-[#171717] border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-[#171717] transition-colors group cursor-pointer min-h-[200px]">
            <div className="w-12 h-12 bg-[#262626] group-hover:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors">
              <Plus size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-sm text-slate-500 group-hover:text-blue-400 transition-colors font-medium">Create New Form</p>
          </Link>
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
                <th className="py-3 px-4">FORM NAME</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">SUBMISSIONS</th>
                <th className="py-3 px-4">FIELDS</th>
                <th className="py-3 px-4">UPDATED</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {forms.map((form) => (
                <tr key={form.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                  <td className="py-3 px-4">
                    <h4 className="font-bold text-white">{form.name}</h4>
                    <p className="text-xs text-slate-500">{form.description}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-900/50 rounded text-[10px] font-bold">{form.status}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{form.submissions}</td>
                  <td className="py-3 px-4 text-slate-300">{form.fields}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{form.updatedAt}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-slate-500 hover:text-blue-400 transition-colors"><Edit size={14} /></button>
                      <button className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insights View */}
      {view === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#171717] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Submission Trends</h3>
            <div className="flex items-end gap-3 h-32">
              {[20, 45, 30, 60, 50, 80, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-blue-600/40 rounded-t border border-blue-500/30" style={{ height: `${h}%` }}></div>
                  <span className="text-[9px] text-slate-500">{['M','T','W','T','F','S','S'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#171717] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Form Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Admission Registration Form</span>
                <span className="text-green-400 font-bold">100%</span>
              </div>
              <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

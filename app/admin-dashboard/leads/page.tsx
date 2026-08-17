"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Download, 
  Upload, 
  LayoutGrid, 
  List,
  Search,
  ChevronDown,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export default function AllLeadsPage() {
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  const leads = [
    { id: 1, name: 'nikhil', sub: 'ssc', type: 'Student', lifecycle: 'New', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '7219298777', email: 'jk8031011@gmail.com', created: '6/25/2026' },
    { id: 2, name: 'Omkar Katturwar', sub: 'HSC', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '7219290881', email: 'katturwaromkar133@gmail.com', created: '6/23/2026' },
    { id: 3, name: 'CHARUDATTA RAMKRUSHNA WARKE', sub: 'B.Tech', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9511991103', email: 'contact@codeservetech.com', created: '6/10/2026' },
    { id: 4, name: 'SHREYA ATOLE', sub: 'btech comp', type: 'Student', lifecycle: 'New', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9923134567', email: 'shreyaatole99@gmail.com', created: '6/10/2026' },
    { id: 5, name: 'shreya', sub: 'btech', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '8830328099', email: 'shreya.22320115@viit.ac.in', created: '6/9/2026' },
    { id: 6, name: 'Shital Kalekar', sub: 'Bachelor in computer Science', type: 'Student', lifecycle: 'Converted', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '8976545678', email: 'shitalkalekar05@gmail.com', created: '6/8/2026' },
    { id: 7, name: 'Rhishabh Raghu', sub: 'BTech', type: 'Student', lifecycle: 'Converted', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '3564115142125644561424', email: 'nikhilraghuwanshi2707@gmail.com', created: '6/3/2026' },
    { id: 8, name: 'Nikhil Gokul Raghuwanshi', sub: 'BTech', type: 'Student', lifecycle: 'Follow-up', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '7666781458', email: 'nraghuwanshi100@gmail.com', created: '6/3/2026' },
    { id: 9, name: 'Vivek Kadam', sub: 'B.Com', type: 'Student', lifecycle: 'Follow-up', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '7219290885', email: 'omkarkatturwarhvinkdeltab@gmail.com', created: '6/7/2026' },
  ];

  const getLifecycleColor = (lifecycle: string) => {
    switch (lifecycle) {
      case 'New': return 'bg-blue-900/30 text-blue-400 border-blue-900/50';
      case 'Converted': return 'bg-green-900/30 text-green-400 border-green-900/50';
      case 'Follow-up': return 'bg-amber-900/30 text-amber-400 border-amber-900/50';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">All Leads</h1>
          <p className="text-sm text-slate-400 mt-1">Unified lead workspace for student and client opportunities.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-blue-600 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-600/10 transition-colors">
            <Plus size={16} />
            Add Lead
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-blue-600 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-600/10 transition-colors">
            <Upload size={16} />
            Bulk Import
          </button>
          <div className="flex items-center bg-[#171717] border border-slate-700 rounded-lg p-0.5">
            <button className="p-1.5 bg-[#262626] text-white rounded shadow-sm">
              <List size={16} />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <div className="bg-[#171717] border border-slate-700 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">TOTAL</h3>
          <p className="text-xl font-bold text-white">9</p>
        </div>
        <div className="bg-[#171717] border border-blue-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">NEW</h3>
          <p className="text-xl font-bold text-white">5</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2">CONTACTED</h3>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2">FOLLOW-UP</h3>
          <p className="text-xl font-bold text-white">2</p>
        </div>
        <div className="bg-[#171717] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">QUALIFIED</h3>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">CONVERTED</h3>
          <p className="text-xl font-bold text-white">2</p>
        </div>
        <div className="bg-[#171717] border border-red-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">LOST</h3>
          <p className="text-xl font-bold text-white">0</p>
        </div>
        <div className="bg-[#171717] border border-cyan-900/50 rounded-lg p-3 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">TODAY F/U / CONVS</h3>
          <p className="text-xl font-bold text-cyan-400 flex items-center gap-1">0 <span className="text-sm font-medium text-slate-500">· 22%</span></p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-[#171717] border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search lead, source, owner, mobile..." 
            className="w-full pl-9 pr-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Lifecycle Stages</option>
            <option>New</option>
            <option>Contacted</option>
            <option>Follow-up</option>
            <option>Qualified</option>
            <option>Converted</option>
            <option>Lost</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative min-w-[150px]">
          <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative min-w-[150px]">
          <select className="w-full px-3 py-2 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Types</option>
            <option>Student</option>
            <option>Client</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        
        <div className="ml-auto relative">
          <button 
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors"
          >
            <Columns size={16} />
            Columns
          </button>
          
          {showColumnsDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#171717] border border-slate-700 rounded-lg shadow-xl z-50 p-2 text-sm flex flex-col gap-2">
              {['Lead', 'Type', 'Lifecycle', 'Priority', 'Source', 'Owner', 'Next Follow-up', 'Contact', 'Created'].map(col => (
                <label key={col} className="flex items-center gap-2 text-slate-300 hover:bg-[#262626] p-1.5 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-0 focus:ring-offset-0" />
                  {col}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-[#171717] border-x border-slate-800 px-4 py-3 text-xs text-slate-400">
        Showing {leads.length} leads after filters.
      </div>

      {/* Table Data */}
      <div className="bg-[#171717] border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
              <th className="py-3 px-4 font-bold">LEAD</th>
              <th className="py-3 px-4 font-bold">TYPE</th>
              <th className="py-3 px-4 font-bold">LIFECYCLE</th>
              <th className="py-3 px-4 font-bold">PRIORITY</th>
              <th className="py-3 px-4 font-bold">SOURCE</th>
              <th className="py-3 px-4 font-bold">OWNER</th>
              <th className="py-3 px-4 font-bold">NEXT FOLLOW-UP</th>
              <th className="py-3 px-4 font-bold">CONTACT</th>
              <th className="py-3 px-4 font-bold">CREATED</th>
              <th className="py-3 px-4 font-bold">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{lead.name}</div>
                  <div className="text-[11px] text-slate-500">{lead.sub}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-900/20 text-blue-400 border border-blue-900/30">
                    {lead.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getLifecycleColor(lead.lifecycle)}`}>
                    {lead.lifecycle}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[13px] font-medium text-slate-300">{lead.priority}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[11px] text-slate-400 font-medium">{lead.source}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[13px] text-slate-400">{lead.owner}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-[13px] text-slate-500">{lead.nextFollowUp}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-[13px] text-white font-medium">{lead.phone}</div>
                  <div className="text-[11px] text-slate-500">{lead.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-[13px] text-slate-400 font-medium">{lead.created}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 rounded text-xs font-medium transition-colors">
                      Follow-up
                    </button>
                    <button className="px-3 py-1 bg-transparent border border-emerald-600/50 hover:border-emerald-500 text-emerald-400 rounded text-xs font-medium transition-colors">
                      Convert
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-[#0a0a0a]/50">
          <p className="text-xs text-slate-400">Showing 1 to {leads.length} of {leads.length} results</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-slate-700 text-slate-500 disabled:opacity-50">
              <ChevronsLeft size={14} />
            </button>
            <button className="p-1.5 rounded border border-slate-700 text-slate-500 disabled:opacity-50">
              <ChevronLeft size={14} />
            </button>
            <button className="px-3 py-1 rounded bg-blue-600/20 border border-blue-500/50 text-blue-400 text-sm font-medium">
              1
            </button>
            <button className="p-1.5 rounded border border-slate-700 text-slate-500 disabled:opacity-50">
              <ChevronRight size={14} />
            </button>
            <button className="p-1.5 rounded border border-slate-700 text-slate-500 disabled:opacity-50">
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { PageHeader, StatCard, Button } from '@/components/ui';
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
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export default function AllLeadsPage() {
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  const leads = [
    { id: 1, name: 'Aarav Sharma', sub: 'Class 12', type: 'Student', lifecycle: 'New', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500011', email: 'lead.demo11@demo.auraedu.com', created: '6/25/2026' },
    { id: 2, name: 'Priya Deshmukh', sub: 'HSC', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500012', email: 'lead.demo12@demo.auraedu.com', created: '6/23/2026' },
    { id: 3, name: 'Rohan Kulkarni', sub: 'B.Tech', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500013', email: 'lead.demo13@demo.auraedu.com', created: '6/10/2026' },
    { id: 4, name: 'Sneha Patil', sub: 'B.Tech Comp', type: 'Student', lifecycle: 'New', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500014', email: 'lead.demo14@demo.auraedu.com', created: '6/10/2026' },
    { id: 5, name: 'Aditya Joshi', sub: 'B.Tech', type: 'Student', lifecycle: 'New', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500015', email: 'lead.demo15@demo.auraedu.com', created: '6/9/2026' },
    { id: 6, name: 'Meera Iyer', sub: 'B.Sc', type: 'Student', lifecycle: 'Converted', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500016', email: 'lead.demo16@demo.auraedu.com', created: '6/8/2026' },
    { id: 7, name: 'Kabir Singh', sub: 'BTech', type: 'Student', lifecycle: 'Converted', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500017', email: 'lead.demo17@demo.auraedu.com', created: '6/3/2026' },
    { id: 8, name: 'Ananya Rao', sub: 'BTech', type: 'Student', lifecycle: 'Follow-up', priority: 'High', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500018', email: 'lead.demo18@demo.auraedu.com', created: '6/3/2026' },
    { id: 9, name: 'Dev Verma', sub: 'B.Com', type: 'Student', lifecycle: 'Follow-up', priority: 'Medium', source: 'WEB SELF REGISTER', owner: 'Unassigned', nextFollowUp: '-', phone: '9876500019', email: 'lead.demo19@demo.auraedu.com', created: '6/7/2026' },
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
    <div className="space-y-6">
      <PageHeader
        title="All Leads"
        subtitle="Unified lead workspace for student and client opportunities."
        icon={<Users size={20} className="text-emerald-400" />}
      >
        <Button size="sm">
          <Plus size={16} />
          Add Lead
        </Button>
        <Button variant="secondary" size="sm">
          <RefreshCw size={16} />
          Refresh
        </Button>
        <Button variant="secondary" size="sm">
          <Download size={16} />
          Export
        </Button>
        <Button size="sm">
          <Upload size={16} />
          Bulk Import
        </Button>
        <div className="flex items-center bg-slate-900/50 border border-white/10 rounded-lg p-0.5">
          <button className="p-1.5 bg-slate-900/50 text-white rounded shadow-sm">
            <List size={16} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-white transition-colors">
            <LayoutGrid size={16} />
          </button>
        </div>
      </PageHeader>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="TOTAL" value="9" accent="slate" />
        <StatCard label="NEW" value="5" accent="blue" />
        <StatCard label="CONTACTED" value="0" accent="purple" />
        <StatCard label="FOLLOW-UP" value="2" accent="amber" />
        <StatCard label="QUALIFIED" value="0" accent="slate" />
        <StatCard label="CONVERTED" value="2" accent="emerald" />
        <StatCard label="LOST" value="0" accent="red" />
        <StatCard label="TODAY F/U / CONVS" value="0 · 22%" accent="blue" />
      </div>

      {/* Filters & Actions */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search lead, source, owner, mobile..." 
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="relative min-w-[180px]">
          <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
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
          <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        <div className="relative min-w-[150px]">
          <select className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none">
            <option>All Types</option>
            <option>Student</option>
            <option>Client</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>
        
        <div className="ml-auto relative">
          <button 
            onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
          >
            <Columns size={16} />
            Columns
          </button>
          
          {showColumnsDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/50 border border-slate-700 rounded-lg shadow-xl z-50 p-2 text-sm flex flex-col gap-2">
              {['Lead', 'Type', 'Lifecycle', 'Priority', 'Source', 'Owner', 'Next Follow-up', 'Contact', 'Created'].map(col => (
                <label key={col} className="flex items-center gap-2 text-slate-300 hover:bg-white/5 p-1.5 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-900/50 text-blue-500 focus:ring-0 focus:ring-offset-0" />
                  {col}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-slate-900/50 border-x border-slate-800 px-4 py-3 text-xs text-slate-400">
        Showing {leads.length} leads after filters.
      </div>

      {/* Table Data */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
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
              <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
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
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
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

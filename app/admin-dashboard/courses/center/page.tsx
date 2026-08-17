"use client";

import React from 'react';
import { 
  RefreshCw, 
  Search,
  BookOpen,
  Eye,
  EyeOff,
  DollarSign,
  TrendingUp,
  Save,
  Trash2,
  Users,
  Clock
} from 'lucide-react';

export default function CourseCenterPage() {
  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={20} className="text-blue-500" />
            <h1 className="text-xl font-bold text-white">Learning Marketplace</h1>
            <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs font-bold rounded-full">4 courses</span>
          </div>
          <p className="text-sm text-slate-400">Publish, price & manage your course catalogue.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search title or code" 
              className="w-full pl-9 pr-3 py-2 bg-[#171717] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#171717] border border-blue-900/50 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <BookOpen size={80} />
          </div>
          <h3 className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wider relative z-10">TOTAL COURSES</h3>
          <p className="text-2xl font-bold text-white relative z-10">4</p>
        </div>
        <div className="bg-[#171717] border border-green-900/50 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <Eye size={80} />
          </div>
          <h3 className="text-[10px] font-bold text-green-400 mb-1 uppercase tracking-wider relative z-10">PUBLISHED</h3>
          <p className="text-2xl font-bold text-white relative z-10">3</p>
        </div>
        <div className="bg-[#171717] border border-amber-900/50 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <DollarSign size={80} />
          </div>
          <h3 className="text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-wider relative z-10">PAID</h3>
          <p className="text-2xl font-bold text-white relative z-10">4</p>
        </div>
        <div className="bg-[#171717] border border-purple-900/50 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-5">
            <TrendingUp size={80} />
          </div>
          <h3 className="text-[10px] font-bold text-purple-400 mb-1 uppercase tracking-wider relative z-10">CONFIGURED VALUE</h3>
          <p className="text-2xl font-bold text-white relative z-10">INR 28,001</p>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-24 bg-gradient-to-r from-orange-500 to-amber-500 relative flex items-center justify-center p-4">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 text-slate-300 text-[10px] font-bold rounded">Hidden</span>
            <div className="text-center">
              <h3 className="font-bold text-white text-lg leading-tight uppercase italic drop-shadow-md">UPSC TOPPERS</h3>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-white text-sm">Prarambh Batch</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">PBH++</p>
              </div>
              <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded whitespace-nowrap">0 modules</span>
            </div>
            
            <p className="text-xs text-slate-400">Batch for the beginner.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Paid</label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> PRICE</label>
                <div className="relative">
                  <input type="text" defaultValue="18000" className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> DURATION</label>
                <div className="relative flex items-center">
                  <input type="text" defaultValue="200" className="w-full pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                  <span className="absolute right-2 text-[10px] text-slate-500">INR</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <EyeOff size={14} className="text-slate-500" /> Hidden from students
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 flex justify-between items-center bg-[#0f0f0f]">
            <button className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors">
              <Users size={14} /> View Students
            </button>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                <Save size={14} /> Save
              </button>
              <button className="flex items-center justify-center bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1.5 rounded transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-24 bg-slate-800 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded z-10">Published</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-80 z-0"></div>
            <h3 className="font-bold text-white text-2xl z-10 drop-shadow-lg">COURSE for JEE</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-white text-sm">JEE</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">COURSE-JEE</p>
              </div>
              <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded whitespace-nowrap">0 modules</span>
            </div>
            
            <p className="text-xs text-slate-500 italic">No description available.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Paid</label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> PRICE</label>
                <div className="relative">
                  <input type="text" defaultValue="5000" className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> DURATION</label>
                <div className="relative flex items-center">
                  <input type="text" defaultValue="365" className="w-full pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                  <span className="absolute right-2 text-[10px] text-slate-500">INR</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <Eye size={14} /> Visible to students
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 flex justify-between items-center bg-[#0f0f0f] gap-2">
            <button className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors">
              <Users size={12} /> View Students
            </button>
            <button className="px-2 py-1.5 bg-amber-500/20 text-amber-500 rounded text-[11px] font-bold hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap">
              Set Inactive
            </button>
            <div className="flex gap-1.5 ml-auto">
              <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition-colors" title="Save">
                <Save size={14} />
              </button>
              <button className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-24 bg-slate-800 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded z-10">Published</span>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-400 opacity-90 z-0"></div>
            <h3 className="font-bold text-blue-900 text-3xl z-10 drop-shadow-md tracking-wider">NEET</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-white text-sm">NEET</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">COURSE-NEET</p>
              </div>
              <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded whitespace-nowrap">0 modules</span>
            </div>
            
            <p className="text-xs text-slate-500 italic">No description available.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Paid</label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> PRICE</label>
                <div className="relative">
                  <input type="text" defaultValue="5000" className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> DURATION</label>
                <div className="relative flex items-center">
                  <input type="text" defaultValue="365" className="w-full pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                  <span className="absolute right-2 text-[10px] text-slate-500">INR</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <Eye size={14} /> Visible to students
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 flex justify-between items-center bg-[#0f0f0f] gap-2">
            <button className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors">
              <Users size={12} /> View Students
            </button>
            <button className="px-2 py-1.5 bg-amber-500/20 text-amber-500 rounded text-[11px] font-bold hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap">
              Set Inactive
            </button>
            <div className="flex gap-1.5 ml-auto">
              <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded transition-colors" title="Save">
                <Save size={14} />
              </button>
              <button className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="h-24 bg-slate-900 relative overflow-hidden flex items-center justify-center">
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded z-10">Published</span>
            <div className="flex gap-2 z-10">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center text-green-500 font-bold">M</div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-white font-bold">E</div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-cyan-500 flex items-center justify-center text-cyan-500 font-bold">R</div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-green-400 flex items-center justify-center text-green-400 font-bold">N</div>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-bold text-white text-sm">MERN-Demo</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">MD01</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-semibold rounded whitespace-nowrap">1 modules</span>
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-[10px] font-semibold rounded whitespace-nowrap">3 purchases</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400">retgrhyt...</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Published</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 bg-[#0a0a0a] text-blue-500 focus:ring-blue-500" />
                <label className="text-xs font-semibold text-slate-300">Paid</label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><DollarSign size={10} /> PRICE</label>
                <div className="relative">
                  <input type="text" defaultValue="1" className="w-full px-3 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> DURATION</label>
                <div className="relative flex items-center">
                  <input type="text" defaultValue="90" className="w-full pl-3 pr-8 py-1.5 bg-[#0a0a0a] border border-slate-700 rounded text-sm text-white focus:border-blue-500 focus:outline-none font-medium" />
                  <span className="absolute right-2 text-[10px] text-slate-500">INR</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex items-center gap-1.5 text-xs text-green-400 font-medium">
              <Eye size={14} /> Visible to students
            </div>
          </div>
          
          <div className="border-t border-slate-800 p-3 flex justify-between items-center bg-[#0f0f0f]">
            <button className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors">
              <Users size={12} /> View Students
            </button>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                <Save size={14} /> Save
              </button>
              <button className="flex items-center justify-center bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1.5 rounded transition-colors" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

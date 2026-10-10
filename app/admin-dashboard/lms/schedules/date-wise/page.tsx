"use client";

import React from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  Clock,
  BookOpen,
  Video,
  Monitor
} from 'lucide-react';

export default function DatewiseSchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Academic Schedule Center</h1>
          <p className="text-sm text-slate-400 mt-1">Plan & review classes, meetings and live sessions by date.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
            <button className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-r border-slate-700">
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white border-r border-slate-700 bg-slate-900/50">
              <CalendarIcon size={14} className="text-slate-400" />
              18-07-2026
            </div>
            <button className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-900/50 rounded-lg text-sm font-medium hover:bg-blue-900/50 transition-colors shadow-sm">
            Today
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 border border-blue-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-400" />
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">TOTAL SESSIONS</h3>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-900/50 border border-purple-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={14} className="text-purple-400" />
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">BATCH CLASSES</h3>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-900/50 border border-green-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Video size={14} className="text-green-400" />
            <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-wider">MEETINGS</h3>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
        <div className="bg-slate-900/50 border border-cyan-900/50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={14} className="text-cyan-400" />
            <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">LIVE SESSIONS</h3>
          </div>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Mini Calendar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <button className="text-slate-400 hover:text-white p-1">
                <ChevronLeft size={16} />
              </button>
              <h3 className="text-sm font-bold text-white">July 2026</h3>
              <button className="text-slate-400 hover:text-white p-1">
                <ChevronRight size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[10px] font-bold text-slate-500 py-1">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="p-1.5 text-slate-600"></div>
              <div className="p-1.5 text-slate-600"></div>
              <div className="p-1.5 text-slate-600"></div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">1</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">2</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">3</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">4</div>
              
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">5</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">6</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">7</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">8</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">9</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">10</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">11</div>
              
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">12</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">13</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">14</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">15</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">16</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">17</div>
              <div className="p-1.5 bg-blue-600 text-white font-bold rounded cursor-pointer shadow-sm shadow-blue-900/50">18</div>
              
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">19</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">20</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">21</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">22</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">23</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">24</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">25</div>
              
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">26</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">27</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">28</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">29</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">30</div>
              <div className="p-1.5 text-slate-400 hover:bg-white/5 rounded cursor-pointer">31</div>
              <div className="p-1.5 text-slate-600"></div>
            </div>
          </div>
        </div>

        {/* Right Column - Lists */}
        <div className="flex-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-xs font-bold text-blue-400 mb-1">Selected Date</h4>
            <h2 className="text-xl font-bold text-white">Saturday, 18 July 2026</h2>
            <p className="text-xs text-slate-500 mt-1">Saturday</p>
          </div>

          <div className="space-y-4">
            {/* Batch Classes */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-purple-400" />
                Batch Classes (0)
              </h3>
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 flex items-center justify-center text-sm text-slate-500">
                No batch classes scheduled for this date
              </div>
            </div>

            {/* Meetings */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
                <Video size={16} className="text-green-400" />
                Meetings (0)
              </h3>
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 flex items-center justify-center text-sm text-slate-500">
                No meetings scheduled for this date
              </div>
            </div>

            {/* Live Sessions */}
            <div>
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
                <Monitor size={16} className="text-cyan-400" />
                Live Sessions (0)
              </h3>
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-8 flex items-center justify-center text-sm text-slate-500">
                No live sessions scheduled for this date
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

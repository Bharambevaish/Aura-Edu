"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Eye,
  Share2,
  Plus,
  Type,
  Mail,
  Phone,
  Globe,
  Hash,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Calendar,
  Clock,
  CalendarClock,
  X
} from 'lucide-react';

const fieldTypes = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'paragraph', label: 'Paragraph', icon: AlignLeft },
  { id: 'dropdown', label: 'Dropdown', icon: ChevronDown },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { id: 'radio', label: 'Radio', icon: Circle },
  { id: 'file', label: 'File Upload', icon: Upload },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'datetime', label: 'Date & Time', icon: CalendarClock },
];

const quickPresets = [
  { label: 'Full Name', type: 'TEXT' },
  { label: 'Phone Number', type: 'PHONE' },
  { label: 'Email Address', type: 'EMAIL' },
  { label: 'Preferred Date', type: 'DATE' },
  { label: 'Preferred Time', type: 'TIME' },
  { label: 'Website', type: 'URL' },
];

export default function CreateFormPage() {
  const [fields, setFields] = useState<{ id: number; type: string; label: string }[]>([]);
  const [collectEmail, setCollectEmail] = useState(false);
  const [preventDuplicates, setPreventDuplicates] = useState(false);

  const addField = (type: string) => {
    setFields(prev => [...prev, { id: Date.now(), type, label: `New ${type} Field` }]);
  };

  const removeField = (id: number) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-900/40 px-6 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin-dashboard/lms/forms" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">FORMS BUILDER</p>
            <h1 className="text-sm font-bold text-white">Create New Form</h1>
          </div>
          <span className="text-xs text-slate-500 ml-2">{fields.length} questions · 0 responses</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
            <Save size={14} /> Save
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
            <Eye size={14} /> Preview
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Form Canvas */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 mb-4 shadow-sm">
              <input
                type="text"
                placeholder="Form Title"
                className="w-full text-xl font-bold bg-transparent text-white placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-slate-600 pb-1 mb-3 transition-colors"
              />
              <input
                type="text"
                placeholder="Form description (optional)"
                className="w-full text-sm bg-transparent text-slate-400 placeholder-slate-600 focus:outline-none"
              />
              <div className="mt-4 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-medium">Description Align</label>
                  <select className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none">
                    <option>Left</option>
                    <option>Center</option>
                    <option>Right</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400 font-medium">Type</label>
                  <select className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none">
                    <option>Promotional / Leads (PR)</option>
                    <option>Admission</option>
                    <option>Feedback</option>
                    <option>Survey</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fields Area */}
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3 group">
                  <div className="flex-1">
                    <input
                      type="text"
                      defaultValue={field.label}
                      className="w-full bg-transparent text-sm font-medium text-white focus:outline-none border-b border-transparent focus:border-slate-600 pb-0.5 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{field.type}</p>
                  </div>
                  <button
                    onClick={() => removeField(field.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Empty State */}
              {fields.length === 0 && (
                <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-900/50 rounded-full flex items-center justify-center mb-3">
                    <Plus size={20} className="text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">No fields yet</p>
                  <p className="text-xs text-slate-500">Add fields from the right pane to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 border-l border-slate-800 bg-slate-900/40 overflow-y-auto">
          {/* Add Field */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Add Field</h3>
            <div className="grid grid-cols-3 gap-2">
              {fieldTypes.map((ft) => (
                <button
                  key={ft.id}
                  onClick={() => addField(ft.label)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:scale-105 ${
                    ft.id === 'dropdown'
                      ? 'bg-blue-900/30 border-blue-500/50 text-blue-400'
                      : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <ft.icon size={18} />
                  <span className="text-[9px] font-medium leading-tight text-center">{ft.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Quick Presets</h3>
            <p className="text-[10px] text-slate-500 mb-3">Add commonly used fields in one click.</p>
            <div className="space-y-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => addField(preset.label)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg hover:border-slate-500 hover:bg-white/5 transition-colors group"
                >
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{preset.label}</span>
                  <span className="text-[9px] font-bold text-blue-400">{preset.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300">Collect Email</label>
                <button
                  onClick={() => setCollectEmail(!collectEmail)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${collectEmail ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${collectEmail ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300">Prevent Duplicates</label>
                <button
                  onClick={() => setPreventDuplicates(!preventDuplicates)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${preventDuplicates ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${preventDuplicates ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Success Message</label>
                <textarea
                  rows={2}
                  defaultValue="Thank you! Your response has been recorded."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Filter,
  Download,
  Search,
  LayoutGrid,
  List,
  Inbox,
  Calendar,
  ChevronDown,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

type Task = {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  deadline: string;
  status: 'To Do' | 'In Progress' | 'Done';
};

export default function TaskManagerPage() {
  const [view, setView] = useState<'workspace' | 'list'>('workspace');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: 'Unassigned', deadline: '', status: 'To Do' as Task['status'] });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    setTasks(prev => [...prev, { ...newTask, id: Date.now() }]);
    setNewTask({ title: '', description: '', assignedTo: 'Unassigned', deadline: '', status: 'To Do' });
    setShowCreateModal(false);
  };

  const statusColumns: Task['status'][] = ['To Do', 'In Progress', 'Done'];

  const getStatusStyle = (status: Task['status']) => {
    switch (status) {
      case 'To Do': return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'In Progress': return 'bg-amber-900/30 text-amber-400 border-amber-900/50';
      case 'Done': return 'bg-green-900/30 text-green-400 border-green-900/50';
    }
  };

  const getColHeaderStyle = (status: Task['status']) => {
    switch (status) {
      case 'To Do': return 'border-slate-600 bg-slate-800/50 text-slate-300';
      case 'In Progress': return 'border-amber-900/50 bg-amber-900/20 text-amber-400';
      case 'Done': return 'border-green-900/50 bg-green-900/20 text-green-400';
    }
  };

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen text-slate-200 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Task Management Center</h1>
          <p className="text-sm text-slate-400 mt-1">Prioritize, assign, and track work across your team.</p>
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative min-w-[300px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks by title, description, or person"
            className="w-full pl-9 pr-4 py-2 bg-[#171717] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{tasks.length} of {tasks.length} tasks</span>
          <div className="flex items-center bg-[#171717] border border-slate-700 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'workspace' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={14} /> Workspace
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>
      </div>

      {/* Workspace View - Kanban */}
      {view === 'workspace' && (
        tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-[#171717] border border-slate-800 rounded-full flex items-center justify-center">
              <Inbox size={28} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No tasks yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors"
            >
              <Plus size={16} /> Create your first task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {statusColumns.map(col => (
              <div key={col} className="space-y-3">
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${getColHeaderStyle(col)}`}>
                  <span className="text-xs font-bold uppercase tracking-wider">{col}</span>
                  <span className="text-xs font-bold">{tasks.filter(t => t.status === col).length}</span>
                </div>
                {tasks.filter(t => t.status === col).map(task => (
                  <div key={task.id} className="bg-[#171717] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border flex-shrink-0 ${getStatusStyle(task.status)}`}>{task.status}</span>
                    </div>
                    {task.description && <p className="text-xs text-slate-500 mb-3">{task.description}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><User size={11} /> {task.assignedTo}</span>
                      {task.deadline && <span className="flex items-center gap-1"><Calendar size={11} /> {task.deadline}</span>}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => { setNewTask(p => ({ ...p, status: col })); setShowCreateModal(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-[#171717] rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                >
                  <Plus size={14} /> Add task
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* List View */}
      {view === 'list' && (
        tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-[#171717] border border-slate-800 rounded-full flex items-center justify-center">
              <Inbox size={28} className="text-slate-600" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No tasks yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#171717] border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors"
            >
              <Plus size={16} /> Create your first task
            </button>
          </div>
        ) : (
          <div className="bg-[#171717] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#111111]">
                  <th className="py-3 px-4">TITLE</th>
                  <th className="py-3 px-4">ASSIGNED TO</th>
                  <th className="py-3 px-4">DEADLINE</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-slate-800/50 hover:bg-[#262626]/40 transition-colors text-sm">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{task.title}</div>
                      {task.description && <div className="text-xs text-slate-500">{task.description}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{task.assignedTo}</td>
                    <td className="py-3 px-4 text-slate-400 text-xs">{task.deadline || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusStyle(task.status)}`}>{task.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#171717] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Create Task</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add a new task to your workspace.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-[#262626]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tags */}
            <div className="px-6 pt-4">
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold border border-slate-700">Todo</span>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Add details or content"
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Assigned to</label>
                  <div className="relative">
                    <select
                      value={newTask.assignedTo}
                      onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none"
                    >
                      <option>Unassigned</option>
                      <option>Charudatta Warke</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={e => setNewTask(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={newTask.status}
                    onChange={e => setNewTask(p => ({ ...p, status: e.target.value as Task['status'] }))}
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium hover:bg-[#262626] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

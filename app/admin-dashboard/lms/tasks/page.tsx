"use client";

/**
 * Task Manager — team Kanban on live data. Drag cards between columns (or
 * use the arrows), filter to your own tasks, export CSV.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Modal, useToast } from "@/components/ui";
import { Plus, RefreshCw, Download, Search, LayoutGrid, List, Calendar, User, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { getTasks, saveTask, moveTask, deleteTask, type TaskRow } from "@/lib/actions/tasks";
import type { TaskPriority, TaskStatus } from "@/lib/models/Task";

const COLUMNS: { status: TaskStatus; label: string; head: string }[] = [
  { status: "todo", label: "To Do", head: "border-slate-600 bg-slate-800/50 text-slate-300" },
  { status: "in_progress", label: "In Progress", head: "border-amber-900/50 bg-amber-900/20 text-amber-400" },
  { status: "done", label: "Done", head: "border-green-900/50 bg-green-900/20 text-green-400" },
];
const PRIORITY: Record<TaskPriority, string> = {
  high: "bg-rose-500/15 text-rose-300",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-slate-700/50 text-slate-300",
};
const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "No due date");
const isOverdue = (t: TaskRow) => t.status !== "done" && !!t.dueDate && new Date(t.dueDate) < new Date();

type Form = { title: string; description: string; status: TaskStatus; priority: TaskPriority; assigneeId: string; dueDate: string };
const EMPTY: Form = { title: "", description: "", status: "todo", priority: "medium", assigneeId: "", dueDate: "" };

export default function TaskManagerPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Awaited<ReturnType<typeof getTasks>> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [priority, setPriority] = useState("");
  const [editing, setEditing] = useState<TaskRow | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getTasks().then((d) => !ignore && setData(d)).catch(() => toast("Could not load tasks.", "error"));
    return () => {
      ignore = true;
    };
  }, [reloadKey, toast]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const tasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data?.tasks ?? []).filter(
      (t) =>
        (!mineOnly || t.assigneeId === data?.me) &&
        (!priority || t.priority === priority) &&
        (!q || [t.title, t.description, t.assigneeName].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, search, mineOnly, priority]);

  const move = async (t: TaskRow, status: TaskStatus) => {
    if (t.status === status) return;
    // Optimistic update so the card moves immediately.
    setData((d) => (d ? { ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, status } : x)) } : d));
    const res = await moveTask(t.id, status);
    if (!res.ok) {
      toast(res.message, "error");
      reload();
    }
  };

  const openEdit = (t: TaskRow) => {
    setForm({ title: t.title, description: t.description, status: t.status, priority: t.priority, assigneeId: t.assigneeId, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "" });
    setEditing(t);
  };

  const save = async () => {
    if (!editing) return;
    const res = await saveTask(editing === "new" ? null : editing.id, form);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setEditing(null);
      reload();
    }
  };

  const remove = async () => {
    if (!editing || editing === "new") return;
    const res = await deleteTask(editing.id);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setEditing(null);
      reload();
    }
  };

  const exportCsv = () => {
    const rows = [["Title", "Status", "Priority", "Assignee", "Due", "Created by"], ...tasks.map((t) => [t.title, t.status, t.priority, t.assigneeName, t.dueDate?.slice(0, 10) ?? "", t.createdByName])];
    const blob = new Blob([rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const Card = ({ t }: { t: TaskRow }) => {
    const idx = COLUMNS.findIndex((c) => c.status === t.status);
    return (
      <div
        draggable
        onDragStart={() => setDragId(t.id)}
        onDragEnd={() => setDragId(null)}
        onClick={() => openEdit(t)}
        className={`p-3 rounded-lg bg-slate-950/70 border cursor-pointer space-y-2 transition-colors ${isOverdue(t) ? "border-rose-500/40" : "border-slate-800 hover:border-emerald-500/40"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white leading-snug">{t.title}</p>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY[t.priority]}`}>{t.priority}</span>
        </div>
        {t.description && <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>}
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><User size={11} /> {t.assigneeName}</span>
          <span className={`flex items-center gap-1 ${isOverdue(t) ? "text-rose-400 font-semibold" : ""}`}><Calendar size={11} /> {fmt(t.dueDate)}</span>
        </div>
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {idx > 0 && <button onClick={() => move(t, COLUMNS[idx - 1].status)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white" title="Move left"><ChevronLeft size={12} /></button>}
          {idx < COLUMNS.length - 1 && <button onClick={() => move(t, COLUMNS[idx + 1].status)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white" title="Move right"><ChevronRight size={12} /></button>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Task Management Center</h1>
          <p className="text-sm text-slate-400 mt-1">Prioritize, assign and track work across your team.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={reload}><RefreshCw size={16} /> Refresh</Button>
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!tasks.length}><Download size={16} /> Export</Button>
          <Button size="sm" onClick={() => { setForm(EMPTY); setEditing("new"); }}><Plus size={16} /> Create Task</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks or people…" className={`${inputCls} pl-9`} />
        </div>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputCls} w-40`}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} /> My tasks
        </label>
        <div className="flex bg-slate-900/50 border border-slate-700 rounded-lg p-0.5">
          <button onClick={() => setView("board")} className={`p-1.5 rounded ${view === "board" ? "bg-slate-700 text-white" : "text-slate-400"}`} title="Board"><LayoutGrid size={16} /></button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-slate-700 text-white" : "text-slate-400"}`} title="List"><List size={16} /></button>
        </div>
      </div>

      {!data && <p className="text-sm text-slate-500">Loading tasks…</p>}

      {data && view === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const t = data.tasks.find((x) => x.id === dragId);
                  if (t) void move(t, col.status);
                }}
                className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-3 min-h-[300px]"
              >
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold uppercase ${col.head}`}>
                  {col.label} <span>{colTasks.length}</span>
                </div>
                {colTasks.length === 0 && <p className="text-xs text-slate-600 text-center py-6">Drop tasks here</p>}
                {colTasks.map((t) => <Card key={t.id} t={t} />)}
              </div>
            );
          })}
        </div>
      )}

      {data && view === "list" && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-3 px-4">Task</th><th className="py-3 px-4">Status</th><th className="py-3 px-4">Priority</th><th className="py-3 px-4">Assignee</th><th className="py-3 px-4">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} onClick={() => openEdit(t)} className="border-b border-slate-800/50 hover:bg-white/5 cursor-pointer">
                  <td className="py-3 px-4 text-white">{t.title}</td>
                  <td className="py-3 px-4 text-slate-300">{COLUMNS.find((c) => c.status === t.status)?.label}</td>
                  <td className="py-3 px-4"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${PRIORITY[t.priority]}`}>{t.priority}</span></td>
                  <td className="py-3 px-4 text-slate-300">{t.assigneeName}</td>
                  <td className={`py-3 px-4 ${isOverdue(t) ? "text-rose-400" : "text-slate-400"}`}>{fmt(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Create task" : "Edit task"}
        description={editing && editing !== "new" ? `Created by ${editing.createdByName}` : undefined}
        footer={
          <>
            {editing && editing !== "new" && editing.canDelete && (
              <Button variant="danger" size="sm" onClick={remove}><Trash2 size={14} /> Delete</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save}>Save</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={`${inputCls} md:col-span-2`} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={`${inputCls} md:col-span-2`} rows={3} placeholder="Details" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className={inputCls} value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">Unassigned</option>
            {data?.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
          <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
            {COLUMNS.map((c) => <option key={c.status} value={c.status}>{c.label}</option>)}
          </select>
        </div>
      </Modal>
    </div>
  );
}

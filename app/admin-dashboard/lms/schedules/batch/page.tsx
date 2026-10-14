"use client";

/**
 * Batch Schedule — the weekly timetable per batch (live DB). Add, edit and
 * remove recurring classes; the server refuses batch and teacher clashes.
 * These classes also appear on the Date-wise view and the student Schedule.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal, useToast } from "@/components/ui";
import { RefreshCw, Users, CheckCircle, Calendar, CalendarX, Plus, Monitor, MapPin, Clock } from "lucide-react";
import {
  getTimetableOverview,
  saveTimetableSlot,
  deleteTimetableSlot,
  type TimetableOverview,
  type SlotRow,
} from "@/lib/actions/timetable";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const MODE_PILL: Record<string, string> = {
  offline: "bg-slate-800 text-slate-300",
  online: "bg-cyan-500/15 text-cyan-300",
  hybrid: "bg-purple-500/15 text-purple-300",
};

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

type Form = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
  mode: "offline" | "online" | "hybrid";
  meetingLink: string;
};

const EMPTY: Form = { dayOfWeek: 1, startTime: "09:00", endTime: "10:30", subject: "", teacherId: "", teacherName: "", room: "", mode: "offline", meetingLink: "" };

function Stat({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: number | string; tone: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={tone} />
        <h3 className={`text-[10px] font-bold uppercase tracking-wider ${tone}`}>{label}</h3>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function BatchwiseSchedulePage() {
  const { toast } = useToast();
  const [data, setData] = useState<TimetableOverview | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<SlotRow | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getTimetableOverview()
      .then((d) => {
        if (ignore) return;
        setData(d);
        setSelected((cur) => cur || d.batches[0]?.name || "");
      })
      .catch(() => toast("Could not load the timetable.", "error"));
    return () => {
      ignore = true;
    };
  }, [reloadKey, toast]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const batch = data?.batches.find((b) => b.name === selected);

  const openNew = (day?: number) => {
    setForm({ ...EMPTY, dayOfWeek: day ?? 1 });
    setEditing("new");
  };
  const openEdit = (slot: SlotRow) => {
    setForm({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subject,
      teacherId: slot.teacherId,
      teacherName: slot.teacherId ? "" : slot.teacherName,
      room: slot.room,
      mode: slot.mode,
      meetingLink: slot.meetingLink,
    });
    setEditing(slot);
  };

  const save = async () => {
    if (!batch || !editing) return;
    setSaving(true);
    const res = await saveTimetableSlot(editing === "new" ? null : editing.id, { ...form, batch: batch.name });
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setEditing(null);
      reload();
    }
  };

  const remove = async () => {
    if (!editing || editing === "new") return;
    setSaving(true);
    const res = await deleteTimetableSlot(editing.id);
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setEditing(null);
      reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Batch Schedule</h1>
          <p className="text-sm text-slate-400 mt-1">Weekly timetable per batch — classes, teachers, rooms and live links.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={reload}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button size="sm" onClick={() => openNew()} disabled={!batch}>
            <Plus size={16} /> Add class
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Stat icon={Users} label="Total batches" value={data?.stats.batches ?? "—"} tone="text-blue-400" />
        <Stat icon={CheckCircle} label="Active" value={data?.stats.active ?? "—"} tone="text-green-400" />
        <Stat icon={Calendar} label="With schedule" value={data?.stats.withSchedule ?? "—"} tone="text-emerald-400" />
        <Stat icon={CalendarX} label="Without schedule" value={data?.stats.withoutSchedule ?? "—"} tone="text-orange-400" />
        <Stat icon={Monitor} label="Classes / week" value={data?.stats.weeklyClasses ?? "—"} tone="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Batch list */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 space-y-1 h-fit">
          {data?.batches.map((b) => (
            <button
              key={b.name}
              onClick={() => setSelected(b.name)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                selected === b.name ? "bg-emerald-500/15 text-emerald-300" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <p className="text-sm font-semibold">{b.name}</p>
              <p className="text-[11px] text-slate-500">
                {b.course} · {b.slots.length ? `${b.slots.length} classes/week` : "no schedule yet"}
              </p>
            </button>
          ))}
          {data && data.batches.length === 0 && <p className="text-sm text-slate-500 p-3">Create a batch first.</p>}
        </div>

        {/* Weekly grid */}
        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-x-auto">
          {batch ? (
            <div className="grid grid-cols-7 gap-2 min-w-[840px]">
              {DAYS.map((d) => {
                const daySlots = batch.slots.filter((s) => s.dayOfWeek === d.value);
                return (
                  <div key={d.value} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-400 uppercase">{d.label}</span>
                      <button onClick={() => openNew(d.value)} className="text-slate-500 hover:text-emerald-400" title={`Add a ${d.label} class`}>
                        <Plus size={14} />
                      </button>
                    </div>
                    {daySlots.length === 0 && <div className="h-16 rounded-lg border border-dashed border-slate-800" />}
                    {daySlots.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => openEdit(s)}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-1"
                      >
                        <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <Clock size={10} /> {s.startTime}–{s.endTime}
                        </p>
                        <p className="text-xs font-semibold text-white leading-tight">{s.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate">{s.teacherName || "No teacher"}</p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
                            <MapPin size={9} /> {s.room || "—"}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${MODE_PILL[s.mode]}`}>{s.mode}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 p-6">{data ? "Select a batch." : "Loading timetable…"}</p>
          )}
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? `Add class · ${batch?.name ?? ""}` : `Edit class · ${batch?.name ?? ""}`}
        description="Repeats every week. Clashes with this batch's other classes or the teacher's other classes are refused."
        footer={
          <>
            {editing && editing !== "new" && (
              <Button variant="danger" size="sm" onClick={remove} disabled={saving}>Remove</Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-xs text-slate-400 space-y-1">
            <span>Day</span>
            <select className={inputCls} value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}>
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Starts</span>
            <input type="time" className={inputCls} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Ends</span>
            <input type="time" className={inputCls} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1 md:col-span-3">
            <span>Subject</span>
            <input className={inputCls} placeholder="e.g. Physics — Rotational Mechanics" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Teacher (staff)</span>
            <select className={inputCls} value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
              <option value="">Other / visiting faculty</option>
              {data?.teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-400 space-y-1 md:col-span-2">
            <span>{form.teacherId ? "Teacher name (from staff account)" : "Teacher name"}</span>
            <input className={inputCls} disabled={!!form.teacherId} placeholder="e.g. Dr. Anil Verma" value={form.teacherId ? data?.teachers.find((t) => t.id === form.teacherId)?.name ?? "" : form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Mode</span>
            <select className={inputCls} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as Form["mode"] })}>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
              <option value="online">Online</option>
            </select>
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Room</span>
            <input className={inputCls} placeholder="e.g. Hall A" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Class link {form.mode === "offline" ? "(not needed)" : ""}</span>
            <input className={inputCls} disabled={form.mode === "offline"} placeholder="https://…" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
          </label>
        </div>
      </Modal>
    </div>
  );
}

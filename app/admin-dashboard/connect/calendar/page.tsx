"use client";

import React, { useState, useEffect } from "react";
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  type CalendarEventRow,
} from "@/lib/actions/connect";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

const EVENT_STYLE: Record<string, string> = {
  class: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  meeting: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  exam: "bg-red-500/20 text-red-400 border-red-500/30",
  event: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  holiday: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const EVENT_ICON = { class: "Class", meeting: "Meeting", exam: "Exam", event: "Event", holiday: "Holiday" } as const;

type View = "Month" | "Week" | "Day" | "Agenda";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d: Date) => toISO(d).slice(0, 7);
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const todayStr = () => toISO(new Date());

export default function CalendarCenterPage() {
  const [view, setView] = useState<View>("Month");
  const [cursor, setCursor] = useState(() => parseISO(todayStr()));
  const [events, setEvents] = useState<CalendarEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState("class");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<CalendarEventRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cursorMonth = monthKey(cursor);

  useEffect(() => {
    let ignore = false;
    listCalendarEvents(cursorMonth)
      .then((evs) => {
        if (!ignore) setEvents(evs);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [cursorMonth]);

  const step = (dir: 1 | -1) => {
    const next = new Date(cursor);
    if (view === "Month" || view === "Agenda") next.setMonth(next.getMonth() + dir);
    else if (view === "Week") next.setDate(next.getDate() + 7 * dir);
    else next.setDate(next.getDate() + dir);
    setCursor(next);
  };

  const goToday = () => setCursor(parseISO(todayStr()));

  const toggleType = (t: string) =>
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const filtered = events.filter((e) => activeTypes.length === 0 || activeTypes.includes(e.type));
  const byDay = (iso: string) => filtered.filter((e) => e.date === iso);
  const dayEvents = (d: Date, off: number) => {
    const dd = new Date(d);
    dd.setDate(dd.getDate() + off);
    return { iso: toISO(dd), events: byDay(toISO(dd)), d: dd };
  };

  const openNew = () => {
    setTitle("");
    setDate(toISO(cursor));
    setTime("10:00");
    setType("class");
    setDescription("");
    setShowModal(true);
  };

  const save = async () => {
    if (!title.trim() || !date || !time) {
      toast("Fill title, date and time", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await createCalendarEvent({ title, date, time, type, description, batchNames: [] });
      toast(res.ok ? "Event added to the calendar" : res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setShowModal(false);
        setLoading(true);
        listCalendarEvents(cursorMonth)
          .then(setEvents)
          .finally(() => setLoading(false));
      }
    } catch {
      toast("Something went wrong", "error");
    }
    setSaving(false);
  };

  const runDelete = async () => {
    if (!detail) return;
    setDeleting(true);
    try {
      const res = await deleteCalendarEvent(detail.id);
      toast(res.ok ? "Event removed" : res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== detail.id));
        setDetail(null);
      }
    } catch {
      toast("Delete failed", "error");
    }
    setDeleting(false);
  };

  /* ----- geometry for the active view ----- */
  const renderMonth = () => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const firstDow = new Date(y, m, 1).getDay();
    const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  const renderWeek = () => {
    const monday = new Date(cursor);
    monday.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const headerLabel =
    view === "Day"
      ? cursor.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : view === "Week"
        ? `Week of ${renderWeek()[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
        : cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const isToday = (iso: string) => iso === todayStr();

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar Center" subtitle="The institute calendar — classes, exams, holidays and events, all saved to the database." icon={<CalendarIcon size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={() => { setLoading(true); listCalendarEvents(cursorMonth).then(setEvents).finally(() => setLoading(false)); }}><RefreshCw size={14} /></Button>
        <Button size="sm" onClick={openNew}><Plus size={14} /> New Event</Button>
      </PageHeader>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">{headerLabel}</h2>
            <div className="flex items-center gap-1">
              <button onClick={() => step(-1)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={goToday} className="px-3 py-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors">Today</button>
              <button onClick={() => step(1)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-slate-900 border border-white/10 rounded-lg hidden sm:flex">
              {(["Month", "Week", "Day", "Agenda"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    view === v ? "bg-emerald-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/10 flex flex-wrap gap-2 text-xs bg-slate-900/30">
          <span className="font-medium text-slate-400 mr-1 mt-1">Types:</span>
          {(["class", "meeting", "exam", "event", "holiday"] as const).map((t) => {
            const active = activeTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`px-3 py-1 rounded-full border capitalize transition-colors ${EVENT_STYLE[t]} ${active ? "opacity-100" : "opacity-30 hover:opacity-60"}`}
              >
                {EVENT_ICON[t]}s
              </button>
            );
          })}
          {activeTypes.length > 0 && (
            <button onClick={() => setActiveTypes([])} className="px-2 py-1 rounded-full text-slate-400 hover:text-white">Clear</button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
        ) : view === "Agenda" ? (
          <div className="divide-y divide-white/5 max-h-[560px] overflow-y-auto custom-scrollbar">
            {filtered.length === 0 && <div className="text-center py-16 text-slate-500">No events this month.</div>}
            {filtered.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] text-left transition-colors">
                <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{parseISO(e.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                  <span className="text-lg font-bold text-white leading-none">{e.day}</span>
                  <span className="text-[10px] text-slate-500">{parseISO(e.date).toLocaleDateString("en-IN", { weekday: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border capitalize ${EVENT_STYLE[e.type]}`}>{EVENT_ICON[e.type]}</span>
                    <h3 className="text-sm font-semibold text-white truncate">{e.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{e.time}{e.description ? ` · ${e.description}` : ""}</p>
                </div>
              </button>
            ))}
          </div>
        ) : view === "Day" ? (
          <div className="divide-y divide-white/5">
            {dayEvents(cursor, 0).events.length === 0 && <div className="text-center py-16 text-slate-500">No events on {headerLabel}.</div>}
            {dayEvents(cursor, 0).events.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] text-left transition-colors">
                <span className={`px-2 py-1 text-[10px] font-bold rounded border capitalize shrink-0 ${EVENT_STYLE[e.type]}`}>{e.time} · {EVENT_ICON[e.type]}</span>
                <h3 className="text-sm font-semibold text-white truncate">{e.title}</h3>
              </button>
            ))}
          </div>
        ) : view === "Week" ? (
          <div className="bg-slate-900/50">
            <div className="grid grid-cols-7 border-b border-white/10">
              {renderWeek().map((d) => (
                <div key={toISO(d)} className={`py-2 text-center text-xs font-medium border-r border-white/5 last:border-r-0 ${isToday(toISO(d)) ? "text-emerald-400" : "text-slate-400"}`}>
                  {d.toLocaleDateString("en-IN", { weekday: "short" })} {d.getDate()}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[130px]">
              {renderWeek().map((d, i) => (
                <div key={i} className={`border-r border-b border-white/5 last:border-r-0 p-2 transition-colors hover:bg-white/[0.02] ${isToday(toISO(d)) ? "bg-emerald-500/[0.04]" : ""}`}>
                  <div className="space-y-1 overflow-y-auto custom-scrollbar pr-1">
                    {dayEvents(d, 0).events.map((e) => (
                      <button key={e.id} onClick={() => setDetail(e)} className={`w-full text-left text-[10px] px-1.5 py-1 rounded border truncate font-medium cursor-pointer ${EVENT_STYLE[e.type]}`} title={`${e.title} at ${e.time}`}>
                        {e.time} {e.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-900/50">
            <div className="grid grid-cols-7 border-b border-white/10">
              {DAYS.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-medium text-slate-400 border-r border-white/5 last:border-r-0">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {renderMonth().map((date, i) => {
                if (date === null) {
                  return <div key={`blank-${i}`} className="border-r border-b border-white/5 last:border-r-0 bg-slate-900/80" />;
                }
                const iso = `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(date)}`;
                const todays = isToday(iso);
                const dayEvts = byDay(iso);
                return (
                  <div key={i} className={`border-r border-b border-white/5 last:border-r-0 p-2 transition-colors hover:bg-white/[0.02] ${todays ? "bg-emerald-500/[0.04]" : ""}`}>
                    <div className="flex justify-between items-start">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${todays ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20" : "text-slate-300"}`}>{date}</span>
                      <button onClick={openNew} className="text-slate-600 hover:text-emerald-400 p-0.5 rounded transition-colors" title="Add event"><Plus size={12} /></button>
                    </div>
                    <div className="mt-2 space-y-1 overflow-y-auto custom-scrollbar h-[70px] pr-1">
                      {dayEvts.map((e) => (
                        <button key={e.id} onClick={() => setDetail(e)} className={`w-full text-left text-[10px] px-1.5 py-1 rounded border truncate font-medium cursor-pointer ${EVENT_STYLE[e.type]}`} title={`${e.title} at ${e.time}`}>
                          {e.time} {e.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Event" description="It appears on the calendar as soon as you save." footer={<><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button loading={saving} onClick={save}>Save Event</Button></>}>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Event Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add title..." className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Event Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="class">Class / Lecture</option>
              <option value="meeting">Meeting</option>
              <option value="exam">Exam / Test</option>
              <option value="event">Other Event</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Description (Optional)</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details attendees should know..." className={`${inputCls} resize-y`} />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title}
        footer={<><Button variant="ghost" onClick={() => setDetail(null)}>Close</Button><Button variant="danger" loading={deleting} onClick={runDelete}><Trash2 size={14} /> Delete Event</Button></>}
      >
        {detail && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded border capitalize ${EVENT_STYLE[detail.type]}`}>{EVENT_ICON[detail.type]}</span>
              <span className="text-sm text-slate-300">
                {parseISO(detail.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at {detail.time}
              </span>
            </div>
            {detail.description && <p className="text-sm text-slate-400">{detail.description}</p>}
            {detail.batchNames.length > 0 && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5"><Users size={12} /> {detail.batchNames.join(", ")}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
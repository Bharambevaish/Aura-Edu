"use client";

/**
 * Student schedule — the signed-in student's live classes, webinars, calendar
 * events and batch tests (getMySchedule), from a week ago to 30 days ahead.
 * Per-batch recurring timetable slots are a later module.
 */
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import { getMySchedule, type ScheduleItem } from "@/lib/actions/student-portal";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
  GraduationCap,
  PartyPopper,
  ExternalLink,
} from "lucide-react";

type Filter = "Day" | "This Week" | "Upcoming" | "Completed";

const KIND_LABEL: Record<ScheduleItem["kind"], string> = {
  class: "Live class",
  webinar: "Webinar",
  test: "Test",
  exam: "Exam",
  event: "Event",
  holiday: "Holiday",
};

const STATUS_PILL: Record<ScheduleItem["status"], string> = {
  Live: "bg-rose-500/20 text-rose-300",
  Today: "bg-cyan-500/20 text-cyan-300",
  Upcoming: "bg-amber-500/20 text-amber-300",
  Completed: "bg-emerald-500/20 text-emerald-400",
  Cancelled: "bg-slate-700/40 text-slate-400 line-through",
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function KindIcon({ kind }: { kind: ScheduleItem["kind"] }) {
  if (kind === "test" || kind === "exam") return <GraduationCap className="h-4 w-4 text-purple-400" />;
  if (kind === "event" || kind === "holiday") return <PartyPopper className="h-4 w-4 text-pink-400" />;
  return <Video className="h-4 w-4 text-cyan-400" />;
}

export default function SchedulePage() {
  const { profile } = useStudent();
  const [items, setItems] = useState<ScheduleItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>("Day");
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    let ignore = false;
    getMySchedule()
      .then((d) => {
        if (!ignore) setItems(d.items);
      })
      .catch(() => {
        if (!ignore) setItems([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items ?? []) {
      const k = dayKey(new Date(it.date));
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [items]);

  const visible = useMemo(() => {
    if (!items) return [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return items.filter((it) => {
      const d = new Date(it.date);
      if (filter === "Day") return dayKey(d) === dayKey(selectedDay);
      if (filter === "This Week") return d >= todayStart && d < weekEnd;
      if (filter === "Upcoming") return d >= todayStart && it.status !== "Completed" && it.status !== "Cancelled";
      return it.status === "Completed";
    });
  }, [items, filter, selectedDay]);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leadingBlanks = month.getDay();
  const todayKey = dayKey(new Date());

  const heading =
    filter === "Day"
      ? selectedDay.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : filter;

  return (
    <div className="space-y-6">
      {/* 1. Header & Filter */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Class Schedule</h2>
          </div>
          <p className="text-xs text-slate-400">
            Live classes, tests and events for {profile.batch} ({profile.academicYear}).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {(["Day", "This Week", "Upcoming", "Completed"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              {f === "Day" ? "Selected day" : f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Calendar + list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day} className="font-bold text-slate-500 py-1">{day}</span>
            ))}
            {Array.from({ length: leadingBlanks }, (_, i) => <span key={`b${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
              const k = dayKey(date);
              const isSelected = filter === "Day" && k === dayKey(selectedDay);
              const count = byDay.get(k) ?? 0;
              return (
                <button
                  key={k}
                  onClick={() => {
                    setSelectedDay(date);
                    setFilter("Day");
                  }}
                  className={`relative py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                      : k === todayKey
                        ? "border border-cyan-500/50 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                  {count > 0 && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">Dots mark days with sessions. Click a day to see it.</p>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" /> {heading}
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {items ? `${visible.length} item${visible.length === 1 ? "" : "s"}` : "Loading…"}
            </span>
          </h3>

          {items && visible.length === 0 && (
            <p className="text-sm text-slate-500 py-6 text-center">Nothing scheduled here.</p>
          )}

          <div className="space-y-4">
            {visible.map((item) => {
              const internal = item.link.startsWith("/");
              return (
                <div key={item.id} className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/30 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">
                      {new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {item.time}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${STATUS_PILL[item.status]}`}>{item.status}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <KindIcon kind={item.kind} /> {item.title}
                  </h4>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>
                      {KIND_LABEL[item.kind]} · <span className="text-slate-300">{item.detail}</span>
                    </span>
                    {item.link && item.status !== "Completed" && (
                      internal ? (
                        <Link href={item.link} className="text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                          Open <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-semibold hover:underline flex items-center gap-1">
                          Join <ExternalLink className="h-3 w-3" />
                        </a>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

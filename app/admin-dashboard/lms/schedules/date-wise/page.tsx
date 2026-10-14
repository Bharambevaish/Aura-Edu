"use client";

/**
 * Date-wise schedule — every timetable class, live meeting and test on one
 * date across all batches (getDaySchedule).
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, useToast } from "@/components/ui";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, Clock, BookOpen, Video, GraduationCap, ExternalLink } from "lucide-react";
import { getDaySchedule, type DayItem } from "@/lib/actions/timetable";

const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const shift = (iso: string, days: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  return toIso(new Date(y, m - 1, d + days));
};

const KIND = {
  class: { icon: BookOpen, label: "Class", tone: "text-emerald-400 bg-emerald-500/10" },
  meeting: { icon: Video, label: "Live session", tone: "text-cyan-400 bg-cyan-500/10" },
  test: { icon: GraduationCap, label: "Test", tone: "text-purple-400 bg-purple-500/10" },
} as const;

export default function DatewiseSchedulePage() {
  const { toast } = useToast();
  const [date, setDate] = useState(() => toIso(new Date()));
  const [items, setItems] = useState<DayItem[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    getDaySchedule(date)
      .then((d) => {
        if (!ignore) setItems(d.items);
      })
      .catch(() => toast("Could not load the schedule.", "error"));
    return () => {
      ignore = true;
    };
  }, [date, reloadKey, toast]);

  const count = (k: DayItem["kind"]) => items?.filter((i) => i.kind === k).length ?? 0;
  const batches = new Set(items?.filter((i) => i.kind === "class").map((i) => i.batches)).size;
  const label = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Academic Schedule Center</h1>
          <p className="text-sm text-slate-400 mt-1">Classes, live sessions and tests across all batches, by date.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <button onClick={() => setDate(shift(date, -1))} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 border-r border-slate-700" aria-label="Previous day">
              <ChevronLeft size={16} />
            </button>
            <label className="px-3 py-1.5 flex items-center gap-2 text-sm text-white border-r border-slate-700">
              <CalendarIcon size={14} className="text-slate-400" />
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="bg-transparent outline-none text-sm" />
            </label>
            <button onClick={() => setDate(shift(date, 1))} className="px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5" aria-label="Next day">
              <ChevronRight size={16} />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setDate(toIso(new Date()))}>Today</Button>
          <Button variant="secondary" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Classes", value: count("class"), tone: "text-emerald-400" },
          { label: "Live sessions", value: count("meeting"), tone: "text-cyan-400" },
          { label: "Tests", value: count("test"), tone: "text-purple-400" },
          { label: "Batches in class", value: batches, tone: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className={`text-[10px] font-bold uppercase tracking-wider ${s.tone}`}>{s.label}</h3>
            <p className="text-2xl font-bold text-white mt-1">{items ? s.value : "—"}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock size={16} className="text-emerald-400" /> {label}
        </h2>
        {!items && <p className="text-sm text-slate-500">Loading…</p>}
        {items && items.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">Nothing scheduled on this day.</p>}
        {items?.map((it) => {
          const k = KIND[it.kind];
          const internal = it.link.startsWith("/");
          return (
            <div key={it.id} className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="font-mono text-xs text-slate-300 w-24">{it.start}–{it.end}</span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${k.tone}`}>
                <k.icon size={11} /> {k.label}
              </span>
              <div className="flex-1 min-w-[180px]">
                <p className="text-sm font-semibold text-white">{it.title}</p>
                <p className="text-xs text-slate-500">{it.batches} · {it.who} · {it.where}</p>
              </div>
              {it.link &&
                (internal ? (
                  <Link href={it.link} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                    Open <ExternalLink size={11} />
                  </Link>
                ) : (
                  <a href={it.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                    Join <ExternalLink size={11} />
                  </a>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

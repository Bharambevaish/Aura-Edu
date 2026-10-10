"use client";

import React, { useState } from "react";
import { useStudent } from "@/context/StudentContext";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SchedulePage() {
  const { profile } = useStudent();
  const [activeFilter, setActiveFilter] = useState("Today");

  const scheduleItems = [
    {
      id: 1,
      subject: "Physics: Rotational Dynamics & Torque numericals",
      batch: "NEET Batch A",
      time: "09:00 AM - 10:30 AM",
      instructor: "Prof. S. Sharma",
      room: "Hall A-102 & Live Stream",
      type: "Live Hybrid",
      status: "Completed",
    },
    {
      id: 2,
      subject: "Organic Chemistry: Reaction Mechanisms & Aldol",
      batch: "NEET Batch A",
      time: "11:00 AM - 12:30 PM",
      instructor: "Dr. A. Verma",
      room: "Hall A-102 & Live Stream",
      type: "Live Hybrid",
      status: "Upcoming Today",
    },
    {
      id: 3,
      subject: "Biology: Plant Growth & Regulators Worksheet",
      batch: "NEET Batch A",
      time: "02:00 PM - 03:30 PM",
      instructor: "Dr. Meenakshi Sundaram",
      room: "Online Live Stream",
      type: "Virtual",
      status: "Upcoming Today",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Filter */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Class Schedule & Timetable</h2>
          </div>
          <p className="text-xs text-slate-400">
            Daily schedule for {profile.batch} ({profile.academicYear}).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {["Today", "This Week", "Upcoming", "Completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Calendar Grid + Schedule List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar Mini Grid */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase">August 2026</h3>
            <div className="flex items-center gap-1">
              <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day} className="font-bold text-slate-500 py-1">
                {day}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
              const isToday = date === 11;
              return (
                <button
                  key={date}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    isToday
                      ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {date}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" /> Tuesday, 11 August 2026 Sessions
              </span>
              <span className="text-xs font-mono text-cyan-400">3 Sessions Scheduled</span>
            </h3>

            <div className="space-y-4">
              {scheduleItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">
                      {item.time}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "Completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{item.subject}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>Faculty: <strong className="text-slate-200">{item.instructor}</strong></span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="h-3.5 w-3.5 text-cyan-400" /> {item.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

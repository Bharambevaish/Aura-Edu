"use client";

import React, { useState, useEffect } from "react";
import { useStudent } from "@/context/StudentContext";
import { getStudentAttendance, type StudentAttendance } from "@/lib/actions/attendance";
import { Clock, List, Activity, FileSpreadsheet, Loader2 } from "lucide-react";

export default function AttendancePage() {
  const { profile } = useStudent();
  const [db, setDb] = useState<StudentAttendance | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");

  useEffect(() => {
    let ignore = false;
    getStudentAttendance()
      .then((d) => {
        if (!ignore) setDb(d);
      })
      .catch(() => {
        if (!ignore) setDb(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Faculty-marked registers only; an empty state shows until the first one.
  const logs = db?.logs ?? [];
  const totalSessions = db?.totalSessions ?? 0;
  const presentCount = db?.present ?? 0;
  const absentCount = db?.absent ?? 0;
  const lateCount = db?.late ?? 0;
  const attendancePercentage = db?.overallPercentage ?? 0;

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Day,Batch,Subject,CheckIn,Status,Remarks\n" +
      logs
        .map((a) => `${a.date},${a.day},${a.batch},${a.subject},${a.checkIn},${a.status},${a.remarks}`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Log_${profile.admissionNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Attendance Analytics</h2>
            </div>
            <p className="text-xs text-slate-400">
              Faculty-marked attendance log for {profile.name} ({profile.rollNo})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV Log
            </button>
          </div>
        </div>

        {/* Attendance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Overall Attendance</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {db ? `${totalSessions ? attendancePercentage : 0}%` : <LoaderSpinner />}
            </p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Days Present</span>
            <p className="text-2xl font-black text-white font-mono">{presentCount}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Days Absent</span>
            <p className="text-2xl font-black text-slate-400 font-mono">{absentCount}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Tracked</span>
            <p className="text-2xl font-black text-cyan-400 font-mono">
              {totalSessions} {lateCount > 0 ? `• ${lateCount} late` : "Sessions"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Timeline vs Table Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white font-mono uppercase">Attendance History Logs</h3>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "timeline"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> Timeline View
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Tabulated View
          </button>
        </div>
      </div>

      {/* 3. Rendering Views */}
      {logs.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center">
          <p className="text-sm text-slate-400">No attendance sessions recorded yet.</p>
        </div>
      ) : viewMode === "timeline" ? (
        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {logs.map((log) => (
            <div key={log.id} className="relative pl-10">
              <div
                className={`absolute left-2.5 top-3.5 -translate-x-1/2 h-3.5 w-3.5 rounded-full ring-4 ring-[#070B14] ${
                  log.status === "Present" ? "bg-emerald-500" : log.status === "Late" ? "bg-amber-500" : "bg-red-500"
                }`}
              />
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{log.date} ({log.day})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "Present"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.status === "Late"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{log.subject}</h4>
                  <p className="text-xs text-slate-400">
                    Batch: {log.batch}
                    {log.checkIn ? ` | Checked In: ${log.checkIn}` : ""}
                  </p>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Remarks: <span className="text-slate-200">{log.remarks || "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Date & Day</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Batch</th>
                <th className="p-4">Check-In</th>
                <th className="p-4">Status</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-white">{log.date} ({log.day})</td>
                  <td className="p-4">{log.subject}</td>
                  <td className="p-4 font-mono text-cyan-400">{log.batch}</td>
                  <td className="p-4 font-mono">{log.checkIn || "—"}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.status === "Present"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.status === "Late"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{log.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LoaderSpinner() {
  return <Loader2 className="inline animate-spin" size={18} />;
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getBatches, type BatchesOverview } from "@/lib/actions/batches";
import {
  getAttendanceOverview,
  getAttendanceRegister,
  saveAttendanceRegister,
  type AttendanceRegister,
  type AttendanceOverview,
  type AttendanceRegisterRow,
  type AttendanceStatus,
} from "@/lib/actions/attendance";
import {
  CheckSquare,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  CalendarCheck,
  Search,
  Save,
  History,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const currentMonth = () => todayISO().slice(0, 7);

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 appearance-none";

const statusOrder: AttendanceStatus[] = ["present", "absent", "late"];
const statusMeta: Record<AttendanceStatus, { label: string; on: string; off: string }> = {
  present: {
    label: "Present",
    on: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
    off: "border-slate-700 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40",
  },
  absent: {
    label: "Absent",
    on: "bg-red-500/15 text-red-400 border-red-500/40",
    off: "border-slate-700 text-slate-400 hover:text-red-300 hover:border-red-500/40",
  },
  late: {
    label: "Late",
    on: "bg-amber-500/15 text-amber-400 border-amber-500/40",
    off: "border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-500/40",
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AttendanceManagementPage() {
  const [batches, setBatches] = useState<BatchesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [date, setDate] = useState(todayISO());
  const [search, setSearch] = useState("");

  const [register, setRegister] = useState<AttendanceRegister | null>(null);
  const [overview, setOverview] = useState<AttendanceOverview | null>(null);

  const [subject, setSubject] = useState("Regular Session");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const fetchRegister = useCallback(() => {
    if (!batch || !date) return;
    getAttendanceRegister(batch, date)
      .then((r) => {
        setRegister(r);
        setSubject(r.subject);
      })
      .catch(() => setRegister(null));
  }, [batch, date]);

  const fetchOverview = useCallback(() => {
    if (!batch || !month) return;
    getAttendanceOverview(batch, month)
      .then(setOverview)
      .catch(() => setOverview(null));
  }, [batch, month]);

  useEffect(() => {
    let ignore = false;
    getBatches()
      .then((data) => {
        if (ignore) return;
        setBatches(data);
        if (data.batches.length > 0) setBatch((prev) => prev || data.batches[0].name);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    fetchRegister();
  }, [fetchRegister]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const selectBatch = (name: string) => {
    setBatch(name);
    setRegister(null);
    setDate(todayISO());
    setSaveMsg(null);
    setSaveErr(null);
  };

  const selectDate = (value: string) => {
    setDate(value);
    setRegister(null);
    setSaveMsg(null);
    setSaveErr(null);
  };

  const updateRow = (studentId: string, patch: Partial<Pick<AttendanceRegisterRow, "status" | "checkIn" | "remark">>) => {
    setRegister((prev) =>
      prev ? { ...prev, rows: prev.rows.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)) } : prev,
    );
    setSaveMsg(null);
    setSaveErr(null);
  };

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setRegister((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => {
          if (r.studentId !== studentId) return r;
          // clicking the already-active status clears the mark back to unmarked
          return r.status === status ? { ...r, status: null } : { ...r, status };
        }),
      };
    });
    setSaveMsg(null);
    setSaveErr(null);
  };

  const markAll = (status: AttendanceStatus) => {
    setRegister((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: prev.rows.map((r) => ({
          ...r,
          status,
          checkIn: status === "present" ? "08:45 AM" : status === "late" ? "09:05 AM" : r.checkIn,
        })),
      };
    });
    setSaveMsg(null);
    setSaveErr(null);
  };

  const saveRegister = () => {
    if (!register || !batch) return;
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);
    const entries = register.rows.map((r) => ({
      studentId: r.studentId,
      status: (r.status ?? "absent") as AttendanceStatus,
      checkIn: r.checkIn,
      remark: r.remark,
    }));
    saveAttendanceRegister({ batch, date, subject: subject.trim() || "Regular Session", entries })
      .then((res) => {
        if (!res.ok) {
          setSaveErr(res.message ?? "Could not save the register.");
          return;
        }
        setRegister((prev) => {
          if (!prev) return prev;
          return { ...prev, saved: true, rows: prev.rows.map((r) => ({ ...r, status: r.status ?? "absent" })) };
        });
        setSaveMsg(
          `Register saved · ${res.counts?.present ?? 0} present · ${res.counts?.late ?? 0} late · ${res.counts?.absent ?? 0} absent.`,
        );
        fetchOverview();
      })
      .catch(() => setSaveErr("Could not save the register — please try again."))
      .finally(() => setSaving(false));
  };

  const exportCSV = () => {
    if (!register || !batch) return;
    const rows = [
      ["Student", "Admission No", "Roll No", "Status", "Check-in", "Remarks"],
      ...register.rows.map((r) => [
        r.name,
        r.admissionNo,
        r.rollNo,
        r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Unmarked",
        r.checkIn || "-",
        r.remark || "-",
      ]),
    ];
    const csv =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encoded = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `Attendance_${batch.replace(/\s+/g, "_")}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin mr-3" size={20} /> Loading attendance…
      </div>
    );
  }

  if (!batches || batches.batches.length === 0) {
    return (
      <EmptyState
        icon={<Users size={20} />}
        title="No batches yet"
        message="Create a batch and assign students, then come back here to start marking attendance."
        action={
          <Link href="/admin-dashboard/lms/students/batches">
            <Button size="sm">Go to Batches</Button>
          </Link>
        }
      />
    );
  }

  const q = search.trim().toLowerCase();
  const filteredRows = (register?.rows ?? []).filter(
    (r) => r.name.toLowerCase().includes(q) || r.admissionNo.toLowerCase().includes(q),
  );

  const present = register?.rows.filter((r) => r.status === "present").length ?? 0;
  const absent = register?.rows.filter((r) => r.status === "absent").length ?? 0;
  const late = register?.rows.filter((r) => r.status === "late").length ?? 0;
  const total = register?.rows.length ?? 0;
  const pct = total > 0 ? Math.round((present / total) * 100) : null;

  const monthTxt =
    !overview || overview.stats.daysCovered === 0
      ? "no data yet"
      : `${overview.stats.daysCovered} day(s) saved · avg ${overview.stats.percentage}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Daily per-batch register — pick a batch and a day, mark the grid, save. Percentages are computed live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={exportCSV} disabled={!register || register.rows.length === 0}>
            <Download size={16} />
            Export
          </Button>
          <Button size="md" onClick={saveRegister} loading={saving}>
            <Save size={16} />
            Save Register
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Batch</label>
            <select
              value={batch}
              onChange={(e) => selectBatch(e.target.value)}
              className={inputCls}
              disabled={batches.batches.length === 0}
            >
              {batches.batches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.enrolled} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => selectDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {/* Stats row (live from the current register) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="TOTAL" value={total} accent="blue" icon={<Users size={20} />} />
        <StatCard label="PRESENT" value={present} accent="emerald" icon={<CheckCircle size={20} />} />
        <StatCard label="ABSENT" value={absent} accent="red" icon={<XCircle size={20} />} />
        <StatCard label="LATE" value={late} accent="amber" icon={<Clock size={20} />} />
        <StatCard label="ATTENDANCE" value={pct === null ? "—" : `${pct}%`} accent="slate" icon={<CalendarCheck size={20} />} />
      </div>

      {/* Month strip */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History size={14} className="text-blue-400" />
            Month: {monthTxt}
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">click a day to open its register</span>
        </div>
        {overview && overview.days.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...overview.days].reverse().slice(0, 20).map((d) => (
              <button
                key={d.date}
                onClick={() => selectDate(d.date)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                  d.date === date
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                    : "bg-slate-900/40 text-slate-400 border-slate-700 hover:border-blue-500/40 hover:text-blue-300"
                }`}
              >
                {d.date.slice(8)}/{d.date.slice(5, 7)} · {d.present}/{d.total}
                {d.percentage !== null ? ` (${d.percentage}%)` : ""}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No registers saved for this batch in {month} yet — pick a date above and mark the first day.
          </p>
        )}
      </div>

      {saveMsg && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          {saveMsg}
        </div>
      )}
      {saveErr && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{saveErr}</div>
      )}

      {/* Register */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <CheckSquare size={18} className="text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Register · {date || "—"}
                {register?.saved ? (
                  <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    Saved
                  </span>
                ) : (
                  <span className="ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">Draft</span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {batch} · {total} students · unmarked rows save as Absent
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              Session
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Regular Session"
                className="w-44 px-3 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => markAll("present")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll("absent")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        {register === null ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="animate-spin mr-3" size={18} /> Loading register…
          </div>
        ) : register.rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<UserPlus size={20} />}
              title="No students in this batch"
              message="Assign students to this batch first, then this register will list them for marking."
              action={
                <Link href="/admin-dashboard/lms/students/batches">
                  <Button size="sm">Go to Batches</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Check-in</th>
                  <th className="p-4">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRows.map((r) => (
                  <RegisterRow
                    key={r.studentId}
                    row={r}
                    onToggle={toggleStatus}
                    onCheckIn={(v) => updateRow(r.studentId, { checkIn: v })}
                    onRemark={(v) => updateRow(r.studentId, { remark: v })}
                  />
                ))}
              </tbody>
            </table>
            {filteredRows.length === 0 && <p className="p-6 text-sm text-slate-500">No students match “{search}”.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function RegisterRow({
  row,
  onToggle,
  onCheckIn,
  onRemark,
}: {
  row: AttendanceRegisterRow;
  onToggle: (studentId: string, status: AttendanceStatus) => void;
  onCheckIn: (value: string) => void;
  onRemark: (value: string) => void;
}) {
  return (
    <tr className="hover:bg-slate-800/40">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-300 ring-1 ring-slate-700">
            {initials(row.name)}
          </div>
          <div>
            <p className="font-bold text-slate-100">{row.name}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              {row.admissionNo} · {row.rollNo}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex gap-1.5">
          {statusOrder.map((s) => (
            <button
              key={s}
              onClick={() => onToggle(row.studentId, s)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                row.status === s ? statusMeta[s].on : statusMeta[s].off
              }`}
            >
              {statusMeta[s].label}
            </button>
          ))}
        </div>
      </td>
      <td className="p-4">
        <input
          type="text"
          value={row.checkIn}
          placeholder={row.status === "late" ? "e.g. 09:05 AM" : row.status === "present" ? "e.g. 08:45 AM" : "—"}
          onChange={(e) => onCheckIn(e.target.value)}
          className="w-32 px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
        />
      </td>
      <td className="p-4">
        <input
          type="text"
          value={row.remark}
          onChange={(e) => onRemark(e.target.value)}
          placeholder="Optional note…"
          className="w-full min-w-[160px] px-2.5 py-1.5 bg-slate-950/60 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
        />
      </td>
    </tr>
  );
}
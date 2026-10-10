"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Monitor,
  RefreshCw,
  Download,
  LayoutGrid,
  List,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Users,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  getLoginOverview,
  toggleBlockUser,
  forceLogoutUser,
  forceLogoutSession,
} from "@/lib/actions/logins";
import type { LoginOverview, LoginStudentDTO, LoginSessionDTO } from "@/lib/actions/logins";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

type StatusFilter = "All" | "Active" | "Offline" | "Blocked";
type Confirm =
  | { kind: "block"; student: LoginStudentDTO }
  | { kind: "logout"; student: LoginStudentDTO };

const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-400",
  "bg-emerald-500/10 text-emerald-400",
  "bg-purple-500/10 text-purple-400",
  "bg-orange-500/10 text-orange-400",
  "bg-pink-500/10 text-pink-400",
  "bg-indigo-500/10 text-indigo-400",
  "bg-teal-500/10 text-teal-400",
  "bg-rose-500/10 text-rose-400",
];

const iconBtn =
  "flex-1 py-3 flex items-center justify-center gap-2 text-xs font-medium transition-colors";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function deviceLabel(d: { browser: string; os: string; deviceType: string } | null): string {
  if (!d) return "N/A";
  return `${d.browser} on ${d.os}`;
}

export default function StudentLoginsPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<LoginOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [devicesFor, setDevicesFor] = useState<LoginStudentDTO | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const load = async (): Promise<LoginOverview | null> => {
    try {
      const ov = await getLoginOverview();
      setOverview(ov);
      return ov;
    } catch {
      toast("Could not load login data.", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (overview?.students ?? []).filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesQ =
      !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q);
    return matchesQ && (statusFilter === "All" || s.status === statusFilter);
  });

  const reload = async () => {
    const ov = await load();
    if (ov && devicesFor) {
      const fresh = ov.students.find((s) => s.id === devicesFor.id);
      if (fresh) setDevicesFor(fresh);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await reload();
  };

  const onBlock = async () => {
    if (!confirm || confirm.kind !== "block") return;
    setBusy(true);
    const res = await toggleBlockUser(confirm.student.id);
    setBusy(false);
    if (res.ok) toast(res.message ?? "Done.", "success");
    else toast(res.message ?? "Something went wrong.", "error");
    setConfirm(null);
    await reload();
  };

  const onLogout = async () => {
    if (!confirm || confirm.kind !== "logout") return;
    setBusy(true);
    const res = await forceLogoutUser(confirm.student.id);
    setBusy(false);
    if (res.ok) toast(res.message ?? "Signed out.", "success");
    else toast(res.message ?? "Something went wrong.", "error");
    setConfirm(null);
    await reload();
  };

  const onLogoutSession = async (session: LoginSessionDTO) => {
    setBusy(true);
    const res = await forceLogoutSession(session.sessionId);
    setBusy(false);
    toast(res.ok ? "Device signed out." : (res.message ?? "Unable to sign out device."), res.ok ? "success" : "error");
    await reload();
  };

  const exportRows = () =>
    filtered.map((s) => ({
      Name: s.name,
      Email: s.email,
      "Student ID": s.admissionNo,
      Status: s.status,
      Course: s.course,
      Batch: s.batch,
      Device: deviceLabel(s.device),
      "Active Sessions": s.activeSessions,
      "Last Login": fmtDate(s.lastLoginAt),
    }));

  const exportFile = (format: "xlsx" | "csv") => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Logins");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Student_Logins_${stamp}.${format}`);
    toast("Login list exported.", "success");
  };

  const statusPill = (status: LoginStudentDTO["status"]) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
        </span>
      );
    }
    if (status === "Blocked") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <Ban size={10} /> Blocked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Offline
      </span>
    );
  };

  const blockAction = (s: LoginStudentDTO) => ({
    label: s.status === "Blocked" ? "Unblock" : "Block",
    okText: s.status === "Blocked" ? "Unblock student" : "Block student",
    message:
      s.status === "Blocked"
        ? `${s.name} will regain login access.`
        : `${s.name} will be blocked from logging in and all active sessions will end.`,
  });

  const renderActions = (s: LoginStudentDTO) => (
    <div className="flex border-t border-white/10 bg-white/[0.01]">
      <button
        onClick={() => setDevicesFor(s)}
        className={`${iconBtn} text-blue-400 hover:bg-blue-500/10 border-r border-white/5`}
        title="View devices"
      >
        <Monitor size={14} /> Devices
      </button>
      <button
        onClick={() => setConfirm({ kind: "block", student: s })}
        className={`${iconBtn} ${
          s.status === "Blocked" ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10"
        } border-r border-white/5`}
      >
        <ShieldAlert size={14} /> {s.status === "Blocked" ? "Unblock" : "Block"}
      </button>
      <button
        onClick={() => setConfirm({ kind: "logout", student: s })}
        disabled={s.activeSessions === 0}
        className={`${iconBtn} ${
          s.activeSessions > 0 ? "text-orange-400 hover:bg-orange-500/10" : "text-slate-600 cursor-not-allowed"
        }`}
        title={s.activeSessions === 0 ? "No active sessions" : "Sign out all devices"}
      >
        <LogOut size={14} /> Logout
      </button>
    </div>
  );

  const metrics = overview?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Monitor className="text-blue-400" /> Student Logins
          </h1>
          <p className="text-sm text-slate-400 mt-1">Monitor student sessions, devices, and login activity.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs text-slate-500 hidden md:block">
            {overview ? `Updated ${fmtDate(overview.generatedAt)}` : "Loading…"}
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-600/20 disabled:opacity-60"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => exportFile("xlsx")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20"
            disabled={filtered.length === 0}
          >
            <Download size={16} /> Export
          </button>
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-400/80 mb-1 uppercase tracking-wider">Active Sessions</p>
            <p className="text-2xl font-bold text-emerald-400">{metrics?.active ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 size={20} className="text-emerald-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-orange-500/20 bg-orange-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-orange-400/80 mb-1 uppercase tracking-wider">Multi-device</p>
            <p className="text-2xl font-bold text-orange-400">{metrics?.multiDevice ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <AlertTriangle size={20} className="text-orange-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-red-500/20 bg-red-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-400/80 mb-1 uppercase tracking-wider">Blocked</p>
            <p className="text-2xl font-bold text-red-400">{metrics?.blocked ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Ban size={20} className="text-red-400" />
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-400/80 mb-1 uppercase tracking-wider">Total Students</p>
            <p className="text-2xl font-bold text-blue-400">{metrics?.total ?? 0}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users size={20} className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student name, email, or student ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-panel border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors bg-white/[0.02]"
          />
        </div>
        <select
          className="glass-panel border border-white/10 text-sm text-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 bg-white/[0.02] w-full sm:w-64"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Offline</option>
          <option>Blocked</option>
        </select>
      </div>

      {/* Content */}
      {loading && !overview ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Monitor size={22} />}
          title="No students match"
          message="Try a different search term or status filter."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className="glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col group hover:border-white/20 transition-all duration-300"
            >
              <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      AVATAR_COLORS[index % AVATAR_COLORS.length]
                    } border border-white/5`}
                  >
                    {initialsOf(session.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{session.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{session.email}</p>
                  </div>
                </div>
                {statusPill(session.status)}
              </div>

              <div className="p-5 flex-1 bg-black/20">
                <div className="grid grid-cols-[80px_1fr] gap-y-3 gap-x-2 text-sm">
                  <div className="text-slate-500 flex items-center gap-2 text-xs">
                    <GraduationCapIcon size={14} className="opacity-70" /> Course
                  </div>
                  <div className="text-slate-200 font-medium text-right truncate">{session.course}</div>

                  <div className="text-slate-500 flex items-center gap-2 text-xs">
                    <Smartphone size={14} className="opacity-70" /> Device
                  </div>
                  <div className="text-slate-200 text-right truncate">{deviceLabel(session.device)}</div>

                  <div className="text-slate-500 flex items-center gap-2 text-xs">
                    <Globe size={14} className="opacity-70" /> Browser
                  </div>
                  <div className="text-slate-200 text-right truncate">{session.device?.browser ?? "N/A"}</div>

                  <div className="text-slate-500 flex items-center gap-2 text-xs">
                    <Clock size={14} className="opacity-70" /> Login
                  </div>
                  <div className="text-slate-200 text-right text-xs truncate">{fmtDate(session.lastLoginAt)}</div>
                </div>
              </div>

              {renderActions(session)}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-panel border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Browser</th>
                  <th className="px-4 py-3 font-medium">Last Login</th>
                  <th className="px-4 py-3 font-medium">Sessions</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            AVATAR_COLORS[s.name.length % AVATAR_COLORS.length]
                          } border border-white/5`}
                        >
                          {initialsOf(s.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate">{s.name}</p>
                          <p className="text-xs text-slate-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusPill(s.status)}</td>
                    <td className="px-4 py-3 text-slate-300">{s.course}</td>
                    <td className="px-4 py-3 text-slate-300">{deviceLabel(s.device)}</td>
                    <td className="px-4 py-3 text-slate-300">{s.device?.browser ?? "N/A"}</td>
                    <td className="px-4 py-3 text-slate-300">{fmtDate(s.lastLoginAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          s.activeSessions > 0
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        }`}
                      >
                        <Smartphone size={10} /> {s.activeSessions}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDevicesFor(s)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5"
                          title="View devices"
                        >
                          <Monitor size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm({ kind: "block", student: s })}
                          className={`p-1.5 rounded-md transition-colors border border-white/5 ${
                            s.status === "Blocked"
                              ? "text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700"
                              : "text-red-400 hover:text-red-300 bg-slate-800 hover:bg-slate-700"
                          }`}
                          title={s.status === "Blocked" ? "Unblock" : "Block"}
                        >
                          <ShieldAlert size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm({ kind: "logout", student: s })}
                          disabled={s.activeSessions === 0}
                          className="p-1.5 text-orange-400 hover:text-orange-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={s.activeSessions === 0 ? "No active sessions" : "Sign out all devices"}
                        >
                          <LogOut size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Devices modal */}
      <Modal
        open={devicesFor !== null}
        onClose={() => setDevicesFor(null)}
        title={`Devices — ${devicesFor?.name ?? ""}`}
        description={devicesFor ? `${devicesFor.email} · ${devicesFor.activeSessions} active session(s)` : undefined}
        size="lg"
        footer={
          devicesFor && (
            <button
              onClick={() => setDevicesFor(null)}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          )
        }
      >
        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {!devicesFor || devicesFor.sessions.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">No sign-in history for this student.</p>
          ) : (
            devicesFor.sessions.map((session) => (
              <div key={session.sessionId} className="flex items-center justify-between gap-4 py-3 px-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {session.browser} on {session.os} <span className="text-slate-500">({session.deviceType})</span>
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      IP {session.ip} · Started {fmtDate(session.startedAt)} · Expires {fmtDate(session.expiresAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {session.active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      Ended
                    </span>
                  )}
                  <button
                    onClick={() => onLogoutSession(session)}
                    disabled={!session.active || busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-400 hover:bg-orange-500/10 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Block / Unblock confirm */}
      <Modal
        open={confirm?.kind === "block"}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "block" ? (blockAction(confirm.student).label === "Unblock" ? "Unblock student" : "Block student") : ""}
        description={confirm?.kind === "block" ? blockAction(confirm.student).message : undefined}
        size="sm"
        footer={
          confirm?.kind === "block" ? (
            <>
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onBlock}
                disabled={busy}
                className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${
                  confirm.student.status === "Blocked"
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {busy ? "Saving…" : blockAction(confirm.student).okText}
              </button>
            </>
          ) : undefined
        }
      >
        <p className="text-sm text-slate-400">
          {confirm?.kind === "block" && (
            <>
              <span className="text-white font-medium">{confirm.student.name}</span> will be{" "}
              {confirm.student.status === "Blocked" ? "unblocked" : "blocked"}.{" "}
              {confirm.student.status !== "Blocked" &&
                "Any live sessions are signed out and future logins are denied until unblocked."}
            </>
          )}
        </p>
      </Modal>

      {/* Logout all confirm */}
      <Modal
        open={confirm?.kind === "logout"}
        onClose={() => setConfirm(null)}
        title="Sign out all devices?"
        description={confirm?.kind === "logout" ? `End ${confirm.student.activeSessions} active session(s) for ${confirm.student.name}.` : undefined}
        size="sm"
        footer={
          confirm?.kind === "logout" ? (
            <>
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                disabled={busy}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {busy ? "Signing out…" : "Sign out all"}
              </button>
            </>
          ) : undefined
        }
      >
        <p className="text-sm text-slate-400">
          They will be returned to the login page on their next action.
        </p>
      </Modal>
    </div>
  );
}

// Hand-rolled GraduationCap (small, used in the card body).
function GraduationCapIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
"use client";

/**
 * Security settings (admin): change password, own active sign-ins (sign out
 * the others), the login protection actually enforced by the app and the
 * "Download all institute data" export (app/api/admin/export).
 */
import React, { useCallback, useEffect, useState } from "react";
import { PageHeader, Button, useToast } from "@/components/ui";
import { Shield, KeyRound, Monitor, LogOut, Download } from "lucide-react";
import { changeOwnPassword } from "@/lib/actions/account";
import { getMySecurity, signOutMyOtherSessions } from "@/lib/actions/settings";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Awaited<ReturnType<typeof getMySecurity>> | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    getMySecurity().then((d) => !ignore && setData(d)).catch(() => toast("Could not load security settings.", "error"));
    return () => {
      ignore = true;
    };
  }, [reloadKey, toast]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const changePassword = async () => {
    if (pw.next !== pw.confirm) return toast("New password and confirmation do not match.", "error");
    setBusy(true);
    const res = await changeOwnPassword({ currentPassword: pw.current, newPassword: pw.next });
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) setPw({ current: "", next: "", confirm: "" });
  };

  const signOutOthers = async () => {
    setBusy(true);
    const res = await signOutMyOtherSessions();
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    reload();
  };

  const others = data?.sessions.filter((s) => !s.current).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Security Settings" subtitle="Your password, your active sign-ins and the login protection in force." icon={<Shield size={20} className="text-emerald-400" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><KeyRound size={16} className="text-emerald-400" /> Change password</h2>
          <input type="password" className={inputCls} placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input type="password" className={inputCls} placeholder="New password (min 8 characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <input type="password" className={inputCls} placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button size="sm" onClick={changePassword} disabled={busy || !pw.current || !pw.next}>Update password</Button>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Shield size={16} className="text-emerald-400" /> Login protection</h2>
          {data && (
            <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
              <li>After {data.policy.maxAttempts} failed attempts in {data.policy.windowMinutes} minutes, sign-in is locked for {data.policy.lockMinutes} minutes.</li>
              <li>Sessions last {data.policy.sessionDays} days and are re-checked on every request — blocking an account or ending a session takes effect immediately.</li>
              <li>Passwords are stored only as bcrypt hashes; admin-issued passwords must be changed at first sign-in.</li>
              <li>Admin-only sections are enforced on the server, not just hidden.</li>
            </ul>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Monitor size={16} className="text-emerald-400" /> Your active sign-ins</h2>
          <Button size="sm" variant="secondary" onClick={signOutOthers} disabled={busy || others === 0}>
            <LogOut size={14} /> Sign out other devices{others ? ` (${others})` : ""}
          </Button>
        </div>
        {data?.sessions.map((s) => (
          <div key={s.sessionId} className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
            <span className="text-white font-medium">{s.browser} on {s.os}</span>
            <span className="text-xs text-slate-500">IP {s.ip}</span>
            <span className="text-xs text-slate-500">Signed in {fmt(s.startedAt)} · last seen {fmt(s.lastSeenAt)}</span>
            {s.current && <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300">This device</span>}
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2"><Download size={16} className="text-emerald-400" /> Your institute&apos;s data</h2>
        <p className="text-sm text-slate-300">
          Download everything the institute has stored — students, staff, fees, attendance, tests, courses and more — as one JSON file.
          Password hashes and sign-in sessions are left out. The download is recorded in the audit log.
        </p>
        <a
          href="/api/admin/export"
          download
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-[#5E9A2E] text-white hover:bg-[#4A7E24] shadow-sm shadow-black/20"
        >
          <Download size={14} /> Download all institute data
        </a>
      </div>
    </div>
  );
}

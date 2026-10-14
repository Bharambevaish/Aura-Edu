"use client";

/**
 * My account — for admins and staff: own profile, contact number, password
 * and the classes they teach (from the timetable).
 */
import React, { useEffect, useState } from "react";
import { PageHeader, Button, useToast } from "@/components/ui";
import { UserCircle, KeyRound, CalendarDays, Save } from "lucide-react";
import { getMyAccount, updateMyAccount, changeOwnPassword, type MyAccount } from "@/lib/actions/account";
import { getMyPayslip, type PayslipRow } from "@/lib/actions/payroll";
import { PayslipView } from "@/components/admin/hr/PayslipView";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function MyAccountPage() {
  const { toast } = useToast();
  const [account, setAccount] = useState<MyAccount | null>(null);
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [payslip, setPayslip] = useState<PayslipRow | null>(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    let ignore = false;
    getMyPayslip(month)
      .then((p) => !ignore && setPayslip(p))
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [month]);

  useEffect(() => {
    let ignore = false;
    getMyAccount()
      .then((a) => {
        if (ignore) return;
        setAccount(a);
        setPhone(a.phone);
      })
      .catch(() => toast("Could not load your account.", "error"));
    return () => {
      ignore = true;
    };
  }, [toast]);

  const savePhone = async () => {
    setSaving(true);
    const res = await updateMyAccount({ phone });
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
  };

  const savePassword = async () => {
    if (pw.next !== pw.confirm) {
      toast("New password and confirmation do not match.", "error");
      return;
    }
    setSaving(true);
    const res = await changeOwnPassword({ currentPassword: pw.current, newPassword: pw.next });
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) setPw({ current: "", next: "", confirm: "" });
  };

  if (!account) return <p className="text-sm text-slate-400">Loading your account…</p>;

  const facts: [string, string][] = [
    ["Email (login)", account.email],
    ["Role", account.role === "admin" ? "Administrator" : "Staff"],
    ["Employee ID", account.employeeId || "—"],
    ["Designation", account.designation || "—"],
    ["Department", account.department || "—"],
    ["Joined", fmt(account.joiningDate)],
    ["Last sign-in", fmt(account.lastLoginAt)],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="My Account" subtitle={account.name} icon={<UserCircle size={20} className="text-emerald-400" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Profile</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            {facts.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-200">{v}</dd>
              </React.Fragment>
            ))}
          </dl>
          <div className="flex gap-2 items-end pt-2">
            <label className="flex-1 text-xs text-slate-400 space-y-1">
              <span>Phone</span>
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <Button size="sm" onClick={savePhone} disabled={saving}>
              <Save size={14} /> Save
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">Other details are maintained by your administrator.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <KeyRound size={16} className="text-emerald-400" /> Change password
          </h2>
          <input type="password" className={inputCls} placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input type="password" className={inputCls} placeholder="New password (min 8 characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          <input type="password" className={inputCls} placeholder="Confirm new password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          <Button size="sm" onClick={savePassword} disabled={saving || !pw.current || !pw.next}>
            Update password
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <CalendarDays size={16} className="text-emerald-400" /> My weekly classes
        </h2>
        {account.classes.length === 0 ? (
          <p className="text-sm text-slate-500">You are not on the timetable yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {account.classes.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
                <span className="w-10 text-xs font-bold text-slate-400 uppercase">{DAYS[c.dayOfWeek]}</span>
                <span className="font-mono text-xs text-emerald-400">{c.startTime}–{c.endTime}</span>
                <span className="text-white">{c.subject}</span>
                <span className="text-xs text-slate-500 ml-auto">{c.batch}{c.room ? ` · ${c.room}` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {payslip && (
        <div className="glass-panel rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">My payslip</h2>
            <div className="flex gap-2">
              <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} className="px-2 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-xs text-white" />
              <Button size="sm" variant="secondary" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
          <PayslipView row={payslip} />
        </div>
      )}
    </div>
  );
}

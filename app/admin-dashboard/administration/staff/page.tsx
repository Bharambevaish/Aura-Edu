"use client";

/**
 * Staff Corner (admin-only) — staff accounts on live data: add, edit,
 * deactivate/reactivate, reset password (one-time password, forced change).
 * Teaching load comes from the timetable.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Users, RefreshCw, ShieldCheck, Clock, Plus, Search, KeyRound, Power, Pencil, Copy } from "lucide-react";
import {
  getStaffUsers,
  createStaff,
  updateStaff,
  setStaffActive,
  resetStaffPassword,
  type StaffUserDTO,
} from "@/lib/actions/staff";
import { PageHeader, Button, StatCard, Modal, useToast } from "@/components/ui";
import { useLookups, withValue } from "@/components/admin/useLookups";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Never";

type Form = {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  designation: string;
  department: string;
  joiningDate: string;
  monthlySalary: string;
};
const EMPTY: Form = { name: "", email: "", phone: "", employeeId: "", designation: "", department: "", joiningDate: "", monthlySalary: "0" };

export default function StaffCornerPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffUserDTO[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<StaffUserDTO | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const lookups = useLookups();

  useEffect(() => {
    let ignore = false;
    getStaffUsers()
      .then((rows) => {
        if (!ignore) setStaff(rows);
      })
      .catch(() => toast("Could not load staff.", "error"));
    return () => {
      ignore = true;
    };
  }, [reloadKey, toast]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (staff ?? []).filter((s) =>
      !q || [s.name, s.email, s.designation, s.department, s.employeeId, ...s.batches].some((v) => v.toLowerCase().includes(q)),
    );
  }, [staff, search]);

  const openNew = () => {
    setForm({ ...EMPTY, department: lookups.department[0] ?? "" });
    setEditing("new");
  };
  const openEdit = (s: StaffUserDTO) => {
    setForm({
      name: s.name,
      email: s.email,
      phone: s.phone,
      employeeId: s.employeeId,
      designation: s.designation,
      department: s.department,
      joiningDate: s.joiningDate ? s.joiningDate.slice(0, 10) : "",
      monthlySalary: String(s.monthlySalary),
    });
    setEditing(s);
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    const payload = { ...form, monthlySalary: Number(form.monthlySalary) || 0 };
    const res = editing === "new" ? await createStaff(payload) : await updateStaff(editing.id, payload);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (!res.ok) return;
    setEditing(null);
    if (res.credentials) setCreds(res.credentials);
    reload();
  };

  const toggleActive = async (s: StaffUserDTO) => {
    setBusy(true);
    const res = await setStaffActive(s.id, !s.active);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) reload();
  };

  const resetPassword = async (s: StaffUserDTO) => {
    setBusy(true);
    const res = await resetStaffPassword(s.id);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.credentials) setCreds(res.credentials);
  };

  const active = staff?.filter((s) => s.active).length ?? 0;
  const teaching = staff?.filter((s) => s.classesPerWeek > 0).length ?? 0;
  const payroll = staff?.filter((s) => s.active).reduce((n, s) => n + s.monthlySalary, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Corner" subtitle="Staff accounts, roles and teaching load." icon={<Users className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={reload}>
          <RefreshCw size={16} /> Refresh
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus size={16} /> Add staff
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total staff" value={staff?.length ?? "—"} icon={<ShieldCheck size={18} />} accent="emerald" />
        <StatCard label="Active" value={staff ? active : "—"} icon={<Power size={18} />} accent="blue" />
        <StatCard label="Teaching" value={staff ? teaching : "—"} icon={<Clock size={18} />} accent="purple" />
        <StatCard label="Monthly payroll" value={staff ? inr(payroll) : "—"} icon={<Users size={18} />} accent="amber" />
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, role, batch…" className={`${inputCls} pl-9`} />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Staff</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Teaches</th>
              <th className="py-3 px-4">Salary / month</th>
              <th className="py-3 px-4">Last sign-in</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!staff && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading staff…</td></tr>
            )}
            {staff && filtered.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-slate-500">No staff match.</td></tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-slate-800/50 hover:bg-white/5">
                <td className="py-3 px-4">
                  <p className="font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-slate-500">{s.employeeId || "—"} · {s.email}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-slate-200">{s.designation || "—"}</p>
                  <p className="text-[11px] text-slate-500">{s.department || "—"}</p>
                </td>
                <td className="py-3 px-4 text-xs text-slate-300">
                  {s.classesPerWeek ? (
                    <>
                      {s.batches.join(", ")}
                      <span className="block text-[11px] text-slate-500">{s.classesPerWeek} classes/week</span>
                    </>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-slate-200">{inr(s.monthlySalary)}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{fmt(s.lastLoginAt)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.active ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700/50 text-slate-400"}`}>
                    {s.active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(s)} title="Edit" className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={() => resetPassword(s)} disabled={busy} title="Reset password" className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-amber-300"><KeyRound size={14} /></button>
                    <button onClick={() => toggleActive(s)} disabled={busy} title={s.active ? "Deactivate" : "Reactivate"} className={`p-1.5 rounded-md bg-slate-800 ${s.active ? "text-slate-300 hover:text-rose-400" : "text-emerald-400"}`}><Power size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add staff member" : "Edit staff member"}
        description={editing === "new" ? "They get a one-time password and must set their own at first sign-in." : undefined}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} placeholder="Email (login) *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inputCls} placeholder="Employee ID (auto if blank)" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          <select className={inputCls} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}>
            <option value="">Designation…</option>
            {withValue(lookups.designation, form.designation).map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {withValue(lookups.department, form.department).map((d) => <option key={d}>{d}</option>)}
          </select>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Joining date</span>
            <input type="date" className={inputCls} value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          </label>
          <label className="text-xs text-slate-400 space-y-1">
            <span>Monthly salary (₹)</span>
            <input type="number" min={0} className={inputCls} value={form.monthlySalary} onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })} />
          </label>
        </div>
      </Modal>

      <Modal
        open={!!creds}
        onClose={() => setCreds(null)}
        title="One-time password"
        description="Shown once. They must set their own password at first sign-in."
        footer={<Button size="sm" onClick={() => setCreds(null)}>Done</Button>}
      >
        {creds && (
          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-900/50 border border-white/10">
            <span className="text-sm text-slate-300 font-mono truncate">{creds.email}</span>
            <code className="text-sm text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{creds.password}</code>
            <button onClick={() => navigator.clipboard?.writeText(`${creds.email} / ${creds.password}`).then(() => toast("Copied."))} className="text-slate-400 hover:text-white" title="Copy">
              <Copy size={14} />
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

/**
 * Permissions — view of the role model actually enforced by the server
 * (lib/permissions.ts). Roles are fixed per account (admin / staff /
 * student); there are no per-person toggles to drift out of sync. The one
 * institute-wide switch is "Staff can grade written answers" (admin-only,
 * like the rest of Settings).
 */
import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { Shield, Check, Minus, X, Loader2 } from "lucide-react";
import { PERMISSION_MATRIX, ADMIN_ONLY_ROUTES, type Access } from "@/lib/permissions";
import { getPermissionSettings, setStaffCanGrade } from "@/lib/actions/settings";

function Cell({ access }: { access: Access }) {
  if (access === "full") return <span className="inline-flex items-center gap-1 text-emerald-300"><Check size={14} /> Full</span>;
  if (access === "partial") return <span className="inline-flex items-center gap-1 text-amber-300"><Minus size={14} /> Partial</span>;
  return <span className="inline-flex items-center gap-1 text-slate-500"><X size={14} /> None</span>;
}

function StaffGradingSwitch({ value, saving, onChange }: { value: boolean | null; saving: boolean; onChange: (next: boolean) => void }) {
  const on = value === true;
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p id="staff-can-grade-label" className="font-semibold text-white text-sm">Staff can grade written answers</p>
        <p className="text-xs text-slate-400 mt-1">
          Admins can always grade written test answers. Turn this off to limit grading to administrators; staff can still read submitted answers.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {saving && <Loader2 size={16} className="animate-spin text-slate-400" />}
        <span className="text-xs font-mono text-slate-400 w-7">{value === null ? "" : on ? "On" : "Off"}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby="staff-can-grade-label"
          disabled={value === null || saving}
          onClick={() => onChange(!on)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors disabled:opacity-50 ${
            on ? "bg-[#5E9A2E] border-[#5E9A2E]" : "bg-slate-700 border-white/10"
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const [staffCanGrade, setStaffCanGradeState] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    getPermissionSettings().then((s) => {
      if (!ignore) setStaffCanGradeState(s.staffCanGrade);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const toggle = async (next: boolean) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await setStaffCanGrade(next);
      if (res.ok) setStaffCanGradeState(next);
      setMessage({ ok: res.ok, text: res.message });
    } finally {
      setSaving(false);
    }
  };

  // Staff lose part of "Tests" while grading is limited to admins.
  const matrix = PERMISSION_MATRIX.map((row) =>
    row.dependsOnStaffGrading && staffCanGrade === false ? { ...row, staff: "partial" as Access } : row,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" subtitle="What each role can do — enforced on the server for every page and action." icon={<Shield size={20} className="text-emerald-400" />} />

      <StaffGradingSwitch value={staffCanGrade} saving={saving} onChange={(next) => void toggle(next)} />
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-emerald-300" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="py-3 px-4">Area</th>
              <th className="py-3 px-4">Admin</th>
              <th className="py-3 px-4">Staff</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.area} className="border-b border-slate-800/50">
                <td className="py-3 px-4 text-white">{row.area}</td>
                <td className="py-3 px-4"><Cell access={row.admin} /></td>
                <td className="py-3 px-4"><Cell access={row.staff} /></td>
                <td className="py-3 px-4 text-xs text-slate-400">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="glass-panel rounded-2xl p-5 space-y-2 text-sm text-slate-300">
        <p className="font-semibold text-white">How it works</p>
        <p>Each account has one role. Students only ever see the student portal. Staff share the admin dashboard minus these admin-only sections, which are blocked on the server even if the URL is typed directly:</p>
        <ul className="list-disc pl-5 text-xs text-slate-400 font-mono">
          {ADMIN_ONLY_ROUTES.map((r) => <li key={r}>{r}</li>)}
        </ul>
        <p className="text-xs text-slate-500">To change someone&apos;s access, change their account (Staff Corner) — e.g. deactivate it.</p>
      </div>
    </div>
  );
}

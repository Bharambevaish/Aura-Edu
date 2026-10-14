"use client";

/**
 * Permissions — read-only view of the role model actually enforced by the
 * server (lib/permissions.ts). Roles are fixed per account (admin / staff /
 * student); there are no per-person toggles to drift out of sync.
 */
import React from "react";
import { PageHeader } from "@/components/ui";
import { Shield, Check, Minus, X } from "lucide-react";
import { PERMISSION_MATRIX, ADMIN_ONLY_ROUTES, type Access } from "@/lib/permissions";

function Cell({ access }: { access: Access }) {
  if (access === "full") return <span className="inline-flex items-center gap-1 text-emerald-300"><Check size={14} /> Full</span>;
  if (access === "partial") return <span className="inline-flex items-center gap-1 text-amber-300"><Minus size={14} /> Partial</span>;
  return <span className="inline-flex items-center gap-1 text-slate-500"><X size={14} /> None</span>;
}

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Roles & Permissions" subtitle="What each role can do — enforced on the server for every page and action." icon={<Shield size={20} className="text-emerald-400" />} />

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
            {PERMISSION_MATRIX.map((row) => (
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

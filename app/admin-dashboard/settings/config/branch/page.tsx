"use client";

/**
 * Settings → Branches — the institute's centres on live data. Active branches
 * feed the header's branch switcher and the student branch picker. Renaming a
 * branch updates every student, invoice, payment and lead that uses it; a
 * branch in use can only be deactivated.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button, Modal, useToast } from "@/components/ui";
import { Building2, Plus, Edit2, Trash2, Search, MapPin, Phone, Users } from "lucide-react";
import { getBranches, saveBranch, deleteBranch, type BranchRow } from "@/lib/actions/branches";
import { useBranch } from "@/components/admin/shell/BranchContext";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

type Form = { id: string | null; name: string; code: string; address: string; city: string; phone: string; active: boolean };

const EMPTY: Form = { id: null, name: "", code: "", address: "", city: "", phone: "", active: true };

export default function BranchConfigPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { current } = useBranch();
  const [rows, setRows] = useState<BranchRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    getBranches()
      .then((r) => !ignore && setRows(r))
      .catch(() => toast("Could not load branches.", "error"));
    return () => {
      ignore = true;
    };
  }, [reload, toast]);

  // Reload the list, and the layout so the header switcher sees the change.
  const refresh = useCallback(() => {
    setReload((n) => n + 1);
    router.refresh();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter(
      (r) => !q || r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.city.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const totals = useMemo(
    () => ({
      branches: rows?.length ?? 0,
      active: rows?.filter((r) => r.active).length ?? 0,
      students: rows?.reduce((s, r) => s + r.students, 0) ?? 0,
    }),
    [rows],
  );

  const save = async () => {
    if (!form) return;
    setBusy(true);
    const { id, ...input } = form;
    const res = await saveBranch(id, input);
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setForm(null);
      refresh();
    }
  };

  const remove = async (row: BranchRow) => {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const res = await deleteBranch(row.id);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Branches" subtitle="Your centres. Active branches appear in the header switcher and the student branch picker." icon={<Building2 size={20} className="text-emerald-400" />}>
        <Button size="sm" onClick={() => setForm({ ...EMPTY })}>
          <Plus size={14} /> Add branch
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Branches", value: totals.branches },
          { label: "Active", value: totals.active },
          { label: "Students assigned", value: totals.students },
        ].map((t) => (
          <div key={t.label} className="glass-panel rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{t.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{rows ? t.value : "—"}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input className={`${inputCls} pl-8`} placeholder="Search name, code or city…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <p className="text-xs text-slate-400">
            Header is showing: <span className="text-slate-200">{current ?? "All branches"}</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!rows && (
                <tr><td colSpan={5} className="py-6 px-4 text-slate-500">Loading…</td></tr>
              )}
              {rows && filtered.length === 0 && (
                <tr><td colSpan={5} className="py-6 px-4 text-slate-500">No branches.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="py-3 px-4">
                    <p className="text-white">{r.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{r.code}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300 space-y-0.5">
                    {(r.address || r.city) && (
                      <p className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 text-slate-500 shrink-0" />{[r.address, r.city].filter(Boolean).join(", ")}</p>
                    )}
                    {r.phone && <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500" />{r.phone}</p>}
                    {!r.address && !r.city && !r.phone && <span className="text-slate-500">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${r.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                      {r.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <span className="inline-flex items-center gap-1.5"><Users size={12} className="text-slate-500" />{r.students}</span>
                    <span className="text-[11px] text-slate-500"> · {r.activeStudents} active</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setForm({ id: r.id, name: r.name, code: r.code, address: r.address, city: r.city, phone: r.phone, active: r.active })}
                        className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => remove(r)}
                        disabled={r.students > 0}
                        className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400"
                        title={r.students > 0 ? "In use — deactivate instead" : "Delete"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-slate-500 border-t border-white/5">
          Inactive branches are hidden from the switcher and pickers but kept on existing records. Renaming updates every student, invoice, payment and lead in the branch.
        </p>
      </div>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit branch" : "Add branch"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setForm(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input className={`${inputCls} sm:col-span-2`} placeholder="Branch name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={`${inputCls} uppercase`} placeholder="Code * (BR-PUNE)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <textarea rows={2} className={inputCls} placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (shown in the switcher and pickers)
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

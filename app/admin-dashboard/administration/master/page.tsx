"use client";

/**
 * Master Data Center — the lookup lists behind the app's pickers (staff
 * department/designation, student ID proof, lead lost reasons), plus the live
 * reference data owned by other modules. Renaming an entry updates every
 * record using it; entries in use can only be deactivated.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Button, Modal, useToast } from "@/components/ui";
import { Database, Plus, Edit2, Trash2, Search, ExternalLink } from "lucide-react";
import { MASTER_META, MASTER_TYPES, type MasterType } from "@/lib/master";
import { getMasterItems, saveMasterItem, deleteMasterItem, getLiveLookups, type MasterRow, type LiveLookup } from "@/lib/actions/master";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

type Tab = MasterType | "live";
type Form = { id: string | null; name: string; description: string; active: boolean };

export default function MasterDataCenterPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("department");
  const [rows, setRows] = useState<MasterRow[] | null>(null);
  const [live, setLive] = useState<LiveLookup[] | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    const load = tab === "live" ? getLiveLookups().then((l) => !ignore && setLive(l)) : getMasterItems(tab).then((r) => !ignore && setRows(r));
    load.catch(() => toast("Could not load master data.", "error"));
    return () => {
      ignore = true;
    };
  }, [tab, reload, toast]);

  const switchTab = (t: Tab) => {
    setRows(null);
    setQuery("");
    setTab(t);
  };
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rows, query]);

  const save = async () => {
    if (!form || tab === "live") return;
    setBusy(true);
    const res = await saveMasterItem(form.id, { type: tab, name: form.name, description: form.description, active: form.active });
    setBusy(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setForm(null);
      refresh();
    }
  };

  const remove = async (row: MasterRow) => {
    if (!confirm(`Delete “${row.name}”?`)) return;
    const res = await deleteMasterItem(row.id);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) refresh();
  };

  const meta = tab === "live" ? null : MASTER_META[tab];

  return (
    <div className="space-y-6">
      <PageHeader title="Master Data Center" subtitle="The lookup lists behind every picker in the app, and the live reference data they connect to." icon={<Database size={20} className="text-emerald-400" />}>
        {meta && (
          <Button size="sm" onClick={() => setForm({ id: null, name: "", description: "", active: true })}>
            <Plus size={14} /> Add entry
          </Button>
        )}
      </PageHeader>

      <div className="glass-panel p-2 rounded-xl flex overflow-x-auto custom-scrollbar gap-2">
        {[...MASTER_TYPES, "live" as const].map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"}`}
          >
            {t === "live" ? "Live reference data" : MASTER_META[t].label}
          </button>
        ))}
      </div>

      {meta && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input className={`${inputCls} pl-8`} placeholder={`Search ${meta.label.toLowerCase()}…`} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <p className="text-xs text-slate-400">Used in: <span className="text-slate-200">{meta.usedIn}</span></p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">In use</th>
                  <th className="py-3 px-4">Added by</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!rows && (
                  <tr><td colSpan={5} className="py-6 px-4 text-slate-500">Loading…</td></tr>
                )}
                {rows && filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-6 px-4 text-slate-500">No entries.</td></tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <p className="text-white">{r.name}</p>
                      {r.description && <p className="text-[11px] text-slate-500">{r.description}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] border ${r.active ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{r.usage} record{r.usage === 1 ? "" : "s"}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {r.createdByName}
                      <br />
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setForm({ id: r.id, name: r.name, description: r.description, active: r.active })} className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-blue-400" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => remove(r)}
                          disabled={r.usage > 0}
                          className="p-2 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400"
                          title={r.usage > 0 ? "In use — deactivate instead" : "Delete"}
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
            Inactive entries are hidden from pickers but kept on existing records. Renaming updates every record that uses the entry.
          </p>
        </div>
      )}

      {tab === "live" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {!live && <p className="text-sm text-slate-400">Loading…</p>}
          {live?.map((l) => (
            <div key={l.label} className="glass-panel rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{l.label}</p>
                  <p className="text-[11px] text-slate-500">Managed in {l.managedAt}</p>
                </div>
                <Link href={l.href} className="text-emerald-400 hover:text-emerald-300" title={`Open ${l.managedAt}`}>
                  <ExternalLink size={14} />
                </Link>
              </div>
              <ul className="space-y-1 text-sm max-h-56 overflow-y-auto custom-scrollbar">
                {l.values.length === 0 && <li className="text-slate-500 text-xs">None yet.</li>}
                {l.values.map((v) => (
                  <li key={v.name} className="flex justify-between gap-2">
                    <span className="text-slate-200 truncate">{v.name}</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{v.count} {v.count === 1 ? l.unit.replace(/s$/, "") : l.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? `Edit ${meta?.label.replace(/s$/, "") ?? "entry"}` : `Add ${meta?.label.replace(/s$/, "") ?? "entry"}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setForm(null)}>Cancel</Button>
            <Button size="sm" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-3">
            <input className={inputCls} placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea rows={2} className={inputCls} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active (shown in pickers)
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

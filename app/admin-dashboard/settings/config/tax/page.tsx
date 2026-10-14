"use client";

/**
 * Tax Config — GST rules. The default rule is recorded on every new invoice
 * (fees are GST-inclusive) and shown on printed invoices.
 */
import React, { useEffect, useState } from "react";
import { PageHeader, Button, useToast } from "@/components/ui";
import { Percent, Plus, Trash2, Save } from "lucide-react";
import { getInstituteSettings, saveTaxRules } from "@/lib/actions/settings";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

type Rule = { id: string; name: string; rate: string; hsn: string; description: string };

export default function TaxConfigPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [defaultIndex, setDefaultIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getInstituteSettings()
      .then((s) => {
        if (ignore) return;
        setRules(s.taxRules.map((r) => ({ ...r, rate: String(r.rate) })));
        const idx = s.taxRules.findIndex((r) => r.id === s.defaultTaxRuleId);
        setDefaultIndex(idx >= 0 ? idx : null);
      })
      .catch(() => toast("Could not load tax rules.", "error"));
    return () => {
      ignore = true;
    };
  }, [toast]);

  const update = (i: number, patch: Partial<Rule>) => setRules((rs) => rs!.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const remove = (i: number) => {
    setRules((rs) => rs!.filter((_, j) => j !== i));
    setDefaultIndex((d) => (d === null ? null : d === i ? null : d > i ? d - 1 : d));
  };

  const save = async () => {
    if (!rules) return;
    setSaving(true);
    const res = await saveTaxRules({ rules: rules.map((r) => ({ ...r, rate: Number(r.rate) || 0 })), defaultIndex });
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
  };

  if (!rules) return <p className="text-sm text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Tax Configuration" subtitle="GST rules. The default rule is recorded on new invoices; fees are treated as GST-inclusive." icon={<Percent size={20} className="text-emerald-400" />}>
        <Button variant="secondary" size="sm" onClick={() => setRules([...rules, { id: "", name: "", rate: "18", hsn: "", description: "" }])}><Plus size={14} /> Add rule</Button>
        <Button size="sm" onClick={save} disabled={saving}><Save size={14} /> {saving ? "Saving…" : "Save"}</Button>
      </PageHeader>

      <div className="glass-panel rounded-2xl p-6 space-y-3">
        {rules.length === 0 && <p className="text-sm text-slate-500">No tax rules — invoices are issued without GST.</p>}
        {rules.map((r, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <input className={`${inputCls} md:col-span-3`} placeholder="Rule name, e.g. GST on coaching" value={r.name} onChange={(e) => update(i, { name: e.target.value })} />
            <input className={`${inputCls} md:col-span-1`} type="number" min={0} max={100} placeholder="%" value={r.rate} onChange={(e) => update(i, { rate: e.target.value })} />
            <input className={`${inputCls} md:col-span-2`} placeholder="SAC / HSN" value={r.hsn} onChange={(e) => update(i, { hsn: e.target.value })} />
            <input className={`${inputCls} md:col-span-4`} placeholder="Description" value={r.description} onChange={(e) => update(i, { description: e.target.value })} />
            <label className="md:col-span-1 flex items-center gap-1 text-xs text-slate-300">
              <input type="radio" name="default-rule" checked={defaultIndex === i} onChange={() => setDefaultIndex(i)} /> Default
            </label>
            <button onClick={() => remove(i)} className="md:col-span-1 p-2 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400 justify-self-start" title="Remove"><Trash2 size={14} /></button>
          </div>
        ))}
        <p className="text-[11px] text-slate-500">Changing the default affects invoices raised from now on; printed older invoices use the current default if they were raised without GST.</p>
      </div>
    </div>
  );
}

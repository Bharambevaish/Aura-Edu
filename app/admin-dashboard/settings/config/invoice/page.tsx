"use client";

/** Invoice Config — the institute profile printed on every invoice. */
import React, { useEffect, useState } from "react";
import { PageHeader, Button, useToast } from "@/components/ui";
import { Receipt, Save } from "lucide-react";
import { getInstituteSettings, saveInstituteProfile } from "@/lib/actions/settings";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500";

type Form = { name: string; legalName: string; address: string; gstin: string; pan: string; supportEmail: string; supportPhone: string; invoiceTerms: string };

export default function InvoiceConfigPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    getInstituteSettings()
      .then((s) => {
        if (ignore) return;
        setForm({ name: s.name, legalName: s.legalName, address: s.address, gstin: s.gstin, pan: s.pan, supportEmail: s.supportEmail, supportPhone: s.supportPhone, invoiceTerms: s.invoiceTerms });
      })
      .catch(() => toast("Could not load settings.", "error"));
    return () => {
      ignore = true;
    };
  }, [toast]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const res = await saveInstituteProfile(form);
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
  };

  if (!form) return <p className="text-sm text-slate-400">Loading…</p>;
  const field = (key: keyof Form, label: string, placeholder = "") => (
    <label className="text-xs text-slate-400 space-y-1">
      <span>{label}</span>
      <input className={inputCls} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </label>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Invoice Configuration" subtitle="Institute details printed on every invoice (Finance → Invoices → View)." icon={<Receipt size={20} className="text-emerald-400" />}>
        <Button size="sm" onClick={save} disabled={saving}><Save size={14} /> {saving ? "Saving…" : "Save"}</Button>
      </PageHeader>

      <div className="glass-panel rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("name", "Institute name *", "AuraEdu Institute")}
        {field("legalName", "Registered company name", "AuraEdu Learning Pvt. Ltd.")}
        <label className="text-xs text-slate-400 space-y-1 md:col-span-2">
          <span>Registered address</span>
          <textarea rows={2} className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        {field("gstin", "GSTIN", "27ABCDE1234F1Z5")}
        {field("pan", "PAN", "ABCDE1234F")}
        {field("supportEmail", "Support email")}
        {field("supportPhone", "Support phone")}
        <label className="text-xs text-slate-400 space-y-1 md:col-span-2">
          <span>Invoice notes / terms</span>
          <textarea rows={4} className={inputCls} value={form.invoiceTerms} onChange={(e) => setForm({ ...form, invoiceTerms: e.target.value })} />
        </label>
      </div>
    </div>
  );
}

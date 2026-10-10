"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getVendors,
  createVendor,
  updateVendor,
  toggleVendor,
  deleteVendor,
  type VendorRow,
} from "@/lib/actions/finance";
import { Building2, Plus, RefreshCw, Loader2, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

type VendorForm = { name: string; contactPerson: string; email: string; phone: string; gstin: string; pan: string; address: string; bankName: string; accountNumber: string; ifsc: string; branchName: string };
const emptyForm: VendorForm = { name: "", contactPerson: "", email: "", phone: "", gstin: "", pan: "", address: "", bankName: "", accountNumber: "", ifsc: "", branchName: "" };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VendorRow | null>(null);
  const [form, setForm] = useState<VendorForm>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VendorRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const set = (k: keyof VendorForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const fetchData = useCallback(async () => {
    try { setVendors(await getVendors()); } catch { toast("Failed to load vendors", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getVendors()
      .then((d) => { if (!ignore) setVendors(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (v: VendorRow) => { setEditing(v); setForm({ name: v.name, contactPerson: v.contactPerson, email: v.email, phone: v.phone, gstin: v.gstin, pan: v.pan, address: v.address, bankName: v.bankName, accountNumber: v.accountNumber, ifsc: v.ifsc, branchName: v.branchName }); setModalOpen(true); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast("Vendor name required", "error"); return; }
    setFormLoading(true);
    try {
      const res = editing ? await updateVendor(editing.id, form) : await createVendor(form);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) { await fetchData(); setModalOpen(false); }
    } catch { toast("Error", "error"); }
    setFormLoading(false);
  };

  const runToggle = async (v: VendorRow) => {
    try { const res = await toggleVendor(v.id); toast(res.message, res.ok ? "success" : "error"); if (res.ok) await fetchData(); } catch { toast("Error", "error"); }
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { const res = await deleteVendor(deleteTarget.id); toast(res.message, res.ok ? "success" : "error"); if (res.ok) await fetchData(); } catch { toast("Error", "error"); }
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const columns: DataTableColumn<VendorRow>[] = [
    { key: "name", header: "VENDOR", cell: (r) => <span className="text-xs font-bold text-white">{r.name}</span> },
    { key: "contact", header: "CONTACT", cell: (r) => <span className="text-xs text-slate-300">{r.contactPerson || "-"}</span> },
    { key: "phone", header: "PHONE", cell: (r) => <span className="text-xs text-slate-400">{r.phone || "-"}</span> },
    { key: "email", header: "EMAIL", cell: (r) => <span className="text-xs text-slate-400">{r.email || "-"}</span> },
    { key: "gstin", header: "GSTIN", cell: (r) => <span className="text-xs text-slate-400 font-mono">{r.gstin || "-"}</span> },
    { key: "active", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${r.isActive ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>{r.isActive ? "Active" : "Inactive"}</span> },
    {
      key: "actions", header: "", className: "w-[120px]",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(r)} className="text-slate-500 hover:text-amber-400 transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => runToggle(r)} className="text-slate-500 hover:text-blue-400 transition-colors" title={r.isActive ? "Deactivate" : "Activate"}>{r.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}</button>
          <button onClick={() => setDeleteTarget(r)} className="text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Vendors" subtitle="Manage your registered vendors and payment details." icon={<Building2 size={20} className="text-blue-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <span className="text-xs text-slate-500 font-medium">{vendors.length} vendors</span>
        <Button size="sm" onClick={openCreate}><Plus size={14} />New Vendor</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Vendors" value={vendors.length} icon={<Building2 size={16} />} accent="blue" />
          <StatCard label="Active" value={vendors.filter((v) => v.isActive).length} icon={<CheckCircle2 size={16} />} accent="emerald" />
          <StatCard label="Inactive" value={vendors.filter((v) => !v.isActive).length} icon={<XCircle size={16} />} accent="slate" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={vendors} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No vendors registered yet.</div>} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Vendor" : "New Vendor"} description={editing?.name} size="lg" footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={formLoading} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Vendor"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className={labelCls}>Vendor Name *</label><input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Contact Person</label><input type="text" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Phone</label><input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input type="text" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>GSTIN</label><input type="text" value={form.gstin} onChange={(e) => set("gstin", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>PAN</label><input type="text" value={form.pan} onChange={(e) => set("pan", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Address</label><input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Bank Name</label><input type="text" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Account Number</label><input type="text" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>IFSC</label><input type="text" value={form.ifsc} onChange={(e) => set("ifsc", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Branch</label><input type="text" value={form.branchName} onChange={(e) => set("branchName", e.target.value)} className={inputCls} /></div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Vendor" footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" loading={deleteLoading} onClick={runDelete}>Delete</Button></>}>
        {deleteTarget && <p className="text-sm text-slate-300">Delete <span className="text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>}
      </Modal>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  type CategoryRow,
} from "@/lib/actions/finance";
import { Tags, Plus, RefreshCw, Loader2, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function ExpenseCategoriesPage() {
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try { setCats(await getExpenseCategories()); } catch { toast("Failed to load categories", "error"); }
  }, [toast]);

  useEffect(() => {
    let ignore = false;
    getExpenseCategories()
      .then((d) => { if (!ignore) setCats(d); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const openCreate = () => { setEditing(null); setName(""); setDescription(""); setActive(true); setModalOpen(true); };
  const openEdit = (c: CategoryRow) => { setEditing(c); setName(c.name); setDescription(c.description); setActive(c.isActive); setModalOpen(true); };

  const handleSubmit = async () => {
    if (!name.trim()) { toast("Category name required", "error"); return; }
    setFormLoading(true);
    try {
      const payload = { name: name.trim(), description, isActive: active };
      const res = editing ? await updateExpenseCategory(editing.id, payload) : await createExpenseCategory(payload);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) { await fetchData(); setModalOpen(false); }
    } catch { toast("Error", "error"); }
    setFormLoading(false);
  };

  const runDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { const res = await deleteExpenseCategory(deleteTarget.id); toast(res.message, res.ok ? "success" : "error"); if (res.ok) await fetchData(); } catch { toast("Error", "error"); }
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const columns: DataTableColumn<CategoryRow>[] = [
    { key: "name", header: "CATEGORY", cell: (r) => <span className="text-xs font-bold text-white">{r.name}</span> },
    { key: "description", header: "DESCRIPTION", cell: (r) => <span className="text-xs text-slate-400">{r.description || "-"}</span> },
    { key: "active", header: "STATUS", cell: (r) => <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${r.isActive ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" : "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>{r.isActive ? "Active" : "Inactive"}</span> },
    {
      key: "actions", header: "", className: "w-[90px]",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(r)} className="text-slate-500 hover:text-amber-400 transition-colors" title="Edit"><Pencil size={14} /></button>
          <button onClick={() => setDeleteTarget(r)} className="text-slate-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Expense Categories" subtitle="Organize expenses into reusable category tags." icon={<Tags size={20} className="text-purple-400" />}>
        <Button variant="secondary" size="sm" onClick={() => fetchData().catch(() => {})}><RefreshCw size={14} /></Button>
        <span className="text-xs text-slate-500 font-medium">{cats.length} categories</span>
        <Button size="sm" onClick={openCreate}><Plus size={14} />New Category</Button>
      </PageHeader>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Total Categories" value={cats.length} icon={<Tags size={16} />} accent="purple" />
          <StatCard label="Active" value={cats.filter((c) => c.isActive).length} icon={<Tags size={16} />} accent="emerald" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : (
        <DataTable columns={columns} rows={cats} keyField={(r) => r.id} emptySlot={<div className="text-center py-12 text-slate-500">No categories yet.</div>} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "New Category"} footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button loading={formLoading} onClick={handleSubmit}>{editing ? "Save Changes" : "Add Category"}</Button></>}>
        <div className="space-y-4">
          <div><label className={labelCls}>Category Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Description</label><textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputCls} resize-y`} /></div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[#5E9A2E]" />Active</label>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category" footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" loading={deleteLoading} onClick={runDelete}>Delete</Button></>}>
        {deleteTarget && <p className="text-sm text-slate-300">Delete <span className="text-white font-medium">{deleteTarget.name}</span>? This cannot be undone.</p>}
      </Modal>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getExpenseCategories, getVendors, createExpense } from "@/lib/actions/finance";
import { PAYMENT_MODES, PAYMENT_SOURCES } from "@/lib/finance";
import { Combobox, type ComboboxOption } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft } from "lucide-react";

const inputCls =
  "mt-1 w-full px-3 py-2 border border-white/10 rounded-lg text-sm bg-slate-900/50 focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-500";
const labelCls = "text-xs font-medium text-slate-300";

export default function CreateExpensePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<ComboboxOption[]>([]);
  const [vendors, setVendors] = useState<ComboboxOption[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [categoryRef, setCategoryRef] = useState("");
  const [vendorRef, setVendorRef] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_MODES[0]);
  const [paymentSource, setPaymentSource] = useState<string>(PAYMENT_SOURCES[0]);
  const [refNo, setRefNo] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([getExpenseCategories(), getVendors()]).then(([cats, vs]) => {
      if (ignore) return;
      setCategories(cats.filter((c) => c.isActive).map((c) => ({ value: c.id, label: c.name })));
      setVendors(vs.filter((v) => v.isActive).map((v) => ({ value: v.id, label: v.name, hint: v.email })));
    });
    return () => { ignore = true; };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !amount || !categoryRef || !expenseDate) {
      toast("Title, amount, category and date are required.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await createExpense({
        title: title.trim(),
        description,
        amount: Number(amount),
        expenseDate,
        categoryRef,
        vendorRef: vendorRef || "",
        paymentMethod,
        paymentSource,
        refNo,
        internalNotes,
      });
      if (res.ok) {
        toast("Expense submitted");
        router.push("/admin-dashboard/finance/expenses");
      } else {
        toast(res.message, "error");
      }
    } catch {
      toast("Something went wrong", "error");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin-dashboard/finance/expenses" className="p-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-white">Create Expense</h1>
          <p className="text-sm text-slate-400 mt-0.5">Submit an expense for approval.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 max-w-3xl space-y-5">
        <div>
          <label className={labelCls}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Expense title" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Amount (₹) *</label>
            <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Expense Date *</label>
            <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
            <Combobox value={categoryRef} onChange={setCategoryRef} options={categories} placeholder="Select category" emptyMessage="No categories found" />
          </div>
          <div>
            <label className={labelCls}>Vendor (optional)</label>
            <Combobox value={vendorRef} onChange={setVendorRef} options={[{ value: "", label: "— None —" }, ...vendors]} placeholder="Select vendor" emptyMessage="No vendors found" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment Source</label>
            <select value={paymentSource} onChange={(e) => setPaymentSource(e.target.value)} className={inputCls}>
              {PAYMENT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Reference Number (optional)</label>
          <input type="text" value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="Cheque no., UPI ref, receipt no." className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" className={`${inputCls} resize-y`} />
        </div>

        <div>
          <label className={labelCls}>Internal Notes (optional)</label>
          <textarea rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Any additional internal context" className={`${inputCls} resize-y`} />
        </div>
      </div>

      <div className="flex justify-end gap-3 max-w-3xl">
        <Link href="/admin-dashboard/finance/expenses"><Button variant="secondary">Cancel</Button></Link>
        <Button loading={loading} onClick={handleSubmit}>Submit Expense</Button>
      </div>
    </div>
  );
}
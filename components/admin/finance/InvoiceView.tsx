"use client";

/** Printable tax invoice built from the institute profile (Settings → Invoice Config). */
import React from "react";
import type { InvoicePrint } from "@/lib/actions/settings";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function InvoiceView({ data }: { data: InvoicePrint }) {
  const { institute: org, invoice: inv, student, gst, payments } = data;
  return (
    <div id="invoice-print" className="space-y-5 text-sm">
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            body * { visibility: hidden !important; }
            #invoice-print, #invoice-print * { visibility: visible !important; color: #0f172a !important; border-color: #cbd5e1 !important; }
            #invoice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; background: white; }
          }`,
        }}
      />
      <div className="flex justify-between gap-6 border-b border-white/10 pb-4">
        <div>
          <p className="text-lg font-bold text-white">{org.name}</p>
          {org.legalName && <p className="text-xs text-slate-400">{org.legalName}</p>}
          {org.address && <p className="text-xs text-slate-400 whitespace-pre-line">{org.address}</p>}
          <p className="text-xs text-slate-400">
            {[org.gstin && `GSTIN ${org.gstin}`, org.pan && `PAN ${org.pan}`].filter(Boolean).join(" · ")}
          </p>
          <p className="text-xs text-slate-400">{[org.supportEmail, org.supportPhone].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">{gst ? "Tax Invoice" : "Invoice"}</p>
          <p className="font-mono text-white">{inv.invoiceNo}</p>
          <p className="text-xs text-slate-400">Issued {inv.issueDate}</p>
          <p className="text-xs text-slate-400">Due {inv.dueDate}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500">Billed to</p>
        <p className="font-semibold text-white">{student.name} <span className="text-xs text-slate-400">({student.admissionNo})</span></p>
        <p className="text-xs text-slate-400">{[student.email, student.phone].filter(Boolean).join(" · ")}</p>
        {student.address && <p className="text-xs text-slate-400">{student.address}</p>}
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-white/10">
            <th className="pb-2">Description</th>
            {gst?.hsn && <th className="pb-2">SAC</th>}
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/5">
            <td className="py-2 text-slate-200">
              Course fee — {inv.course || "—"}
              {inv.batch && <span className="block text-xs text-slate-500">{inv.batch}</span>}
            </td>
            {gst?.hsn && <td className="py-2 text-slate-400">{gst.hsn}</td>}
            <td className="py-2 text-right font-mono text-slate-200">{inr(gst ? gst.taxable : inv.total)}</td>
          </tr>
          {gst && (
            <tr className="border-b border-white/5">
              <td className="py-2 text-slate-300">{gst.label} @ {gst.rate}% (included)</td>
              {gst.hsn && <td />}
              <td className="py-2 text-right font-mono text-slate-300">{inr(gst.amount)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="ml-auto w-64 space-y-1 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="font-mono text-white">{inr(inv.total)}</span></div>
        {inv.waived > 0 && <div className="flex justify-between"><span className="text-slate-400">Waived</span><span className="font-mono text-purple-300">−{inr(inv.waived)}</span></div>}
        <div className="flex justify-between"><span className="text-slate-400">Paid</span><span className="font-mono text-emerald-300">−{inr(inv.paid)}</span></div>
        <div className="flex justify-between border-t border-white/10 pt-1 font-semibold"><span className="text-white">Balance due</span><span className="font-mono text-white">{inr(inv.balance)}</span></div>
      </div>

      {payments.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1">Payments received</p>
          {payments.map((p) => (
            <p key={p.receiptNo} className="text-xs text-slate-400">
              {p.date} · {p.receiptNo} · {p.mode} · {inr(p.amount)} {p.status !== "success" ? `(${p.status})` : ""}
            </p>
          ))}
        </div>
      )}

      {org.invoiceTerms && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-xs text-slate-500 mb-1">Terms</p>
          <p className="text-xs text-slate-400 whitespace-pre-line">{org.invoiceTerms}</p>
        </div>
      )}
      {!org.gstin && <p className="text-[10px] text-amber-300">Add the institute&apos;s GSTIN in Settings → Invoice Config to issue tax invoices.</p>}
    </div>
  );
}

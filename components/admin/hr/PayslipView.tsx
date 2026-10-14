"use client";

/**
 * Printable payslip (simulator). Print isolates #payslip-print via the
 * scoped @media print rule below.
 */
import React from "react";
import type { PayslipRow } from "@/lib/actions/payroll";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function PayslipView({ row }: { row: PayslipRow }) {
  const s = row.slip;
  const [y, m] = row.month.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const earnings: [string, number][] = [
    ["Basic", s.basic],
    ["House rent allowance", s.hra],
    ["Special allowance", s.special],
  ];
  const deductions: [string, number][] = [
    ["Provident fund (12% of basic)", s.pf],
    ["Professional tax", s.professionalTax],
    ["TDS (illustrative)", s.tds],
  ];

  return (
    <div id="payslip-print" className="space-y-4 text-sm">
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print {
            body * { visibility: hidden !important; }
            #payslip-print, #payslip-print * { visibility: visible !important; color: #0f172a !important; }
            #payslip-print { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; background: white; }
          }`,
        }}
      />
      <div className="flex justify-between items-start border-b border-white/10 pb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">AuraEdu · Payslip</p>
          <p className="text-lg font-bold text-white">{monthLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-white">{row.name}</p>
          <p className="text-xs text-slate-400">{row.employeeId || "—"} · {row.designation || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
        <span>Working days: <b className="text-slate-200">{s.workingDays}</b></span>
        <span>Loss-of-pay days: <b className="text-slate-200">{s.unpaidDays}</b></span>
        <span>Monthly CTC: <b className="text-slate-200">{inr(s.gross)}</b></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <table className="w-full">
          <thead><tr className="text-left text-xs text-slate-500"><th className="pb-1">Earnings</th><th className="pb-1 text-right">Amount</th></tr></thead>
          <tbody>
            {earnings.map(([k, v]) => (
              <tr key={k}><td className="py-0.5 text-slate-300">{k}</td><td className="py-0.5 text-right font-mono text-slate-200">{inr(v)}</td></tr>
            ))}
            {s.lossOfPay > 0 && (
              <tr><td className="py-0.5 text-amber-300">Less: loss of pay</td><td className="py-0.5 text-right font-mono text-amber-300">−{inr(s.lossOfPay)}</td></tr>
            )}
            <tr className="border-t border-white/10"><td className="pt-1 font-semibold text-white">Gross earned</td><td className="pt-1 text-right font-mono font-semibold text-white">{inr(s.earnedGross)}</td></tr>
          </tbody>
        </table>
        <table className="w-full">
          <thead><tr className="text-left text-xs text-slate-500"><th className="pb-1">Deductions</th><th className="pb-1 text-right">Amount</th></tr></thead>
          <tbody>
            {deductions.map(([k, v]) => (
              <tr key={k}><td className="py-0.5 text-slate-300">{k}</td><td className="py-0.5 text-right font-mono text-slate-200">{inr(v)}</td></tr>
            ))}
            <tr className="border-t border-white/10"><td className="pt-1 font-semibold text-white">Total deductions</td><td className="pt-1 text-right font-mono font-semibold text-white">{inr(s.totalDeductions)}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <span className="font-semibold text-emerald-300">Net pay</span>
        <span className="text-xl font-bold font-mono text-emerald-300">{inr(s.net)}</span>
      </div>
      <p className="text-[10px] text-slate-500">
        Simulated payslip for demonstration. Structure: basic 50%, HRA 20%, special 30%; PF 12% of basic (max ₹1,800); professional tax ₹200; illustrative TDS.
      </p>
    </div>
  );
}

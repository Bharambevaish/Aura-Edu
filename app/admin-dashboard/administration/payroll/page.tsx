"use client";

/**
 * Payroll simulator (admin) — monthly payslips for active staff from their
 * salary and approved unpaid leave. Click a row for a printable payslip.
 */
import React, { useEffect, useState } from "react";
import { PageHeader, Button, Modal, StatCard, useToast } from "@/components/ui";
import { Wallet, Printer, Users, IndianRupee, MinusCircle } from "lucide-react";
import { getPayroll, type PayslipRow } from "@/lib/actions/payroll";
import { PayslipView } from "@/components/admin/hr/PayslipView";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function PayrollPage() {
  const { toast } = useToast();
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState<Awaited<ReturnType<typeof getPayroll>> | null>(null);
  const [open, setOpen] = useState<PayslipRow | null>(null);

  useEffect(() => {
    let ignore = false;
    getPayroll(month)
      .then((d) => !ignore && setData(d))
      .catch(() => toast("Could not compute payroll.", "error"));
    return () => {
      ignore = true;
    };
  }, [month, toast]);

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" subtitle="Monthly payslips from staff salaries and approved unpaid leave (simulator)." icon={<Wallet size={20} className="text-emerald-400" />}>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white"
        />
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Staff paid" value={data?.rows.length ?? "—"} icon={<Users size={18} />} accent="blue" />
        <StatCard label="Gross earned" value={data ? inr(data.totals.gross) : "—"} icon={<IndianRupee size={18} />} accent="emerald" />
        <StatCard label="Deductions" value={data ? inr(data.totals.deductions) : "—"} icon={<MinusCircle size={18} />} accent="amber" />
        <StatCard label="Net payout" value={data ? inr(data.totals.net) : "—"} icon={<Wallet size={18} />} accent="purple" />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Staff</th>
              <th className="py-3 px-4 text-right">Monthly CTC</th>
              <th className="py-3 px-4 text-right">LOP days</th>
              <th className="py-3 px-4 text-right">Gross earned</th>
              <th className="py-3 px-4 text-right">Deductions</th>
              <th className="py-3 px-4 text-right">Net pay</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {!data && <tr><td colSpan={7} className="py-8 text-center text-slate-500">Computing…</td></tr>}
            {data?.rows.map((r) => (
              <tr key={r.userId} className="border-b border-slate-800/50 hover:bg-white/5">
                <td className="py-3 px-4">
                  <p className="font-semibold text-white">{r.name}</p>
                  <p className="text-[11px] text-slate-500">{r.designation || "—"}</p>
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-300">{inr(r.slip.gross)}</td>
                <td className={`py-3 px-4 text-right font-mono ${r.slip.unpaidDays ? "text-amber-300" : "text-slate-500"}`}>{r.slip.unpaidDays}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-200">{inr(r.slip.earnedGross)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">{inr(r.slip.totalDeductions)}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-300">{inr(r.slip.net)}</td>
                <td className="py-3 px-4">
                  <button onClick={() => setOpen(r)} className="text-xs text-emerald-400 hover:underline">Payslip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data && (
        <p className="text-xs text-slate-500">
          {data.workingDays} working days in this month (Mon–Sat).
          {data.withoutSalary.length > 0 && ` No salary set for: ${data.withoutSalary.join(", ")} — add it in Staff Corner.`}
        </p>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title="Payslip"
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(null)}>Close</Button>
            <Button size="sm" onClick={() => window.print()}><Printer size={14} /> Print</Button>
          </>
        }
      >
        {open && <PayslipView row={open} />}
      </Modal>
    </div>
  );
}

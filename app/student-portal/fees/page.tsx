"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getMyFees, payMyInvoice, type MyFees } from "@/lib/actions/finance";
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Receipt,
} from "lucide-react";

export default function FeesPage() {
  const { profile } = useStudent();
  const router = useRouter();

  const [fees, setFees] = useState<MyFees | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [showPayDrawer, setShowPayDrawer] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [payMode, setPayMode] = useState<"Online" | "UPI">("Online");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    getMyFees()
      .then((data) => {
        if (!ignore) {
          setFees(data);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  if (!fees) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-sm text-slate-400">
        {loadError ? "Could not load your fee account. Please refresh the page." : "Loading your fee account…"}
      </div>
    );
  }

  const totalFee = fees.total;
  const paidFee = fees.paid;
  const pendingFee = fees.outstanding;
  const overdueFee = fees.overdue;
  const paymentReceipts = fees.receipts;
  const clearedPct = totalFee > 0 ? Math.round(((paidFee + fees.waived) / totalFee) * 100) : 0;
  const nextDue = fees.nextDueDate
    ? new Date(fees.nextDueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  const openPayDrawer = () => {
    setPayAmount(pendingFee);
    setPayError(null);
    setShowPayDrawer(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPayError(null);
    try {
      const res = await payMyInvoice({ amount: Number(payAmount), mode: payMode });
      if (!res.ok) {
        setPayError(res.message);
        return;
      }
      setPaymentSuccess(true);
      setReloadKey((k) => k + 1);
      router.refresh(); // header + dashboard read pendingFee from the layout
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPayDrawer(false);
      }, 1200);
    } catch {
      setPayError("Payment could not be processed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Fee Structure & Payment Receipts</h2>
          </div>
          <p className="text-xs text-slate-400">
            Official fee account for {profile.name} ({profile.admissionNo}).
          </p>
        </div>

        {pendingFee > 0 && (
          <button
            onClick={openPayDrawer}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            <CreditCard className="h-4 w-4" /> Pay Pending Due ₹{pendingFee.toLocaleString()}
          </button>
        )}
      </div>

      {/* 2. Fee Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Course Fee</span>
          <p className="text-2xl font-black text-white font-mono">₹{totalFee.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 font-mono">
            {fees.invoices} invoice{fees.invoices === 1 ? "" : "s"} · Academic Year {profile.academicYear}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Paid Fee Amount</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">₹{paidFee.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Receipts Logged
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-1">
          <span className="text-xs text-amber-400 font-semibold">Outstanding Due</span>
          <p className="text-2xl font-black text-amber-400 font-mono">₹{pendingFee.toLocaleString()}</p>
          <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {nextDue ? `Next due ${nextDue}` : "Nothing due"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Overdue Amount</span>
          <p className={`text-2xl font-black font-mono ${overdueFee > 0 ? "text-rose-400" : "text-slate-400"}`}>
            ₹{overdueFee.toLocaleString()}
          </p>
          <p className={`text-[10px] font-mono ${overdueFee > 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {overdueFee > 0 ? "Past due date" : "Nothing overdue"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-300">Payment Clearance Progress</span>
          <span className="text-cyan-400 font-mono">
            {clearedPct}% Cleared
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
            style={{ width: `${Math.min(100, clearedPct)}%` }}
          />
        </div>
      </div>

      {/* 3. Transaction Receipts Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Receipt className="h-5 w-5 text-cyan-400" /> Transaction Receipts & History
        </h3>

        <div className="rounded-2xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Receipt No</th>
                <th className="p-4">Date</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {paymentReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {paymentReceipts.map((rcp) => (
                <tr key={rcp.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-bold text-cyan-400 font-mono">{rcp.receiptNo}</td>
                  <td className="p-4 font-mono text-slate-400">{rcp.date}</td>
                  <td className="p-4 font-semibold text-slate-200">{rcp.mode}</td>
                  <td className="p-4 text-slate-300">{rcp.description}</td>
                  <td className="p-4 font-bold text-white font-mono">₹{rcp.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rcp.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {rcp.status.charAt(0).toUpperCase() + rcp.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {rcp.status === "success" && (
                      <button
                        onClick={() => alert(`Printing Official Receipt: ${rcp.receiptNo}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pay Due Drawer */}
      {showPayDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-400" /> Online Payment Drawer
                </h3>
                <button
                  onClick={() => setShowPayDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {paymentSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Payment Recorded!</h4>
                  <p className="text-xs text-slate-400">
                    Receipt generated and balance updated successfully.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">STUDENT DETAILS</span>
                    <p className="text-sm font-bold text-white">{profile.name}</p>
                    <p className="text-xs text-cyan-400 font-mono">{profile.admissionNo}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Payment Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={pendingFee}
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-base font-bold text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Payment Gateway Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Online", "UPI"] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setPayMode(m)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            payMode === m
                              ? "bg-amber-500/20 border-amber-500 text-amber-300"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {payError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" /> {payError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || payAmount <= 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {isProcessing ? "Connecting to payment gateway..." : `Confirm Payment of ₹${payAmount}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

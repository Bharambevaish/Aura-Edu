/**
 * Finance — shared constants + display helpers for the Finance Operations
 * module. Plain module (not "use server") so both server actions and client
 * pages can import synchronously, mirroring lib/courses.ts.
 */

export type ExpenseStatus = "pending" | "approved" | "rejected" | "voided";
export type PaymentStatus = "success" | "cancelled" | "refunded";
export type InvoiceStatus = "Paid" | "Issued" | "Overdue";
export type RefundStatus = "pending" | "approved" | "processed" | "completed" | "rejected";
export type WaiverStatus = "pending" | "approved" | "rejected";

export type PaymentMode = "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "Online";
export type PaymentSource = "Admin" | "Student Portal";

export const PAYMENT_MODES: PaymentMode[] = ["Cash", "Bank Transfer", "UPI", "Cheque", "Online"];
export const PAYMENT_SOURCES: PaymentSource[] = ["Admin", "Student Portal"];

export const EXPENSE_STATUSES: { value: ExpenseStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "voided", label: "Voided" },
];

export const REFUND_STATUSES: { value: RefundStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "processed", label: "Processed" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export const WAIVER_STATUSES: { value: WaiverStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function isExpenseStatus(v: string | null | undefined): v is ExpenseStatus {
  return v === "pending" || v === "approved" || v === "rejected" || v === "voided";
}

export function isPaymentStatus(v: string | null | undefined): v is PaymentStatus {
  return v === "success" || v === "cancelled" || v === "refunded";
}

export function isRefundStatus(v: string | null | undefined): v is RefundStatus {
  return v === "pending" || v === "approved" || v === "processed" || v === "completed" || v === "rejected";
}

export function isWaiverStatus(v: string | null | undefined): v is WaiverStatus {
  return v === "pending" || v === "approved" || v === "rejected";
}

/** Deterministic pill classes for every finance status (kept as full literals). */
export const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  processed: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  rejected: "bg-red-500/15 text-red-300 border-red-500/25",
  voided: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  cancelled: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  refunded: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Issued: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Overdue: "bg-red-500/15 text-red-300 border-red-500/25",
};

/** Compact INR formatter used across the finance cards/tables. */
export function fmtINR(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
}
"use server";

/**
 * Finance Operations — the accounts backend for the Finance module.
 *
 * Split across concerns: expense claiming + approvals, vendors &
 * categories, invoices / payments / refunds / waivers, an audit trail and a
 * derived overview dashboard. Every mutation writes an AuditLog row.
 *
 * Rule of thumb: staff create/submit/pay/refund/waive; only admins approve,
 * reject, void, delete and process.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { UserModel } from "@/lib/models/User";
import { VendorModel } from "@/lib/models/Vendor";
import type { VendorDoc } from "@/lib/models/Vendor";
import { ExpenseCategoryModel } from "@/lib/models/ExpenseCategory";
import { ExpenseModel } from "@/lib/models/Expense";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { RefundModel } from "@/lib/models/Refund";
import { WaiverModel } from "@/lib/models/Waiver";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { writeAudit, writeSystemAudit } from "@/lib/audit";
import { getBranchScope, studentRefFilter } from "@/lib/branch-scope";
import { getInstitute, defaultTaxRule, inclusiveGst } from "@/lib/institute";
import {
  VendorSchema,
  ExpenseCategorySchema,
  ExpenseSchema,
  ExpenseDecisionSchema,
  PaymentSchema,
  RefundSchema,
  WaiverSchema,
  StudentPaymentSchema,
} from "@/lib/validation";
import type {
  ExpenseStatus,
  InvoiceStatus,
  PaymentStatus,
  RefundStatus,
  WaiverStatus,
} from "@/lib/finance";
import { invoiceBalance, invoiceStatus, summarizeFees, refundableAmount } from "@/lib/finance";
import { nextDocNo } from "@/lib/doc-numbers";
import { isDemoMode } from "@/lib/demo-mode";

const pad = (n: number, width: number) => String(n).padStart(width, "0");

const year = () => new Date().getFullYear();

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/** All students for pickers (payments, waivers, refunds). */
export async function getFinanceStudents(): Promise<
  { id: string; name: string; admissionNo: string; batch: string; course: string }[]
> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const scope = await getBranchScope();
  const students = await UserModel.find({ role: "student", ...scope.students }).sort({ name: 1 }).lean();
  return students.map((s) => ({
    id: String(s._id),
    name: s.name,
    admissionNo: s.admissionNo ?? "-",
    batch: s.batch ?? "-",
    course: s.course ?? "-",
  }));
}

/* ------------------------------------------------------------------ */
/* Vendors                                                             */
/* ------------------------------------------------------------------ */

export type VendorRow = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branchName: string;
  isActive: boolean;
};

function toVendorRow(v: VendorDoc & { _id: mongoose.Types.ObjectId }): VendorRow {
  return {
    id: String(v._id),
    name: v.name ?? "",
    contactPerson: v.contactPerson ?? "",
    email: v.email ?? "",
    phone: v.phone ?? "",
    gstin: v.gstin ?? "",
    pan: v.pan ?? "",
    address: v.address ?? "",
    bankName: v.bankName ?? "",
    accountNumber: v.accountNumber ?? "",
    ifsc: v.ifsc ?? "",
    branchName: v.branchName ?? "",
    isActive: v.isActive ?? true,
  };
}

export async function getVendors(): Promise<VendorRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const vendors = await VendorModel.find().sort({ name: 1 }).lean();
  return vendors.map((v) => toVendorRow(v));
}

export async function createVendor(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = VendorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid vendor details." };
  await connectDB();
  const dup = await VendorModel.findOne({ name: parsed.data.name }).lean();
  if (dup) return { ok: false, message: "A vendor with that name already exists." };
  await VendorModel.create(parsed.data);
  await writeAudit(user, "created vendor", parsed.data.name);
  return { ok: true, message: "Vendor added." };
}

export async function updateVendor(vendorId: string, input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = VendorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid vendor details." };
  await connectDB();
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) return { ok: false, message: "Vendor not found." };
  const dup = await VendorModel.findOne({ name: parsed.data.name, _id: { $ne: vendor._id } }).lean();
  if (dup) return { ok: false, message: "A vendor with that name already exists." };
  await VendorModel.updateOne({ _id: vendor._id }, { $set: parsed.data });
  await writeAudit(user, "updated vendor", parsed.data.name);
  return { ok: true, message: "Vendor updated." };
}

export async function toggleVendor(vendorId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) return { ok: false, message: "Vendor not found." };
  const next = !vendor.isActive;
  await VendorModel.updateOne({ _id: vendor._id }, { $set: { isActive: next } });
  await writeAudit(user, next ? "activated vendor" : "deactivated vendor", vendor.name);
  return { ok: true, message: next ? "Vendor activated." : "Vendor deactivated." };
}

export async function deleteVendor(vendorId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const vendor = await VendorModel.findById(vendorId);
  if (!vendor) return { ok: false, message: "Vendor not found." };
  const used = await ExpenseModel.countDocuments({ vendorRef: vendor._id });
  if (used > 0) return { ok: false, message: `${used} expense(s) reference this vendor — edit those first.` };
  await VendorModel.deleteOne({ _id: vendor._id });
  await writeAudit(user, "deleted vendor", vendor.name);
  return { ok: true, message: "Vendor deleted." };
}

/* ------------------------------------------------------------------ */
/* Expense categories                                                  */
/* ------------------------------------------------------------------ */

export type CategoryRow = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export async function getExpenseCategories(): Promise<CategoryRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const cats = await ExpenseCategoryModel.find().sort({ name: 1 }).lean();
  return cats.map((c) => ({
    id: String(c._id),
    name: c.name,
    description: c.description ?? "",
    isActive: c.isActive ?? true,
  }));
}

export async function createExpenseCategory(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = ExpenseCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid category details." };
  await connectDB();
  const dup = await ExpenseCategoryModel.findOne({ name: parsed.data.name }).lean();
  if (dup) return { ok: false, message: "A category with that name already exists." };
  await ExpenseCategoryModel.create(parsed.data);
  await writeAudit(user, "created expense category", parsed.data.name);
  return { ok: true, message: "Category added." };
}

export async function updateExpenseCategory(categoryId: string, input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = ExpenseCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid category details." };
  await connectDB();
  const cat = await ExpenseCategoryModel.findById(categoryId);
  if (!cat) return { ok: false, message: "Category not found." };
  const dup = await ExpenseCategoryModel.findOne({ name: parsed.data.name, _id: { $ne: cat._id } }).lean();
  if (dup) return { ok: false, message: "A category with that name already exists." };
  await ExpenseCategoryModel.updateOne({ _id: cat._id }, { $set: parsed.data });
  await writeAudit(user, "updated expense category", parsed.data.name);
  return { ok: true, message: "Category updated." };
}

export async function deleteExpenseCategory(categoryId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const cat = await ExpenseCategoryModel.findById(categoryId);
  if (!cat) return { ok: false, message: "Category not found." };
  const used = await ExpenseModel.countDocuments({ categoryRef: cat._id });
  if (used > 0) return { ok: false, message: `${used} expense(s) use this category — edit those first.` };
  await ExpenseCategoryModel.deleteOne({ _id: cat._id });
  await writeAudit(user, "deleted expense category", cat.name);
  return { ok: true, message: "Category deleted." };
}

/* ------------------------------------------------------------------ */
/* Expenses                                                            */
/* ------------------------------------------------------------------ */

export type ExpenseRow = {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  category: string;
  vendor: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  paymentSource: string;
  refNo: string;
  internalNotes: string;
  status: ExpenseStatus;
  isReimbursement: boolean;
  reimbursedTo: string;
  createdByName: string;
  approvedByName: string;
  approvedAt: string | null;
  rejectedReason: string;
};

type ExpenseDetails = {
  id: string;
  refNumber: string;
  title: string;
  description: string;
  categoryId: string;
  category: string;
  vendorId: string;
  vendor: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  paymentSource: string;
  refNo: string;
  internalNotes: string;
  status: ExpenseStatus;
  isReimbursement: boolean;
  reimbursedTo: string;
  createdBy: string;
  createdByName: string;
  approvedBy: string;
  approvedByName: string;
  approvedAt: string | null;
  rejectedReason: string;
};

async function fetchExpenseDetails(): Promise<ExpenseDetails[]> {
  const [expenses, categories, vendors, users] = await Promise.all([
    ExpenseModel.find().sort({ createdAt: -1 }).lean(),
    ExpenseCategoryModel.find().lean(),
    VendorModel.find().lean(),
    UserModel.find().select("_id name").lean(),
  ]);
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]));
  const vendorMap = new Map(vendors.map((v) => [String(v._id), v.name]));
  const userMap = new Map(users.map((u) => [String(u._id), u.name]));
  return expenses.map((e) => ({
    id: String(e._id),
    refNumber: e.refNumber,
    title: e.title,
    description: e.description ?? "",
    categoryId: String(e.categoryRef),
    category: catMap.get(String(e.categoryRef)) ?? "Other",
    vendorId: e.vendorRef ? String(e.vendorRef) : "",
    vendor: e.vendorRef ? vendorMap.get(String(e.vendorRef)) ?? "" : "",
    amount: e.amount,
    expenseDate: fmtDay(e.expenseDate),
    paymentMethod: e.paymentMethod ?? "",
    paymentSource: e.paymentSource ?? "",
    refNo: e.refNo ?? "",
    internalNotes: e.internalNotes ?? "",
    status: e.status,
    isReimbursement: e.isReimbursement ?? false,
    reimbursedTo: e.reimbursedTo ?? "",
    createdBy: e.createdBy ? String(e.createdBy) : "",
    createdByName: e.createdBy ? userMap.get(String(e.createdBy)) ?? "Unknown" : "Unknown",
    approvedBy: e.approvedBy ? String(e.approvedBy) : "",
    approvedByName: e.approvedBy ? userMap.get(String(e.approvedBy)) ?? "" : "",
    approvedAt: e.approvedAt ? fmtDay(e.approvedAt) : null,
    rejectedReason: e.rejectedReason ?? "",
  }));
}

function toExpenseRow(e: ExpenseDetails): ExpenseRow {
  return {
    id: e.id,
    refNumber: e.refNumber,
    title: e.title,
    description: e.description,
    category: e.category,
    vendor: e.vendor,
    amount: e.amount,
    expenseDate: e.expenseDate,
    paymentMethod: e.paymentMethod,
    paymentSource: e.paymentSource,
    refNo: e.refNo,
    internalNotes: e.internalNotes,
    status: e.status,
    isReimbursement: e.isReimbursement,
    reimbursedTo: e.reimbursedTo,
    createdByName: e.createdByName,
    approvedByName: e.approvedByName,
    approvedAt: e.approvedAt,
    rejectedReason: e.rejectedReason,
  };
}

/** Full createdBy/approvedBy resolution used by the list + edit screens. */
export async function getExpenseUsers() {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const users = await UserModel.find().select("_id name role").lean();
  return users.map((u) => ({ id: String(u._id), name: u.name, role: u.role }));
}

export async function getExpenses(): Promise<{ stats: { pending: number; approved: number; total: number; monthSpend: number }; expenses: ExpenseRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const details = await fetchExpenseDetails();
  const expenses = details.map(toExpenseRow);
  const monthSpend = details
    .filter((e) => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);
  return {
    stats: {
      pending: expenses.filter((e) => e.status === "pending").length,
      approved: expenses.filter((e) => e.status === "approved").length,
      total: expenses.length,
      monthSpend,
    },
    expenses,
  };
}

export async function getApprovalQueue(): Promise<ExpenseRow[]> {
  await requireRole(["admin"]);
  await connectDB();
  const details = await fetchExpenseDetails();
  return details.filter((e) => e.status === "pending").map(toExpenseRow);
}

export async function createExpense(input: unknown): Promise<{ ok: boolean; message: string; id?: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = ExpenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid expense details." };
  await connectDB();
  const category = await ExpenseCategoryModel.findById(parsed.data.categoryRef).lean();
  if (!category) return { ok: false, message: "Pick a valid expense category." };
  if (parsed.data.vendorRef) {
    const vendor = await VendorModel.findById(parsed.data.vendorRef).lean();
    if (!vendor) return { ok: false, message: "Pick a valid vendor." };
  }
  const refNumber = await nextDocNo(ExpenseModel, "refNumber", `EXP-${year()}-`, 5);
  const expense = await ExpenseModel.create({
    ...parsed.data,
    refNumber,
    expenseDate: new Date(parsed.data.expenseDate),
    createdBy: new mongoose.Types.ObjectId(user.id),
    status: "pending",
  });
  await writeAudit(user, "submitted expense", `${refNumber} — ${parsed.data.title}`);
  return { ok: true, message: "Expense submitted for approval.", id: String(expense._id) };
}

export async function updateExpense(expenseId: string, input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = ExpenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid expense details." };
  await connectDB();
  const expense = await ExpenseModel.findById(expenseId);
  if (!expense) return { ok: false, message: "Expense not found." };
  if (expense.status !== "pending") return { ok: false, message: "Only pending expenses can be edited." };
  const category = await ExpenseCategoryModel.findById(parsed.data.categoryRef).lean();
  if (!category) return { ok: false, message: "Pick a valid expense category." };
  await ExpenseModel.updateOne(
    { _id: expense._id },
    {
      $set: {
        ...parsed.data,
        expenseDate: new Date(parsed.data.expenseDate),
      },
    },
  );
  await writeAudit(user, "updated expense", `${expense.refNumber}`);
  return { ok: true, message: "Expense updated." };
}

export async function decideExpense(
  expenseId: string,
  input: unknown,
): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  const parsed = ExpenseDecisionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid decision." };
  await connectDB();
  const expense = await ExpenseModel.findById(expenseId);
  if (!expense) return { ok: false, message: "Expense not found." };
  if (expense.status !== "pending") return { ok: false, message: "Only pending expenses can be decided." };

  await ExpenseModel.updateOne(
    { _id: expense._id },
    {
      $set: {
        status: parsed.data.status,
        ...(parsed.data.status === "approved"
          ? { approvedBy: new mongoose.Types.ObjectId(user.id), approvedAt: new Date() }
          : {
              rejectedBy: new mongoose.Types.ObjectId(user.id),
              rejectedAt: new Date(),
              rejectedReason: parsed.data.reason ?? "",
            }),
      },
    },
  );
  await writeAudit(
    user,
    parsed.data.status === "approved" ? "approved expense" : "rejected expense",
    `${expense.refNumber} — ${expense.title}`,
  );
  return { ok: true, message: parsed.data.status === "approved" ? "Expense approved." : "Expense rejected." };
}

export async function voidExpense(expenseId: string, reason: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const expense = await ExpenseModel.findById(expenseId);
  if (!expense) return { ok: false, message: "Expense not found." };
  if (expense.status === "voided") return { ok: false, message: "Expense is already voided." };
  await ExpenseModel.updateOne(
    { _id: expense._id },
    {
      $set: {
        status: "voided",
        rejectedBy: new mongoose.Types.ObjectId(user.id),
        rejectedAt: new Date(),
        rejectedReason: reason.trim() || "Voided by admin",
      },
    },
  );
  await writeAudit(user, "voided expense", `${expense.refNumber} — ${expense.title}`);
  return { ok: true, message: "Expense voided." };
}

export async function deleteExpense(expenseId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const expense = await ExpenseModel.findById(expenseId);
  if (!expense) return { ok: false, message: "Expense not found." };
  if (expense.status === "approved") return { ok: false, message: "Approved expenses cannot be deleted — void it instead." };
  await ExpenseModel.deleteOne({ _id: expense._id });
  await writeAudit(user, "deleted expense", `${expense.refNumber} — ${expense.title}`);
  return { ok: true, message: "Expense deleted." };
}

/* ------------------------------------------------------------------ */
/* Invoices                                                            */
/* ------------------------------------------------------------------ */

export type InvoiceRow = {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  course: string;
  batch: string;
  branch: string;
  total: number;
  paid: number;
  waived: number;
  due: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
};

export async function getInvoices(): Promise<{ stats: { collected: number; outstanding: number; overdue: number; invoices: number }; invoices: InvoiceRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  // Branch switcher: scoped through each invoice's student.
  const own = await studentRefFilter(await getBranchScope());
  const [invoices, users] = await Promise.all([
    InvoiceModel.find(own).sort({ createdAt: -1 }).lean(),
    UserModel.find({ role: "student" }).lean(),
  ]);
  const userMap = new Map(users.map((u) => [String(u._id), u]));
  const rows: InvoiceRow[] = invoices.map((inv) => {
    const student = userMap.get(String(inv.studentId));
    const paid = inv.paid ?? 0;
    const waived = inv.waived ?? 0;
    const due = invoiceBalance(inv);
    return {
      id: String(inv._id),
      invoiceNo: inv.invoiceNo,
      studentId: String(inv.studentId),
      studentName: student?.name ?? "Unknown",
      admissionNo: student?.admissionNo ?? "-",
      course: inv.course || student?.course || "-",
      batch: inv.batch || student?.batch || "-",
      branch: inv.branch || student?.branch || "-",
      total: inv.total,
      paid,
      waived,
      due,
      status: invoiceStatus(due, inv.dueDate),
      issueDate: fmtDay(inv.issueDate),
      dueDate: fmtDay(inv.dueDate),
    };
  });
  const stats = rows.reduce(
    (acc, r) => ({
      collected: acc.collected + r.paid,
      outstanding: acc.outstanding + r.due,
      overdue: acc.overdue + (r.status === "Overdue" ? 1 : 0),
      invoices: acc.invoices + 1,
    }),
    { collected: 0, outstanding: 0, overdue: 0, invoices: 0 },
  );
  return { stats, invoices: rows };
}

/** Auto-create invoices for every active student missing one (demo "sync"). */
export async function syncInvoices(): Promise<{ ok: boolean; message: string; created: number }> {
  const { user } = await requireRole(["admin", "staff"]);
  await connectDB();
  // Within a branch view, only that branch's students are invoiced.
  const scope = await getBranchScope();
  const [students, existing] = await Promise.all([
    UserModel.find({ role: "student", status: "Active", ...scope.students }).lean(),
    InvoiceModel.find().select("studentId").lean(),
  ]);
  const have = new Set(existing.map((i) => String(i.studentId)));
  const now = new Date();
  const rule = defaultTaxRule(await getInstitute());
  let created = 0;
  for (const s of students) {
    if (have.has(String(s._id))) continue;
    const total = s.course?.toLowerCase().includes("neet") ? 10001 : 9001;
    const invoiceNo = await nextDocNo(InvoiceModel, "invoiceNo", `INV-${year()}-`, 5);
    await InvoiceModel.create({
      invoiceNo,
      studentId: s._id,
      course: s.course ?? "",
      batch: s.batch ?? "",
      branch: s.branch ?? "",
      total,
      paid: 0,
      waived: 0,
      taxGst: rule ? inclusiveGst(total, rule.rate) : 0,
      issueDate: now,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      notes: "Auto-generated during sync",
    });
    created += 1;
  }
  if (created > 0) {
    await writeSystemAudit("synced invoices", `auto-created ${created} invoice(s)`);
  } else {
    await writeAudit(user, "synced invoices", "no new invoices required");
  }
  return { ok: true, message: created ? `${created} invoice(s) created.` : "No new invoices needed — every active student is covered.", created };
}

/* ------------------------------------------------------------------ */
/* Payments                                                            */
/* ------------------------------------------------------------------ */

export type PaymentRow = {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  invoiceNo: string;
  amount: number;
  gst: number;
  gatewayFee: number;
  netAmount: number;
  mode: string;
  source: string;
  branch: string;
  status: PaymentStatus;
  recordedAt: string;
};

export async function getPayments(): Promise<{ stats: { collected: number; count: number; today: number }; payments: PaymentRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const own = await studentRefFilter(await getBranchScope());
  const [payments, users, invoices] = await Promise.all([
    PaymentModel.find(own).sort({ recordedAt: -1 }).lean(),
    UserModel.find({ role: "student" }).lean(),
    InvoiceModel.find().select("invoiceNo").lean(),
  ]);
  const userMap = new Map(users.map((u) => [String(u._id), u.name]));
  const invoiceMap = new Map(invoices.map((i) => [String(i._id), i.invoiceNo]));
  const rows: PaymentRow[] = payments.map((p) => ({
    id: String(p._id),
    receiptNo: p.receiptNo,
    studentId: String(p.studentId),
    studentName: userMap.get(String(p.studentId)) ?? "Unknown",
    invoiceNo: p.invoiceId ? invoiceMap.get(String(p.invoiceId)) ?? "-" : "-",
    amount: p.amount,
    gst: p.gst ?? 0,
    gatewayFee: p.gatewayFee ?? 0,
    netAmount: p.netAmount,
    mode: p.mode,
    source: p.source,
    branch: p.branch ?? "",
    status: p.status,
    recordedAt: p.recordedAt ? p.recordedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-",
  }));
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const collected = payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);
  const count = payments.filter((p) => p.status === "success").length;
  const today = payments.filter((p) => p.status === "success" && p.recordedAt >= todayStart).reduce((s, p) => s + p.amount, 0);
  return { stats: { collected, count, today }, payments: rows };
}

export async function getPaidPayments(): Promise<PaymentRow[]> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const own = await studentRefFilter(await getBranchScope());
  const [payments, users, invoices] = await Promise.all([
    PaymentModel.find({ status: "success", ...own }).sort({ recordedAt: -1 }).lean(),
    UserModel.find({ role: "student" }).lean(),
    InvoiceModel.find().select("invoiceNo").lean(),
  ]);
  const userMap = new Map(users.map((u) => [String(u._id), u.name]));
  const invoiceMap = new Map(invoices.map((i) => [String(i._id), i.invoiceNo]));
  return payments.map((p) => ({
    id: String(p._id),
    receiptNo: p.receiptNo,
    studentId: String(p.studentId),
    studentName: userMap.get(String(p.studentId)) ?? "Unknown",
    invoiceNo: p.invoiceId ? invoiceMap.get(String(p.invoiceId)) ?? "-" : "-",
    amount: p.amount,
    gst: p.gst ?? 0,
    gatewayFee: p.gatewayFee ?? 0,
    netAmount: p.netAmount,
    mode: p.mode,
    source: p.source,
    branch: p.branch ?? "",
    status: p.status,
    recordedAt: p.recordedAt ? p.recordedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-",
  }));
}

export async function recordPayment(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = PaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid payment details." };
  if (!mongoose.isValidObjectId(parsed.data.studentId)) return { ok: false, message: "Select a valid student." };
  if (parsed.data.invoiceId && !mongoose.isValidObjectId(parsed.data.invoiceId)) {
    return { ok: false, message: "Pick a valid invoice." };
  }
  await connectDB();
  const student = await UserModel.findOne({ _id: parsed.data.studentId, role: "student" }).lean();
  if (!student) return { ok: false, message: "Select a valid student." };

  let invoiceId: mongoose.Types.ObjectId | undefined;
  if (parsed.data.invoiceId) {
    // The invoice must belong to this student — otherwise a payment recorded
    // for one student would reduce another student's balance.
    const invoice = await InvoiceModel.findOne({ _id: parsed.data.invoiceId, studentId: student._id }).lean();
    if (!invoice) return { ok: false, message: "That invoice does not belong to the selected student." };
    const balance = invoice.total - invoice.paid - invoice.waived;
    if (parsed.data.amount > balance) {
      return { ok: false, message: `Amount exceeds the balance on ${invoice.invoiceNo} (₹${Math.max(0, balance).toLocaleString("en-IN")}).` };
    }
    invoiceId = invoice._id as mongoose.Types.ObjectId;
  }

  // Apply to the invoice first with a conditional update so two concurrent
  // payments can never push paid + waived past the total.
  if (invoiceId) {
    const applied = await InvoiceModel.updateOne(
      { _id: invoiceId, $expr: { $lte: [{ $add: ["$paid", "$waived", parsed.data.amount] }, "$total"] } },
      { $inc: { paid: parsed.data.amount } },
    );
    if (applied.modifiedCount === 0) {
      return { ok: false, message: "The invoice balance changed — refresh and try again." };
    }
  }

  const now = new Date();
  const yyyymm = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}`;
  const receiptNo = await nextDocNo(PaymentModel, "receiptNo", `RCP-${yyyymm}-`, 4);
  const gst = parsed.data.gst ?? 0;
  const gatewayFee = parsed.data.gatewayFee ?? 0;
  await PaymentModel.create({
    receiptNo,
    studentId: new mongoose.Types.ObjectId(parsed.data.studentId),
    invoiceId,
    amount: parsed.data.amount,
    gst,
    gatewayFee,
    netAmount: parsed.data.amount - gatewayFee,
    mode: parsed.data.mode,
    source: parsed.data.source,
    branch: student.branch ?? "",
    status: "success",
    recordedBy: new mongoose.Types.ObjectId(user.id),
    recordedAt: now,
  });

  await writeAudit(user, "recorded payment", `${receiptNo} — ${student.name} (₹${parsed.data.amount})`);
  return { ok: true, message: `Payment recorded (${receiptNo}).`, };
}

export async function cancelPayment(paymentId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const payment = await PaymentModel.findById(paymentId);
  if (!payment) return { ok: false, message: "Payment not found." };
  if (payment.status !== "success") return { ok: false, message: "Only successful payments can be cancelled." };
  if (payment.invoiceId) {
    await InvoiceModel.updateOne({ _id: payment.invoiceId }, { $inc: { paid: -Math.min(payment.amount, payment.netAmount) } });
  }
  await PaymentModel.updateOne({ _id: payment._id }, { $set: { status: "cancelled" } });
  await writeAudit(user, "cancelled payment", `${payment.receiptNo} (₹${payment.amount})`);
  return { ok: true, message: "Payment cancelled and invoice adjusted." };
}

/* ------------------------------------------------------------------ */
/* Refunds                                                             */
/* ------------------------------------------------------------------ */

export type RefundRow = {
  id: string;
  refundNo: string;
  studentId: string;
  studentName: string;
  paymentId: string;
  paymentReceiptNo: string;
  invoiceId: string;
  amount: number;
  reason: string;
  method: string;
  status: RefundStatus;
  requestedByName: string;
  decidedByName: string;
  decidedAt: string | null;
  remarks: string;
};

export async function getRefunds(): Promise<{ stats: { pending: number; processed: number; total: number }; refunds: RefundRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const [refunds, users, payments] = await Promise.all([
    RefundModel.find().sort({ createdAt: -1 }).lean(),
    UserModel.find().lean(),
    PaymentModel.find().select("receiptNo invoiceId").lean(),
  ]);
  const userName = new Map(users.map((u) => [String(u._id), u.name]));
  const paymentMap = new Map(payments.map((p) => [String(p._id), p]));
  const rows: RefundRow[] = refunds.map((r) => ({
    id: String(r._id),
    refundNo: r.refundNo,
    studentId: String(r.studentId),
    studentName: userName.get(String(r.studentId)) ?? "Unknown",
    paymentId: String(r.paymentId),
    paymentReceiptNo: paymentMap.get(String(r.paymentId))?.receiptNo ?? "-",
    invoiceId: r.invoiceId ? String(r.invoiceId) : "",
    amount: r.amount,
    reason: r.reason,
    method: r.method,
    status: r.status,
    requestedByName: userName.get(String(r.requestedBy)) ?? "Unknown",
    decidedByName: r.decidedBy ? userName.get(String(r.decidedBy)) ?? "-" : "-",
    decidedAt: r.decidedAt ? fmtDay(r.decidedAt) : null,
    remarks: r.remarks ?? "",
  }));
  return {
    stats: {
      pending: rows.filter((r) => r.status === "pending").length,
      processed: rows.filter((r) => r.status === "processed" || r.status === "completed").length,
      total: rows.length,
    },
    refunds: rows,
  };
}

export async function createRefund(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = RefundSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid refund details." };
  await connectDB();
  const payment = await PaymentModel.findById(parsed.data.paymentId).lean();
  if (!payment) return { ok: false, message: "Select a valid payment." };
  if (payment.status !== "success") return { ok: false, message: "Only successful payments can be refunded." };
  // Earlier refund requests on the same payment count too, so two requests
  // can never add up to more than was paid.
  const earlier = await RefundModel.find({ paymentId: payment._id }).select("amount status").lean();
  const refundable = refundableAmount(payment.amount, earlier);
  if (parsed.data.amount > refundable) {
    return {
      ok: false,
      message: refundable > 0
        ? `Refund cannot exceed ₹${refundable.toLocaleString("en-IN")} — the rest of this payment is already refunded or requested.`
        : "This payment has already been fully refunded or requested.",
    };
  }
  const refundNo = await nextDocNo(RefundModel, "refundNo", `RUF-${year()}-`, 5);
  await RefundModel.create({
    refundNo,
    studentId: payment.studentId,
    paymentId: payment._id,
    invoiceId: payment.invoiceId ?? undefined,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    method: parsed.data.method || "Original Mode",
    status: "pending",
    requestedBy: new mongoose.Types.ObjectId(user.id),
  });
  const student = await UserModel.findById(payment.studentId).select("name").lean();
  await writeAudit(user, "requested refund", `${refundNo} — ${student?.name ?? ""} (₹${parsed.data.amount})`);
  return { ok: true, message: "Refund requested for approval." };
}

export async function decideRefund(
  refundId: string,
  decision: "approved" | "rejected",
  remarks: string,
): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const refund = await RefundModel.findById(refundId);
  if (!refund) return { ok: false, message: "Refund not found." };
  if (refund.status !== "pending") return { ok: false, message: "Only pending refunds can be decided." };
  await RefundModel.updateOne(
    { _id: refund._id },
    {
      $set: {
        status: decision,
        decidedBy: new mongoose.Types.ObjectId(user.id),
        decidedAt: new Date(),
        remarks,
      },
    },
  );
  await writeAudit(user, decision === "approved" ? "approved refund" : "rejected refund", `${refund.refundNo} (₹${refund.amount})`);
  return { ok: true, message: decision === "approved" ? "Refund approved — ready to process." : "Refund rejected." };
}

export async function processRefund(refundId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const refund = await RefundModel.findById(refundId);
  if (!refund) return { ok: false, message: "Refund not found." };
  if (refund.status !== "approved") return { ok: false, message: "Process only approved refunds." };
  await RefundModel.updateOne(
    { _id: refund._id },
    { $set: { status: "processed", decidedBy: new mongoose.Types.ObjectId(user.id), decidedAt: new Date() } },
  );
  await PaymentModel.updateOne({ _id: refund.paymentId }, { $set: { status: "refunded", refundId: refund._id } });
  if (refund.invoiceId) {
    const invoice = await InvoiceModel.findById(refund.invoiceId);
    if (invoice) {
      const back = Math.min(refund.amount, invoice.paid);
      await InvoiceModel.updateOne({ _id: invoice._id }, { $inc: { paid: -back } });
    }
  }
  await writeAudit(user, "processed refund", `${refund.refundNo} (₹${refund.amount})`);
  return { ok: true, message: "Refund processed; payment marked refunded." };
}

export async function completeRefund(refundId: string): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const refund = await RefundModel.findById(refundId);
  if (!refund) return { ok: false, message: "Refund not found." };
  if (refund.status !== "processed") return { ok: false, message: "Only processed refunds can be completed." };
  await RefundModel.updateOne(
    { _id: refund._id },
    { $set: { status: "completed", decidedAt: new Date() } },
  );
  await writeAudit(user, "completed refund", `${refund.refundNo} (₹${refund.amount})`);
  return { ok: true, message: "Refund marked completed." };
}

/* ------------------------------------------------------------------ */
/* Waivers                                                             */
/* ------------------------------------------------------------------ */

export type WaiverRow = {
  id: string;
  waiverNo: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  amount: number;
  reason: string;
  status: WaiverStatus;
  requestedByName: string;
  decidedByName: string;
  decidedAt: string | null;
  remarks: string;
};

export async function getWaivers(): Promise<{ stats: { pending: number; approved: number; total: number }; waivers: WaiverRow[] }> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const [waivers, users] = await Promise.all([
    WaiverModel.find().sort({ createdAt: -1 }).lean(),
    UserModel.find().lean(),
  ]);
  const userName = new Map(users.map((u) => [String(u._id), u.name]));
  const rows: WaiverRow[] = waivers.map((w) => ({
    id: String(w._id),
    waiverNo: w.waiverNo,
    studentId: String(w.studentId),
    studentName: userName.get(String(w.studentId)) ?? "Unknown",
    invoiceId: w.invoiceId ? String(w.invoiceId) : "",
    amount: w.amount,
    reason: w.reason,
    status: w.status,
    requestedByName: userName.get(String(w.requestedBy)) ?? "Unknown",
    decidedByName: w.decidedBy ? userName.get(String(w.decidedBy)) ?? "-" : "-",
    decidedAt: w.decidedAt ? fmtDay(w.decidedAt) : null,
    remarks: w.remarks ?? "",
  }));
  return {
    stats: {
      pending: rows.filter((r) => r.status === "pending").length,
      approved: rows.filter((r) => r.status === "approved").length,
      total: rows.length,
    },
    waivers: rows,
  };
}

export async function createWaiver(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = WaiverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid waiver details." };
  await connectDB();
  const student = await UserModel.findOne({ _id: parsed.data.studentId, role: "student" }).lean();
  if (!student) return { ok: false, message: "Select a valid student." };
  // Oldest invoice that still has a balance; a waiver can't exceed what is owed on it.
  const openInvoice = await InvoiceModel.findOne({
    studentId: student._id,
    $expr: { $gt: ["$total", { $add: ["$paid", "$waived"] }] },
  })
    .sort({ dueDate: 1 })
    .lean();
  if (!openInvoice) return { ok: false, message: `${student.name} has no outstanding balance to waive.` };
  const balance = invoiceBalance(openInvoice);
  if (parsed.data.amount > balance) {
    return { ok: false, message: `Waiver cannot exceed the balance on ${openInvoice.invoiceNo} (₹${balance.toLocaleString("en-IN")}).` };
  }
  const waiverNo = await nextDocNo(WaiverModel, "waiverNo", `WAV-${year()}-`, 5);
  await WaiverModel.create({
    waiverNo,
    studentId: student._id,
    invoiceId: openInvoice._id,
    amount: parsed.data.amount,
    reason: parsed.data.reason,
    status: "pending",
    requestedBy: new mongoose.Types.ObjectId(user.id),
  });
  await writeAudit(user, "requested waiver", `${waiverNo} — ${student.name} (₹${parsed.data.amount})`);
  return { ok: true, message: "Waiver requested for approval." };
}

export async function decideWaiver(
  waiverId: string,
  decision: "approved" | "rejected",
  remarks: string,
): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["admin"]);
  await connectDB();
  const waiver = await WaiverModel.findById(waiverId);
  if (!waiver) return { ok: false, message: "Waiver not found." };
  if (waiver.status !== "pending") return { ok: false, message: "Only pending waivers can be decided." };
  if (decision === "approved" && waiver.invoiceId) {
    // Apply first, atomically capped: paid + waived can never pass the total
    // (another payment or waiver may have landed since the request).
    const applied = await InvoiceModel.updateOne(
      { _id: waiver.invoiceId, $expr: { $lte: [{ $add: ["$paid", "$waived", waiver.amount] }, "$total"] } },
      { $inc: { waived: waiver.amount } },
    );
    if (applied.modifiedCount === 0) {
      return { ok: false, message: "The invoice balance is now lower than this waiver — reject it and raise a smaller one." };
    }
  }
  await WaiverModel.updateOne(
    { _id: waiver._id },
    {
      $set: {
        status: decision,
        decidedBy: new mongoose.Types.ObjectId(user.id),
        decidedAt: new Date(),
        remarks,
      },
    },
  );
  const sName = await studentName(waiver.studentId);
  await writeAudit(user, decision === "approved" ? "approved waiver" : "rejected waiver", `${waiver.waiverNo} — ${sName} (₹${waiver.amount})`);
  return { ok: true, message: decision === "approved" ? "Waiver approved and applied to the invoice." : "Waiver rejected." };
}

async function studentName(id: mongoose.Types.ObjectId): Promise<string> {
  const student = await UserModel.findById(id).select("name").lean();
  return student?.name ?? "";
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

export type OverviewData = {
  collected: number;
  outstanding: number;
  overdueStudents: number;
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  refundsProcessed: number;
  waiversApproved: number;
  collectionRate: number;
  latestPayments: PaymentRow[];
  expenseByCategory: { name: string; count: number; amount: number }[];
  monthlyCollected: { label: string; amount: number }[];
};

export async function getFinanceOverview(): Promise<OverviewData> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  // Fee figures follow the branch switcher (through the student); expenses
  // carry no branch, so they stay institute-wide.
  const own = await studentRefFilter(await getBranchScope());
  const [invoices, payments, expenses, categories, refunds, waivers, users] = await Promise.all([
    InvoiceModel.find(own).lean(),
    PaymentModel.find(own).lean(),
    ExpenseModel.find().lean(),
    ExpenseCategoryModel.find().lean(),
    RefundModel.find(own).lean(),
    WaiverModel.find(own).lean(),
    UserModel.find({ role: "student" }).lean(),
  ]);

  const userMap = new Map(users.map((u) => [String(u._id), u.name]));
  const invoiceNoMap = new Map(invoices.map((i) => [String(i._id), i.invoiceNo]));
  const catMap = new Map(categories.map((c) => [String(c._id), c.name]));
  const now = Date.now();

  const collected = payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0);
  let outstanding = 0;
  let overdueStudents = 0;
  const overdueSet = new Set<string>();
  for (const inv of invoices) {
    const due = Math.max(0, inv.total - (inv.paid ?? 0) - (inv.waived ?? 0));
    outstanding += due;
    if (due > 0 && inv.dueDate.getTime() < now) overdueSet.add(String(inv.studentId));
  }
  overdueStudents = overdueSet.size;

  const nonVoided = expenses.filter((e) => e.status !== "voided");
  const totalExpenses = nonVoided.reduce((s, e) => s + e.amount, 0);
  const pendingExpenses = nonVoided.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const approvedExpenses = nonVoided.filter((e) => e.status === "approved").reduce((s, e) => s + e.amount, 0);

  const refundsProcessed = refunds.filter((r) => r.status === "processed" || r.status === "completed").length;
  const waiversApproved = waivers.filter((w) => w.status === "approved").length;
  const collectionRate = collected + outstanding > 0 ? Math.round((collected / (collected + outstanding)) * 100) : 100;

  const latestPayments: PaymentRow[] = payments
    .filter((p) => p.status === "success")
    .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())
    .slice(0, 5)
    .map((p) => ({
      id: String(p._id),
      receiptNo: p.receiptNo,
      studentId: String(p.studentId),
      studentName: userMap.get(String(p.studentId)) ?? "Unknown",
      invoiceNo: p.invoiceId ? invoiceNoMap.get(String(p.invoiceId)) ?? "-" : "-",
      amount: p.amount,
      gst: p.gst ?? 0,
      gatewayFee: p.gatewayFee ?? 0,
      netAmount: p.netAmount,
      mode: p.mode,
      source: p.source,
      branch: p.branch ?? "",
      status: p.status,
      recordedAt: p.recordedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    }));

  const byCat = new Map<string, { count: number; amount: number }>();
  for (const e of expenses) {
    if (e.status !== "approved") continue;
    const name = catMap.get(String(e.categoryRef)) ?? "Other";
    const cur = byCat.get(name) ?? { count: 0, amount: 0 };
    cur.count += 1;
    cur.amount += e.amount;
    byCat.set(name, cur);
  }
  const expenseByCategory = [...byCat.entries()]
    .map(([name, v]) => ({ name, count: v.count, amount: v.amount }))
    .sort((a, b) => b.amount - a.amount);

  const monthLabels = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const monthlyCollected = monthLabels.map((label) => {
    const idx = monthLabels.indexOf(label);
    const monthStart = new Date(2026, 3 + idx, 1);
    const monthEnd = new Date(2026, 4 + idx, 1);
    const amount = payments
      .filter((p) => p.status === "success" && p.recordedAt >= monthStart && p.recordedAt < monthEnd)
      .reduce((s, p) => s + p.amount, 0);
    return { label, amount };
  });

  return {
    collected,
    outstanding,
    overdueStudents,
    totalExpenses,
    pendingExpenses,
    approvedExpenses,
    refundsProcessed,
    waiversApproved,
    collectionRate,
    latestPayments,
    expenseByCategory,
    monthlyCollected,
  };
}

/* ------------------------------------------------------------------ */
/* Audit trail                                                         */
/* ------------------------------------------------------------------ */

export type AuditEntry = {
  eventNo: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  isSystem: boolean;
  createdAt: string;
};

export async function getAuditTrail(): Promise<{ stats: { total: number; admin: number; staff: number; system: number }; entries: AuditEntry[] }> {
  await requireRole(["admin"]);
  await connectDB();
  const entries = await AuditLogModel.find().sort({ createdAt: -1 }).lean();
  const rows: AuditEntry[] = entries.map((e) => ({
    eventNo: e.eventNo,
    userId: String(e.userId),
    userName: e.userName,
    userRole: e.userRole,
    action: e.action,
    target: e.target ?? "",
    isSystem: e.isSystem ?? false,
    createdAt: e.createdAt ? e.createdAt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-",
  }));
  return {
    stats: {
      total: rows.length,
      admin: rows.filter((r) => r.userRole === "admin").length,
      staff: rows.filter((r) => r.userRole === "staff").length,
      system: rows.filter((r) => r.isSystem).length,
    },
    entries: rows,
  };
}
/* ------------------------------------------------------------------ */
/* Student self-service (student portal → Fees)                        */
/* ------------------------------------------------------------------ */

export type MyFeeReceipt = {
  id: string;
  receiptNo: string;
  date: string;
  mode: string;
  amount: number;
  status: PaymentStatus;
  description: string;
};

export type MyFees = {
  total: number;
  paid: number;
  waived: number;
  outstanding: number;
  /** Outstanding balance on invoices whose due date has passed. */
  overdue: number;
  /** Earliest due date among invoices that still have a balance (ISO), if any. */
  nextDueDate: string | null;
  invoices: number;
  receipts: MyFeeReceipt[];
};

/** The signed-in student's own fee account: invoices + payment receipts. */
export async function getMyFees(): Promise<MyFees> {
  const { user } = await requireRole(["student"]);
  await connectDB();
  const studentId = new mongoose.Types.ObjectId(user.id);
  const [invoices, payments] = await Promise.all([
    InvoiceModel.find({ studentId }).sort({ dueDate: 1 }).lean(),
    PaymentModel.find({ studentId }).sort({ recordedAt: -1 }).lean(),
  ]);

  const invoiceNoById = new Map(invoices.map((inv) => [String(inv._id), inv.invoiceNo]));
  const sum = summarizeFees(invoices.map((inv) => ({ ...inv, dueDate: new Date(inv.dueDate) })));

  return {
    total: sum.total,
    paid: sum.paid,
    waived: sum.waived,
    outstanding: sum.outstanding,
    overdue: sum.overdue,
    nextDueDate: sum.nextDueDate ? sum.nextDueDate.toISOString() : null,
    invoices: invoices.length,
    receipts: payments.map((p) => {
      const invNo = p.invoiceId ? invoiceNoById.get(String(p.invoiceId)) : undefined;
      return {
        id: String(p._id),
        receiptNo: p.receiptNo,
        date: new Date(p.recordedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        mode: p.mode,
        amount: p.amount,
        status: p.status,
        description: invNo ? `Fee payment towards ${invNo}` : "Fee payment",
      };
    }),
  };
}

/**
 * Student pays (part of) their own dues from the portal. The gateway is
 * simulated in the POC, but the payment is real: it is applied to the
 * student's oldest invoice with a balance, recorded with source "Student
 * Portal", and audit-logged — so it shows up in admin Finance immediately.
 *
 * With no payment gateway, that means a student could mark their own fees
 * paid, so outside DEMO_MODE (a real institute) it is refused until a
 * gateway (e.g. Razorpay) confirms the money.
 */
export async function payMyInvoice(input: unknown): Promise<{ ok: boolean; message: string }> {
  const { user } = await requireRole(["student"]);
  if (!isDemoMode()) {
    return { ok: false, message: "Online payment isn't enabled yet. Please pay at the institute office; your fees update as soon as it is recorded." };
  }
  const parsed = StudentPaymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid payment." };
  const { amount, mode } = parsed.data;

  await connectDB();
  const studentId = new mongoose.Types.ObjectId(user.id);
  const student = await UserModel.findOne({ _id: studentId, role: "student" }).select("name branch").lean();
  if (!student) return { ok: false, message: "Student record not found." };

  const invoices = await InvoiceModel.find({ studentId }).sort({ dueDate: 1 }).lean();
  const target = invoices.find((i) => i.total - i.paid - i.waived > 0);
  if (!target) return { ok: false, message: "You have no outstanding dues." };
  const balance = target.total - target.paid - target.waived;
  if (amount > balance) {
    return { ok: false, message: `Maximum payable on ${target.invoiceNo} is ₹${balance.toLocaleString("en-IN")}.` };
  }

  // Conditional increment: never let concurrent payments push paid past total.
  const applied = await InvoiceModel.updateOne(
    { _id: target._id, studentId, $expr: { $lte: [{ $add: ["$paid", "$waived", amount] }, "$total"] } },
    { $inc: { paid: amount } },
  );
  if (applied.modifiedCount === 0) {
    return { ok: false, message: "Your balance changed — refresh and try again." };
  }

  const now = new Date();
  const receiptNo = await nextDocNo(PaymentModel, "receiptNo", `RCP-${now.getFullYear()}${pad(now.getMonth() + 1, 2)}-`, 4);
  await PaymentModel.create({
    receiptNo,
    studentId,
    invoiceId: target._id,
    amount,
    gst: 0,
    gatewayFee: 0,
    netAmount: amount,
    mode,
    source: "Student Portal",
    branch: student.branch ?? "",
    status: "success",
    recordedBy: studentId,
    recordedAt: now,
  });
  await writeAudit(user, "student portal payment", `${receiptNo} — ${student.name} (₹${amount}) → ${target.invoiceNo}`);
  return { ok: true, message: `Payment successful (${receiptNo}).` };
}

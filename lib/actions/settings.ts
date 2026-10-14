"use server";

/**
 * Settings (admin-only): institute profile used on invoices, GST rules, and
 * the admin's own sign-in sessions. Also the printable-invoice data, which
 * staff may read too (Finance is shared).
 */

import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { getInstitute, defaultTaxRule, inclusiveGst, type InstituteProfile } from "@/lib/institute";
import { InstituteSettingsModel } from "@/lib/models/InstituteSettings";
import { SessionModel } from "@/lib/models/Session";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { UserModel } from "@/lib/models/User";
import { InstituteProfileSchema, TaxRulesSchema } from "@/lib/validation";
import { MAX_ATTEMPTS, WINDOW_MS, LOCK_MS } from "@/lib/rate-limit";

export async function getInstituteSettings(): Promise<InstituteProfile> {
  await requireRole(["admin"]);
  return getInstitute();
}

export type SettingsOutcome = { ok: boolean; message: string };

export async function saveInstituteProfile(input: unknown): Promise<SettingsOutcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = InstituteProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  await connectDB();
  await InstituteSettingsModel.updateOne({ key: "institute" }, { $set: parsed.data, $setOnInsert: { key: "institute" } }, { upsert: true });
  await writeAudit(user, "updated institute profile", parsed.data.name);
  return { ok: true, message: "Institute profile saved — it now appears on printed invoices." };
}

/** Replace the GST rules; exactly one may be the default for new invoices. */
export async function saveTaxRules(input: unknown): Promise<SettingsOutcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = TaxRulesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid tax rules." };
  const rules = parsed.data.rules.map((r) => ({ ...r, id: r.id || randomUUID() }));
  const defaultIdx = parsed.data.defaultIndex;
  const defaultTaxRuleId = defaultIdx !== null && rules[defaultIdx] ? rules[defaultIdx].id : "";
  await connectDB();
  await InstituteSettingsModel.updateOne(
    { key: "institute" },
    { $set: { taxRules: rules, defaultTaxRuleId }, $setOnInsert: { key: "institute" } },
    { upsert: true },
  );
  await writeAudit(user, "updated tax rules", rules.map((r) => `${r.name} ${r.rate}%`).join(", ") || "none");
  return { ok: true, message: "Tax rules saved." };
}

export type MySession = { sessionId: string; browser: string; os: string; ip: string; startedAt: string; lastSeenAt: string; current: boolean };

/** Security page: the admin's own active sign-ins + the login policy in force. */
export async function getMySecurity(): Promise<{ sessions: MySession[]; policy: { maxAttempts: number; windowMinutes: number; lockMinutes: number; sessionDays: number } }> {
  const { user } = await requireRole(["admin"]);
  const current = (await auth())?.user?.sessionId;
  await connectDB();
  const rows = await SessionModel.find({ userId: new mongoose.Types.ObjectId(user.id), active: true, expiresAt: { $gt: new Date() } })
    .sort({ startedAt: -1 })
    .lean();
  return {
    sessions: rows.map((s) => ({
      sessionId: s.sessionId,
      browser: s.device?.browser ?? "—",
      os: s.device?.os ?? "—",
      ip: s.ip || "local",
      startedAt: s.startedAt.toISOString(),
      lastSeenAt: s.lastSeenAt.toISOString(),
      current: s.sessionId === current,
    })),
    policy: { maxAttempts: MAX_ATTEMPTS, windowMinutes: WINDOW_MS / 60000, lockMinutes: LOCK_MS / 60000, sessionDays: 7 },
  };
}

export async function signOutMyOtherSessions(): Promise<SettingsOutcome> {
  const { user } = await requireRole(["admin"]);
  const current = (await auth())?.user?.sessionId;
  await connectDB();
  const res = await SessionModel.updateMany(
    { userId: new mongoose.Types.ObjectId(user.id), active: true, sessionId: { $ne: current } },
    { $set: { active: false } },
  );
  await writeAudit(user, "signed out own other sessions", `${res.modifiedCount} session(s)`);
  return { ok: true, message: `Signed out ${res.modifiedCount} other session(s).` };
}

export type InvoicePrint = {
  institute: InstituteProfile;
  invoice: { invoiceNo: string; issueDate: string; dueDate: string; course: string; batch: string; total: number; paid: number; waived: number; balance: number; notes: string };
  student: { name: string; admissionNo: string; email: string; phone: string; address: string };
  gst: { rate: number; amount: number; taxable: number; hsn: string; label: string } | null;
  payments: { receiptNo: string; date: string; mode: string; amount: number; status: string }[];
};

/** Everything needed to print one invoice (admin + staff). */
export async function getInvoicePrint(invoiceId: string): Promise<InvoicePrint | null> {
  await requireRole(["admin", "staff"]);
  if (!mongoose.isValidObjectId(invoiceId)) return null;
  await connectDB();
  const inv = await InvoiceModel.findById(invoiceId).lean();
  if (!inv) return null;
  const [student, payments, institute] = await Promise.all([
    UserModel.findById(inv.studentId).select("name admissionNo email phone address").lean(),
    PaymentModel.find({ invoiceId: inv._id }).sort({ recordedAt: 1 }).lean(),
    getInstitute(),
  ]);
  // GST recorded on the invoice wins; older invoices fall back to the default rule.
  const rule = defaultTaxRule(institute);
  const amount = inv.taxGst > 0 ? inv.taxGst : rule ? inclusiveGst(inv.total, rule.rate) : 0;
  const rate = inv.taxGst > 0 && inv.total > inv.taxGst ? Math.round((inv.taxGst / (inv.total - inv.taxGst)) * 100) : rule?.rate ?? 0;
  const fmt = (d: Date) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return {
    institute,
    invoice: {
      invoiceNo: inv.invoiceNo,
      issueDate: fmt(inv.issueDate),
      dueDate: fmt(inv.dueDate),
      course: inv.course,
      batch: inv.batch,
      total: inv.total,
      paid: inv.paid,
      waived: inv.waived,
      balance: Math.max(0, inv.total - inv.paid - inv.waived),
      notes: inv.notes ?? "",
    },
    student: {
      name: student?.name ?? "—",
      admissionNo: student?.admissionNo ?? "—",
      email: student?.email ?? "",
      phone: student?.phone ?? "",
      address: [student?.address?.street, student?.address?.city, student?.address?.state, student?.address?.pincode].filter(Boolean).join(", "),
    },
    gst: amount > 0 ? { rate, amount, taxable: inv.total - amount, hsn: rule?.hsn ?? "", label: rule?.name ?? "GST" } : null,
    payments: payments.map((p) => ({ receiptNo: p.receiptNo, date: fmt(p.recordedAt), mode: p.mode, amount: p.amount, status: p.status })),
  };
}

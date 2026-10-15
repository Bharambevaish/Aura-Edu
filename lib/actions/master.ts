"use server";

/**
 * Master Data Center — lookup lists that feed real pickers (lib/master.ts),
 * plus a read-only view of the live reference data managed elsewhere.
 * Editing is admin-only; reading active lookups is open to admin and staff.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { MASTER_META, MASTER_TYPES, type MasterType } from "@/lib/master";
import { MasterItemModel, type MasterItemDoc } from "@/lib/models/MasterItem";
import { UserModel } from "@/lib/models/User";
import { LeadModel } from "@/lib/models/Lead";
import { CourseModel } from "@/lib/models/Course";
import { BatchModel } from "@/lib/models/Batch";
import { ExpenseCategoryModel } from "@/lib/models/ExpenseCategory";
import { ExpenseModel } from "@/lib/models/Expense";
import { MasterItemSchema } from "@/lib/validation";

export type MasterRow = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  usage: number;
  createdByName: string;
  createdAt: string;
};

type Outcome = { ok: boolean; message: string };
type ItemLean = MasterItemDoc & { _id: mongoose.Types.ObjectId };
type Count = { _id: string; n: number };

/** Where each lookup's value is stored, for usage counts and rename cascades. */
const USAGE: Record<MasterType, { model: "user" | "lead"; field: string; filter: Record<string, unknown> }> = {
  department: { model: "user", field: "department", filter: { role: { $in: ["admin", "staff"] } } },
  designation: { model: "user", field: "designation", filter: { role: { $in: ["admin", "staff"] } } },
  id_proof: { model: "user", field: "idProofType", filter: { role: "student" } },
  lost_reason: { model: "lead", field: "lostReason", filter: {} },
};

async function usageCounts(type: MasterType): Promise<Map<string, number>> {
  const u = USAGE[type];
  const pipeline = [
    { $match: { ...u.filter, [u.field]: { $type: "string", $ne: "" } } },
    { $group: { _id: `$${u.field}`, n: { $sum: 1 } } },
  ];
  const rows = u.model === "user" ? await UserModel.aggregate<Count>(pipeline) : await LeadModel.aggregate<Count>(pipeline);
  return new Map(rows.map((r) => [r._id, r.n]));
}

async function renameUsage(type: MasterType, from: string, to: string): Promise<number> {
  const u = USAGE[type];
  const filter = { ...u.filter, [u.field]: from };
  const update = { $set: { [u.field]: to } };
  const res = u.model === "user" ? await UserModel.updateMany(filter, update) : await LeadModel.updateMany(filter, update);
  return res.modifiedCount;
}

/** Fill a list with its defaults the first time it is read. */
async function ensureMasterDefaults(): Promise<void> {
  await connectDB();
  for (const type of MASTER_TYPES) {
    if (await MasterItemModel.exists({ type })) continue;
    await MasterItemModel.insertMany(
      MASTER_META[type].defaults.map((name) => ({ type, name })),
      { ordered: false },
    ).catch(() => undefined);
  }
}

export async function getMasterItems(type: MasterType): Promise<MasterRow[]> {
  await requireRole(["admin"]);
  if (!MASTER_TYPES.includes(type)) return [];
  await ensureMasterDefaults();
  const [items, usage] = await Promise.all([
    MasterItemModel.find({ type }).sort({ active: -1, name: 1 }).lean<ItemLean[]>(),
    usageCounts(type),
  ]);
  return items.map((i) => ({
    id: String(i._id),
    name: i.name,
    description: i.description,
    active: i.active,
    usage: usage.get(i.name) ?? 0,
    createdByName: i.createdByName,
    createdAt: new Date(i.createdAt).toISOString(),
  }));
}

/** Active names per list — for pickers used by admin and staff. */
export async function getLookups(): Promise<Record<MasterType, string[]>> {
  await requireRole(["admin", "staff"]);
  await ensureMasterDefaults();
  const items = await MasterItemModel.find({ active: true }).select("type name").sort({ name: 1 }).lean<ItemLean[]>();
  const out = Object.fromEntries(MASTER_TYPES.map((t) => [t, [] as string[]])) as Record<MasterType, string[]>;
  for (const i of items) out[i.type].push(i.name);
  return out;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function saveMasterItem(id: string | null, input: unknown): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = MasterItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid entry." };
  const { type, name, description, active } = parsed.data;
  const label = MASTER_META[type].label;
  await connectDB();

  const dup = await MasterItemModel.findOne({ type, name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } }).lean<ItemLean>();
  if (dup && String(dup._id) !== id) return { ok: false, message: `“${name}” already exists in ${label}.` };

  if (!id) {
    await MasterItemModel.create({ type, name, description, active, createdByName: user.name });
    await writeAudit(user, `added ${label} entry`, name);
    return { ok: true, message: `Added “${name}”.` };
  }

  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Entry not found." };
  const item = await MasterItemModel.findById(id);
  if (!item || item.type !== type) return { ok: false, message: "Entry not found." };
  const oldName = item.name;
  item.name = name;
  item.description = description;
  item.active = active;
  await item.save();

  const renamed = oldName !== name ? await renameUsage(type, oldName, name) : 0;
  await writeAudit(user, `updated ${label} entry`, oldName === name ? name : `${oldName} → ${name}`);
  return { ok: true, message: renamed ? `Saved — ${renamed} record(s) now show “${name}”.` : `Saved “${name}”.` };
}

export async function deleteMasterItem(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Entry not found." };
  await connectDB();
  const item = await MasterItemModel.findById(id).lean<ItemLean>();
  if (!item) return { ok: false, message: "Entry not found." };
  const used = (await usageCounts(item.type)).get(item.name) ?? 0;
  if (used > 0) return { ok: false, message: `“${item.name}” is used by ${used} record(s) — deactivate it instead.` };
  await MasterItemModel.deleteOne({ _id: item._id });
  await writeAudit(user, `deleted ${MASTER_META[item.type].label} entry`, item.name);
  return { ok: true, message: `Deleted “${item.name}”.` };
}

export type LiveLookup = { label: string; managedAt: string; href: string; unit: string; values: { name: string; count: number }[] };

/** Reference data owned by other modules — shown read-only with usage. */
export async function getLiveLookups(): Promise<LiveLookup[]> {
  await requireRole(["admin"]);
  await connectDB();
  const students = { role: "student" };
  const [courses, batches, categories, byCourse, byBatch, byBranch, byCategory, bySource] = await Promise.all([
    CourseModel.find().select("title").sort({ title: 1 }).lean<{ title: string }[]>(),
    BatchModel.find().select("name").sort({ name: 1 }).lean<{ name: string }[]>(),
    ExpenseCategoryModel.find().select("name").sort({ name: 1 }).lean<{ _id: mongoose.Types.ObjectId; name: string }[]>(),
    UserModel.aggregate<Count>([{ $match: students }, { $group: { _id: "$course", n: { $sum: 1 } } }]),
    UserModel.aggregate<Count>([{ $match: students }, { $group: { _id: "$batch", n: { $sum: 1 } } }]),
    UserModel.aggregate<Count>([{ $match: { ...students, branch: { $nin: [null, ""] } } }, { $group: { _id: "$branch", n: { $sum: 1 } } }]),
    ExpenseModel.aggregate<Count>([{ $group: { _id: { $toString: "$categoryRef" }, n: { $sum: 1 } } }]),
    LeadModel.aggregate<Count>([{ $group: { _id: "$source", n: { $sum: 1 } } }]),
  ]);
  const map = (rows: Count[]) => new Map(rows.map((r) => [String(r._id), r.n]));
  const course = map(byCourse);
  const batch = map(byBatch);
  const category = map(byCategory);
  const source = map(bySource);
  const sourceLabels: Record<string, string> = {
    web_register: "Online admission",
    walk_in: "Walk-in",
    phone: "Phone",
    referral: "Referral",
    campaign: "Campaign",
    other: "Other",
  };
  return [
    { label: "Courses", managedAt: "LMS → Courses", href: "/admin-dashboard/lms/courses", unit: "students", values: courses.map((c) => ({ name: c.title, count: course.get(c.title) ?? 0 })) },
    { label: "Batches", managedAt: "Student Corner → Batches", href: "/admin-dashboard/lms/students/batches", unit: "students", values: batches.map((b) => ({ name: b.name, count: batch.get(b.name) ?? 0 })) },
    { label: "Branches", managedAt: "Settings → Branches", href: "/admin-dashboard/settings/config/branch", unit: "students", values: byBranch.map((b) => ({ name: String(b._id), count: b.n })).sort((a, b) => a.name.localeCompare(b.name)) },
    { label: "Expense categories", managedAt: "Finance → Expense Categories", href: "/admin-dashboard/finance/expense-categories", unit: "expenses", values: categories.map((c) => ({ name: c.name, count: category.get(String(c._id)) ?? 0 })) },
    { label: "Lead sources (fixed)", managedAt: "Leads", href: "/admin-dashboard/lms/leads", unit: "leads", values: Object.entries(sourceLabels).map(([k, name]) => ({ name, count: source.get(k) ?? 0 })) },
  ];
}

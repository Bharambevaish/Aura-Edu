"use server";

/**
 * Multi-branch — the institute's centres (Settings → Branches) and the
 * header's branch switcher. Editing is admin-only; reading active branches and
 * switching the viewed branch is open to admin and staff.
 *
 * Students, invoices, payments and leads store the branch by name, so a rename
 * cascades to them; a branch in use can only be deactivated.
 */

import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { writeAudit } from "@/lib/audit";
import { BRANCH_COOKIE, ensureBranches } from "@/lib/branch-scope";
import { BranchModel, type BranchDoc } from "@/lib/models/Branch";
import { UserModel } from "@/lib/models/User";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { LeadModel } from "@/lib/models/Lead";
import { BranchSchema } from "@/lib/validation";

export type BranchRow = {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
  students: number;
  activeStudents: number;
  createdByName: string;
  createdAt: string;
};

type Outcome = { ok: boolean; message: string };
type BranchLean = BranchDoc & { _id: mongoose.Types.ObjectId };
type Count = { _id: string; n: number; active: number };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function studentCounts(): Promise<Map<string, Count>> {
  const rows = await UserModel.aggregate<Count>([
    { $match: { role: "student", branch: { $type: "string", $ne: "" } } },
    { $group: { _id: "$branch", n: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } } } },
  ]);
  return new Map(rows.map((r) => [r._id, r]));
}

/** Every branch with its student counts (Settings → Branches). */
export async function getBranches(): Promise<BranchRow[]> {
  await requireRole(["admin", "staff"]);
  await ensureBranches();
  const [branches, counts] = await Promise.all([
    BranchModel.find().sort({ active: -1, name: 1 }).lean<BranchLean[]>(),
    studentCounts(),
  ]);
  return branches.map((b) => ({
    id: String(b._id),
    name: b.name,
    code: b.code,
    address: b.address,
    city: b.city,
    phone: b.phone,
    active: b.active,
    students: counts.get(b.name)?.n ?? 0,
    activeStudents: counts.get(b.name)?.active ?? 0,
    createdByName: b.createdByName,
    createdAt: new Date(b.createdAt).toISOString(),
  }));
}

/** Active branch names — for the header switcher and student branch pickers. */
export async function getActiveBranchNames(): Promise<string[]> {
  await requireRole(["admin", "staff"]);
  await ensureBranches();
  const rows = await BranchModel.find({ active: true }).select("name").sort({ name: 1 }).lean<BranchLean[]>();
  return rows.map((b) => b.name);
}

export async function saveBranch(id: string | null, input: unknown): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  const parsed = BranchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid branch." };
  const data = parsed.data;
  await connectDB();

  const [dupName, dupCode] = await Promise.all([
    BranchModel.findOne({ name: { $regex: `^${escapeRegex(data.name)}$`, $options: "i" } }).lean<BranchLean>(),
    BranchModel.findOne({ code: data.code }).lean<BranchLean>(),
  ]);
  if (dupName && String(dupName._id) !== id) return { ok: false, message: `A branch named “${data.name}” already exists.` };
  if (dupCode && String(dupCode._id) !== id) return { ok: false, message: `Code ${data.code} is already used by ${dupCode.name}.` };

  if (!id) {
    await BranchModel.create({ ...data, createdByName: user.name });
    await writeAudit(user, "added branch", `${data.name} (${data.code})`);
    return { ok: true, message: `Added “${data.name}”.` };
  }

  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Branch not found." };
  const branch = await BranchModel.findById(id);
  if (!branch) return { ok: false, message: "Branch not found." };
  const oldName = branch.name;
  Object.assign(branch, data);
  await branch.save();

  let renamed = 0;
  if (oldName !== data.name) {
    const [students] = await Promise.all([
      UserModel.updateMany({ role: "student", branch: oldName }, { $set: { branch: data.name } }),
      InvoiceModel.updateMany({ branch: oldName }, { $set: { branch: data.name } }),
      PaymentModel.updateMany({ branch: oldName }, { $set: { branch: data.name } }),
      LeadModel.updateMany({ branch: oldName }, { $set: { branch: data.name } }),
    ]);
    renamed = students.modifiedCount;
    // Keep the switcher on the renamed branch for whoever renamed it.
    const jar = await cookies();
    if (jar.get(BRANCH_COOKIE)?.value && decodeURIComponent(jar.get(BRANCH_COOKIE)!.value) === oldName) {
      jar.set(BRANCH_COOKIE, encodeURIComponent(data.name), cookieOptions());
    }
  }
  await writeAudit(user, "updated branch", oldName === data.name ? data.name : `${oldName} → ${data.name}`);
  return { ok: true, message: renamed ? `Saved — ${renamed} student(s) moved to “${data.name}”.` : `Saved “${data.name}”.` };
}

export async function deleteBranch(id: string): Promise<Outcome> {
  const { user } = await requireRole(["admin"]);
  if (!mongoose.isValidObjectId(id)) return { ok: false, message: "Branch not found." };
  await connectDB();
  const branch = await BranchModel.findById(id).lean<BranchLean>();
  if (!branch) return { ok: false, message: "Branch not found." };
  const [students, invoices, payments] = await Promise.all([
    UserModel.countDocuments({ role: "student", branch: branch.name }),
    InvoiceModel.countDocuments({ branch: branch.name }),
    PaymentModel.countDocuments({ branch: branch.name }),
  ]);
  const used = students + invoices + payments;
  if (used > 0) return { ok: false, message: `“${branch.name}” has ${students} student(s) and ${invoices + payments} fee record(s) — deactivate it instead.` };
  await BranchModel.deleteOne({ _id: branch._id });
  await writeAudit(user, "deleted branch", `${branch.name} (${branch.code})`);
  return { ok: true, message: `Deleted “${branch.name}”.` };
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  };
}

/** Header switcher: view one branch, or every branch when `name` is null. */
export async function setBranchScope(name: string | null): Promise<Outcome> {
  await requireRole(["admin", "staff"]);
  const jar = await cookies();
  if (!name) {
    jar.delete(BRANCH_COOKIE);
    return { ok: true, message: "Showing all branches." };
  }
  await connectDB();
  const branch = await BranchModel.findOne({ name, active: true }).lean<BranchLean>();
  if (!branch) return { ok: false, message: "That branch is not available." };
  jar.set(BRANCH_COOKIE, encodeURIComponent(branch.name), cookieOptions());
  return { ok: true, message: `Showing ${branch.name}.` };
}

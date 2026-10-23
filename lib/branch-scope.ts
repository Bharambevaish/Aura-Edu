/**
 * Multi-branch scoping (server-only). The admin header's branch switcher
 * stores the chosen branch name in a cookie; data actions call
 * getBranchScope() and merge the returned filter fragment into their queries.
 * An unknown or inactive branch in the cookie falls back to "All branches".
 */
import "server-only";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { BranchModel } from "@/lib/models/Branch";
import { UserModel } from "@/lib/models/User";

export const BRANCH_COOKIE = "auraedu_branch";

export type BranchScope = {
  /** Selected branch name, or null for "All branches". */
  branch: string | null;
  /** Fragment for queries on student users (`{ branch }` or `{}`). */
  students: Record<string, unknown>;
};

/**
 * A database seeded before branches existed has none: create them once from
 * the branch names already stored on students, so nothing is orphaned.
 */
export async function ensureBranches(): Promise<void> {
  await connectDB();
  if (await BranchModel.exists({})) return;
  const names = (await UserModel.distinct<string>("branch", { role: "student", branch: { $type: "string", $ne: "" } })).sort();
  if (names.length === 0) return;
  await BranchModel.insertMany(
    names.map((name, i) => ({ name, code: `BR-${String(i + 1).padStart(2, "0")}` })),
    { ordered: false },
  ).catch(() => undefined);
}

/** The branch the signed-in user is viewing, validated against active branches. */
export async function getBranchScope(): Promise<BranchScope> {
  const raw = (await cookies()).get(BRANCH_COOKIE)?.value;
  const name = raw ? decodeURIComponent(raw).trim() : "";
  if (!name) return { branch: null, students: {} };
  await connectDB();
  const exists = await BranchModel.exists({ name, active: true });
  if (!exists) return { branch: null, students: {} };
  return { branch: name, students: { branch: name } };
}

/**
 * Leads: the branch's own plus unassigned ones (no branch yet), so a new
 * enquiry never disappears from a branch view.
 */
export function leadBranchFilter(scope: BranchScope): Record<string, unknown> {
  return scope.branch ? { branch: { $in: [scope.branch, "", null] } } : {};
}

/**
 * Expenses: only the branch's own. Institute-wide expenses (no branch, e.g.
 * head-office rent) appear under "All branches" only, so they are never
 * counted once per branch.
 */
export function expenseBranchFilter(scope: BranchScope): Record<string, unknown> {
  return scope.branch ? { branch: scope.branch } : {};
}

/** Ids of the students in the selected branch, or null for all branches. */
export async function scopedStudentIds(scope: BranchScope): Promise<mongoose.Types.ObjectId[] | null> {
  if (!scope.branch) return null;
  const rows = await UserModel.find({ role: "student", branch: scope.branch }).select("_id").lean<{ _id: mongoose.Types.ObjectId }[]>();
  return rows.map((r) => r._id);
}

/**
 * Fragment for records owned by a student (invoices, payments, refunds,
 * results…): scoped through the student's current branch, so records follow
 * a student who moves branch. `field` is the record's student reference.
 */
export async function studentRefFilter(scope: BranchScope, field = "studentId"): Promise<Record<string, unknown>> {
  const ids = await scopedStudentIds(scope);
  return ids ? { [field]: { $in: ids } } : {};
}

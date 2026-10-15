/**
 * Sequential document numbers (INV-2026-00012, RCP-202610-0003, LD-2026-0042…).
 *
 * The next number follows the highest one already issued with the same prefix,
 * so deleting a document never makes a number repeat (counting documents did,
 * and the unique index then rejected the save). Prefixes carry the current
 * year/month, so each period starts again at 1.
 */
import type { Model, QueryFilter } from "mongoose";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Pure: the number after `last` (or the first one), never below `start`. */
export function nextInSequence(last: string | null, prefix: string, width: number, start = 1): string {
  const n = last && last.startsWith(prefix) ? Number(last.slice(prefix.length)) : 0;
  return `${prefix}${String(Math.max(Number.isFinite(n) ? n + 1 : 1, start)).padStart(width, "0")}`;
}

export async function nextDocNo<T>(model: Model<T>, field: keyof T & string, prefix: string, width: number, start = 1): Promise<string> {
  // Fixed width, so the highest string is the highest number.
  const last = await model
    .findOne({ [field]: { $regex: `^${escapeRegex(prefix)}\\d{${width}}$` } } as QueryFilter<T>)
    .sort({ [field]: -1 })
    .select(field)
    .lean<Record<string, unknown>>();
  return nextInSequence(last ? String(last[field]) : null, prefix, width, start);
}

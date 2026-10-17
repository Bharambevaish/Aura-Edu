"use server";

/**
 * Connect → Groups: a persisted group chat per batch.
 *
 * Admin/staff messages are stored as ChatMessage rows; a broadcast message is
 * also fanned out to every student's notification hub through the existing
 * `sendBatchBroadcast`. The student side of the conversation is a scripted
 * demo simulation: after a staff message the UI asks for `postScriptedReply`,
 * which picks a canned line keyed on keywords in that message and posts it as
 * a student of the batch, flagged `simulated: true`.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/dal";
import { BatchModel } from "@/lib/models/Batch";
import { UserModel } from "@/lib/models/User";
import { ChatMessageModel } from "@/lib/models/ChatMessage";
import type { ChatChannel, ChatSenderRole } from "@/lib/models/ChatMessage";
import { SendChatMessageSchema } from "@/lib/validation";
import { sendBatchBroadcast } from "@/lib/actions/connect";
import { isDemoMode } from "@/lib/demo-mode";

export type ChatMessageRow = {
  id: string;
  batch: string;
  senderName: string;
  senderRole: ChatSenderRole;
  body: string;
  channel: ChatChannel;
  broadcast: boolean;
  delivered: number;
  simulated: boolean;
  mine: boolean;
  createdAt: string;
};

type Outcome<T = unknown> = (T & { ok: true }) | { ok: false; message: string };

type ChatLean = {
  _id: mongoose.Types.ObjectId;
  batch: string;
  senderId?: mongoose.Types.ObjectId | null;
  senderName: string;
  senderRole: ChatSenderRole;
  body: string;
  channel?: ChatChannel;
  broadcast?: boolean;
  delivered?: number;
  simulated?: boolean;
  createdAt: Date;
};

const toRow = (m: ChatLean, meId: string): ChatMessageRow => ({
  id: String(m._id),
  batch: m.batch,
  senderName: m.senderName,
  senderRole: m.senderRole,
  body: m.body,
  channel: m.channel ?? "chat",
  broadcast: !!m.broadcast,
  delivered: m.delivered ?? 0,
  simulated: !!m.simulated,
  mine: !!m.senderId && String(m.senderId) === meId,
  createdAt: m.createdAt.toISOString(),
});

/** The last 200 messages of one batch's group, oldest first. */
export async function listChatMessages(batchName: string): Promise<ChatMessageRow[]> {
  const { user } = await requireRole(["admin", "staff"]);
  if (typeof batchName !== "string" || !batchName.trim()) return [];
  await connectDB();
  const rows = await ChatMessageModel.find({ batch: batchName })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<ChatLean[]>();
  return rows.reverse().map((m) => toRow(m, user.id));
}

/** Last message per batch, for the group list preview. */
export async function getChatPreviews(): Promise<Record<string, { body: string; senderName: string; createdAt: string }>> {
  await requireRole(["admin", "staff"]);
  await connectDB();
  const rows = await ChatMessageModel.aggregate<{ _id: string; body: string; senderName: string; createdAt: Date }>([
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$batch", body: { $first: "$body" }, senderName: { $first: "$senderName" }, createdAt: { $first: "$createdAt" } } },
  ]);
  return Object.fromEntries(
    rows.map((r) => [r._id, { body: r.body, senderName: r.senderName, createdAt: new Date(r.createdAt).toISOString() }]),
  );
}

/** Post an admin/staff message to a group (optionally as a hub broadcast / WhatsApp). */
export async function sendChatMessage(input: unknown): Promise<Outcome<{ message: ChatMessageRow }>> {
  const { user } = await requireRole(["admin", "staff"]);
  const parsed = SendChatMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Message is required." };
  const { batchName, body, broadcast } = parsed.data;
  const whatsapp = broadcast && parsed.data.whatsapp;
  await connectDB();

  const batch = await BatchModel.findOne({ name: batchName }).select("_id name").lean();
  if (!batch) return { ok: false, message: `Group "${batchName}" not found.` };

  let delivered = 0;
  if (broadcast) {
    const res = await sendBatchBroadcast({ batchName, message: body, category: "Announcements" });
    if (!res.ok) return res;
    delivered = res.delivered;
  }

  const doc = await ChatMessageModel.create({
    batch: batch.name,
    batchId: batch._id,
    senderId: new mongoose.Types.ObjectId(user.id),
    senderName: user.name,
    senderRole: user.role === "admin" ? "admin" : "staff",
    body,
    channel: whatsapp ? "whatsapp" : "chat",
    broadcast,
    delivered,
    simulated: false,
  });
  return { ok: true, message: toRow(doc.toObject() as ChatLean, user.id) };
}

/* --------------------------- Scripted replies -------------------------- */

const SCRIPT: { keywords: string[]; replies: string[] }[] = [
  {
    keywords: ["fee", "fees", "payment", "invoice", "due", "instalment", "installment"],
    replies: [
      "Noted, sir. Can I pay the next instalment through the student portal itself?",
      "Thank you! I'll ask my father to clear the fee by this weekend.",
      "Is there a late fee if we pay after the due date?",
    ],
  },
  {
    keywords: ["test", "exam", "mock", "quiz", "paper", "syllabus"],
    replies: [
      "Will the test cover only this week's chapters or the full unit?",
      "Thank you, ma'am. Is it negative marking like the NEET pattern?",
      "Got it. Will the answer key be shared after the test?",
    ],
  },
  {
    keywords: ["timing", "time", "schedule", "class", "reschedule", "lecture", "slot"],
    replies: [
      "Okay, noted the new timing. Will the class be in the same hall?",
      "Thanks for the update! Will the recording be available for anyone who misses it?",
      "Sure, I'll be there on time.",
    ],
  },
  {
    keywords: ["holiday", "leave", "off", "closed", "vacation", "diwali", "festival"],
    replies: [
      "Thank you for informing! Will there be any homework over the holiday?",
      "Happy holidays to all the faculty! 🎉",
      "Noted. Classes resume the day after, right?",
    ],
  },
];

const DEFAULT_REPLIES = [
  "Thank you, noted! 👍",
  "Okay sir, understood.",
  "Thanks for the update!",
  "Got it, thank you ma'am.",
];

function pickReply(text: string, seed: number): string {
  const lower = text.toLowerCase();
  const hit = SCRIPT.find((s) => s.keywords.some((k) => new RegExp(`\\b${k}`, "i").test(lower)));
  const pool = hit ? hit.replies : DEFAULT_REPLIES;
  return pool[seed % pool.length];
}

/** Whether the chat's demo simulations (scripted replies, WhatsApp preview) are on. */
export async function getChatDemoMode(): Promise<boolean> {
  await requireRole(["admin", "staff"]);
  return isDemoMode();
}

/**
 * Demo simulation: post a canned student reply to one staff message. Each
 * staff message gets at most one reply; the "student" is a real member of
 * the batch so the thread looks right, but the text is scripted.
 */
export async function postScriptedReply(messageId: string): Promise<Outcome<{ message: ChatMessageRow | null }>> {
  const { user } = await requireRole(["admin", "staff"]);
  // Never invent messages from real students on a real institute's deployment.
  if (!isDemoMode()) return { ok: true, message: null };
  if (!mongoose.isValidObjectId(messageId)) return { ok: false, message: "Message not found." };
  await connectDB();

  const original = await ChatMessageModel.findById(messageId).lean<ChatLean>();
  if (!original || original.senderRole === "student") return { ok: false, message: "Message not found." };
  if (await ChatMessageModel.exists({ replyTo: original._id })) return { ok: true, message: null };

  const students = await UserModel.find({ role: "student", batch: original.batch }).select("name").sort({ name: 1 }).lean();
  if (students.length === 0) return { ok: true, message: null };
  const seed = original._id.getTimestamp().getTime() / 1000 + original.body.length;
  const student = students[Math.floor(seed) % students.length];

  try {
    const doc = await ChatMessageModel.create({
      batch: original.batch,
      senderId: student._id,
      senderName: student.name,
      senderRole: "student",
      body: pickReply(original.body, Math.floor(seed)),
      simulated: true,
      replyTo: original._id,
    });
    return { ok: true, message: toRow(doc.toObject() as ChatLean, user.id) };
  } catch {
    // Unique index on replyTo: a concurrent call already replied.
    return { ok: true, message: null };
  }
}

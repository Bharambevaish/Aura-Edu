import mongoose from "mongoose";

/**
 * One message in a batch group chat (Connect → Groups).
 *
 * Groups are the real batches; `batch` is the batch name (the product-wide
 * string join, `User.batch === Batch.name`) and `batchId` the Batch row.
 * Admin/staff messages are real. Student messages are a scripted demo
 * simulation (`simulated: true`) — the canned reply the UI shows after a
 * staff message, labelled as such everywhere it renders.
 *
 * `channel: "whatsapp"` marks a broadcast whose delivery the UI renders as a
 * simulated WhatsApp send; no real message ever leaves the app.
 */
export type ChatSenderRole = "admin" | "staff" | "student";
export type ChatChannel = "chat" | "whatsapp";

export interface ChatMessageDoc {
  batch: string;
  batchId?: mongoose.Types.ObjectId | null;
  senderId?: mongoose.Types.ObjectId | null;
  senderName: string;
  senderRole: ChatSenderRole;
  body: string;
  channel: ChatChannel;
  /** Also fanned out to every student's notification hub. */
  broadcast: boolean;
  delivered: number;
  simulated: boolean;
  /** For a scripted reply: the staff message it answers (one reply each). */
  replyTo?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new mongoose.Schema<ChatMessageDoc>(
  {
    batch: { type: String, required: true, index: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    senderName: { type: String, required: true },
    senderRole: { type: String, enum: ["admin", "staff", "student"], required: true },
    body: { type: String, required: true },
    channel: { type: String, enum: ["chat", "whatsapp"], default: "chat" },
    broadcast: { type: Boolean, default: false },
    delivered: { type: Number, default: 0 },
    simulated: { type: Boolean, default: false },
    replyTo: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true },
);

chatMessageSchema.index({ batch: 1, createdAt: 1 });
chatMessageSchema.index({ replyTo: 1 }, { unique: true, partialFilterExpression: { replyTo: { $type: "objectId" } } });

export const ChatMessageModel =
  (mongoose.models.ChatMessage as mongoose.Model<ChatMessageDoc>) ??
  mongoose.model<ChatMessageDoc>("ChatMessage", chatMessageSchema);

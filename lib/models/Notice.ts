import mongoose from "mongoose";

/**
 * One admin-authored broadcast/announcement — the source doc behind the
 * Communications module.
 *
 * Delivery is a fan-out: posting a Notice creates one Notification row per
 * targeted user (see Notification.sourceId), so the *student hub reads the
 * exact same collection the admin writes* — no student-side code needed.
 * Delivered/read counts are derived from those rows at read time, never
 * stored.
 *
 * Audience targets users by the product-wide string join (`User.batch ===
 * Batch.name`), the same convention attendance/assignments/tests already use.
 */
export interface NoticeDoc {
  title: string;
  message: string;
  category: string;
  important: boolean;
  /** delivery rule — matches a `Notification.category` so the hub stays tidy */
  audience: {
    kind: "all" | "batches" | "staff" | "students";
    batchNames: string[];
    studentIds: mongoose.Types.ObjectId[];
  };
  sender: string;
  senderId?: mongoose.Types.ObjectId;
  pinnedAt?: Date | null;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const noticeSchema = new mongoose.Schema<NoticeDoc>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, required: true, index: true },
    important: { type: Boolean, default: false },
    audience: {
      kind: { type: String, enum: ["all", "batches", "staff", "students"], default: "all" },
      batchNames: { type: [String], default: [] },
      studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    sender: { type: String, default: "MyEdou Portal" },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pinnedAt: { type: Date, default: null },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const NoticeModel =
  (mongoose.models.Notice as mongoose.Model<NoticeDoc>) ??
  mongoose.model<NoticeDoc>("Notice", noticeSchema);
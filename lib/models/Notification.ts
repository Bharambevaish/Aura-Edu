import mongoose from "mongoose";

/**
 * Per-student push-style message (the student Notifications Hub + the
 * assignment reminder). Every notification belongs to exactly one user; the
 * "Assignments" reminder is simply a notification with `category:
 * "Assignments"` and a deep link into the worksheet.
 *
 * `ip`/`os`/`device` mirror the legacy simulated shape so the hub's Security
 * & Audit Log box keeps rendering identically.
 */
export interface NotificationDoc {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  category: string;
  sender: string;
  important: boolean;
  read: boolean;
  link: string;
  /** Back-link to the Notice that produced this row (broadcast fan-out). */
  sourceId?: mongoose.Types.ObjectId | null;
  ip: string;
  os: string;
  device: string;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<NotificationDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, required: true, index: true },
    sender: { type: String, default: "MyEdou Portal" },
    important: { type: Boolean, default: false },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, default: "" },
    sourceId: { type: mongoose.Schema.Types.ObjectId, index: true, default: null },
    ip: { type: String, default: "103.14.24.11" },
    os: { type: String, default: "Windows 11" },
    device: { type: String, default: "Desktop Chrome" },
  },
  { timestamps: true },
);

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<NotificationDoc>) ??
  mongoose.model<NotificationDoc>("Notification", notificationSchema);
import mongoose from "mongoose";

/**
 * One authenticated sign-in ("live session").
 *
 * Created at login (auth.ts authorize) and active=false when the user signs
 * out, an admin force-logs them out, or the JWT's natural expiry passes.
 * `lastSeenAt` is bumped at creation only — no heartbeat in the POC, so a
 * session is considered active until explicitly ended or `expiresAt` passes.
 *
 * The admin Student Logins tab reads this collection to render the device list
 * and "sign out all / sign out device" actions; requireRole() checks it to
 * bounce invalidated sessions on the next request.
 */
export interface SessionDeviceInfo {
  browser: string;
  os: string;
  deviceType: string;
  userAgent: string;
}

export interface SessionDoc {
  /** Unique token id carried in the JWT; the revocation key. */
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  /** Denormalized for quick admin listing. */
  email: string;
  device: SessionDeviceInfo;
  ip: string;
  active: boolean;
  startedAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
}

const sessionSchema = new mongoose.Schema<SessionDoc>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true },
    device: {
      browser: String,
      os: String,
      deviceType: String,
      userAgent: String,
    },
    ip: { type: String, default: "" },
    active: { type: Boolean, default: true },
    startedAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, active: 1 });

export const SessionModel =
  (mongoose.models.Session as mongoose.Model<SessionDoc>) ??
  mongoose.model<SessionDoc>("Session", sessionSchema);
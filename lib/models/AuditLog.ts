import mongoose from "mongoose";

/**
 * Append-only finance log. Every finance mutation writes one row via
 * writeAudit(). There is intentionally no update/delete surface.
 */
export interface AuditLogDoc {
  eventNo: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  ip: string;
  isSystem: boolean;
  createdAt: Date;
}

const auditLogSchema = new mongoose.Schema<AuditLogDoc>(
  {
    eventNo: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "System" },
    userRole: { type: String, default: "System" },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    ip: { type: String, default: "-" },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AuditLogModel =
  (mongoose.models.AuditLog as mongoose.Model<AuditLogDoc>) ??
  mongoose.model<AuditLogDoc>("AuditLog", auditLogSchema);
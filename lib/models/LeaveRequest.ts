import mongoose from "mongoose";

/**
 * A staff (or admin) leave request. `days` counts working days (Mon–Sat) in
 * the range and is fixed at request time. Approved unpaid leave feeds the
 * payroll simulator's loss-of-pay deduction.
 */
export type LeaveType = "casual" | "sick" | "earned" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequestDoc {
  userId: mongoose.Types.ObjectId;
  userName: string;
  type: LeaveType;
  from: Date;
  to: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  decidedByName: string;
  decidedAt: Date | null;
  decisionNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new mongoose.Schema<LeaveRequestDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userName: { type: String, required: true },
    type: { type: String, enum: ["casual", "sick", "earned", "unpaid"], required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    days: { type: Number, required: true, min: 0.5 },
    reason: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending", index: true },
    decidedByName: { type: String, default: "" },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export const LeaveRequestModel =
  (mongoose.models.LeaveRequest as mongoose.Model<LeaveRequestDoc>) ??
  mongoose.model<LeaveRequestDoc>("LeaveRequest", leaveRequestSchema);

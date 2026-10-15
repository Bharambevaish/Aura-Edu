import mongoose from "mongoose";

/**
 * A refund of a settled payment. Lifecycle: pending → approved → processed
 * (at "processed" the linked payment flips to refunded and the invoice paid
 * amount is reduced) → completed. Reject from pending/approved.
 */
export interface RefundDoc {
  refundNo: string;
  studentId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  method: string;
  status: "pending" | "approved" | "processed" | "completed" | "rejected";
  requestedBy: mongoose.Types.ObjectId;
  decidedBy?: mongoose.Types.ObjectId;
  decidedAt?: Date;
  remarks: string;
  createdAt: Date;
}

const refundSchema = new mongoose.Schema<RefundDoc>(
  {
    refundNo: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: undefined },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    method: { type: String, default: "Original Mode" },
    status: { type: String, enum: ["pending", "approved", "processed", "completed", "rejected"], default: "pending" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: Date,
    remarks: { type: String, default: "" },
  },
  { timestamps: true },
);

refundSchema.index({ paymentId: 1 });

export const RefundModel =
  (mongoose.models.Refund as mongoose.Model<RefundDoc>) ??
  mongoose.model<RefundDoc>("Refund", refundSchema);
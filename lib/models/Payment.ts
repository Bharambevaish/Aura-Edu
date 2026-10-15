import mongoose from "mongoose";

/**
 * A recorded student payment. Links to the invoice it settles (optional —
 * a payment can be a one-off). A processed refund flips status to "refunded".
 */
export interface PaymentDoc {
  receiptNo: string;
  studentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  gst: number;
  gatewayFee: number;
  netAmount: number;
  mode: string;
  source: string;
  branch: string;
  status: "success" | "cancelled" | "refunded";
  recordedBy: mongoose.Types.ObjectId;
  recordedAt: Date;
  refundId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new mongoose.Schema<PaymentDoc>(
  {
    receiptNo: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: undefined },
    amount: { type: Number, required: true, min: 0 },
    gst: { type: Number, default: 0, min: 0 },
    gatewayFee: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    mode: { type: String, default: "Cash" },
    source: { type: String, default: "Admin" },
    branch: { type: String, default: "" },
    status: { type: String, enum: ["success", "cancelled", "refunded"], default: "success" },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recordedAt: { type: Date, default: Date.now },
    refundId: { type: mongoose.Schema.Types.ObjectId, ref: "Refund", default: undefined },
  },
  { timestamps: true },
);

paymentSchema.index({ studentId: 1, recordedAt: -1 });
paymentSchema.index({ invoiceId: 1 });

export const PaymentModel =
  (mongoose.models.Payment as mongoose.Model<PaymentDoc>) ??
  mongoose.model<PaymentDoc>("Payment", paymentSchema);
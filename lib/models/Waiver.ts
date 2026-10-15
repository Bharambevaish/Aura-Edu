import mongoose from "mongoose";

/** A fee waiver / discount granted to a student. Approved → invoice waived. */
export interface WaiverDoc {
  waiverNo: string;
  studentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: mongoose.Types.ObjectId;
  decidedBy?: mongoose.Types.ObjectId;
  decidedAt?: Date;
  remarks: string;
  createdAt: Date;
}

const waiverSchema = new mongoose.Schema<WaiverDoc>(
  {
    waiverNo: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: undefined },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: Date,
    remarks: { type: String, default: "" },
  },
  { timestamps: true },
);

waiverSchema.index({ invoiceId: 1 });
waiverSchema.index({ studentId: 1 });

export const WaiverModel =
  (mongoose.models.Waiver as mongoose.Model<WaiverDoc>) ??
  mongoose.model<WaiverDoc>("Waiver", waiverSchema);
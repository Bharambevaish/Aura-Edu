import mongoose from "mongoose";

/**
 * A student fee invoice. `total` is the fee structure for the academic year;
 * `paid` grows with recorded payments; `waived` grows with approved waivers.
 * Due = total − paid − waived. Status is derived at read time.
 */
export interface InvoiceDoc {
  invoiceNo: string;
  studentId: mongoose.Types.ObjectId;
  course: string;
  batch: string;
  branch: string;
  total: number;
  paid: number;
  waived: number;
  taxGst: number;
  issueDate: Date;
  dueDate: Date;
  notes: string;
  createdAt: Date;
}

const invoiceSchema = new mongoose.Schema<InvoiceDoc>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: String, default: "" },
    batch: { type: String, default: "" },
    branch: { type: String, default: "" },
    total: { type: Number, required: true, min: 0 },
    paid: { type: Number, default: 0, min: 0 },
    waived: { type: Number, default: 0, min: 0 },
    taxGst: { type: Number, default: 0, min: 0 },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export const InvoiceModel =
  (mongoose.models.Invoice as mongoose.Model<InvoiceDoc>) ??
  mongoose.model<InvoiceDoc>("Invoice", invoiceSchema);
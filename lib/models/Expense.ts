import mongoose from "mongoose";

/**
 * One expense claim. Lifecycle: staff submit (pending) → admin approves /
 * rejects with a reason, or voids it after the fact. Category + vendor are
 * live refs so renames/deletes stay consistent (delete is refused while
 * referenced). `createdBy` is the submitter's User id; receipt is an optional
 * URL string for the demo (no real file uploads yet).
 */
export interface ExpenseDoc {
  refNumber: string;
  title: string;
  description: string;
  categoryRef: mongoose.Types.ObjectId;
  vendorRef?: mongoose.Types.ObjectId;
  amount: number;
  expenseDate: Date;
  paymentMethod: string;
  paymentSource: string;
  refNo: string;
  receiptUrl: string;
  internalNotes: string;
  status: "pending" | "approved" | "rejected" | "voided";
  isReimbursement: boolean;
  reimbursedTo: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectedReason?: string;
  /** Branch the spend belongs to; "" = institute-wide. */
  branch: string;
  createdAt: Date;
}

const expenseSchema = new mongoose.Schema<ExpenseDoc>(
  {
    refNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseCategory", required: true },
    vendorRef: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: undefined },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true },
    paymentMethod: { type: String, default: "Bank Transfer" },
    paymentSource: { type: String, default: "Company" },
    refNo: { type: String, default: "" },
    receiptUrl: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected", "voided"], default: "pending" },
    isReimbursement: { type: Boolean, default: false },
    reimbursedTo: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: Date,
    rejectedReason: { type: String, default: "" },
    branch: { type: String, default: "" },
  },
  { timestamps: true },
);

export const ExpenseModel =
  (mongoose.models.Expense as mongoose.Model<ExpenseDoc>) ??
  mongoose.model<ExpenseDoc>("Expense", expenseSchema);
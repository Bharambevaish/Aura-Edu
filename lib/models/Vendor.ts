import mongoose from "mongoose";

export interface VendorDoc {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  address: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branchName: string;
  isActive: boolean;
  createdAt: Date;
}

const vendorSchema = new mongoose.Schema<VendorDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    contactPerson: { type: String, default: "" },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    address: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    branchName: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const VendorModel =
  (mongoose.models.Vendor as mongoose.Model<VendorDoc>) ??
  mongoose.model<VendorDoc>("Vendor", vendorSchema);
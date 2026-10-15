import mongoose from "mongoose";

/**
 * A centre of the institute. Students (and their invoices/payments) store the
 * branch by name, so renaming a branch cascades to those records
 * (lib/actions/branches.ts) and a branch in use can only be deactivated.
 */
export interface BranchDoc {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new mongoose.Schema<BranchDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true },
    createdByName: { type: String, default: "System" },
  },
  { timestamps: true },
);

export const BranchModel =
  (mongoose.models.Branch as mongoose.Model<BranchDoc>) ?? mongoose.model<BranchDoc>("Branch", branchSchema);

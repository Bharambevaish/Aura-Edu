import mongoose from "mongoose";

/**
 * Single settings document (key "institute"): the institute profile printed
 * on invoices and certificates, the GST rules applied to new invoices, and
 * institute-wide permission switches (staffCanGrade).
 */
export interface TaxRule {
  id: string;
  name: string;
  /** Percent, e.g. 18. Fees are treated as GST-inclusive. */
  rate: number;
  hsn: string;
  description: string;
}

export interface InstituteSettingsDoc {
  key: "institute";
  name: string;
  legalName: string;
  address: string;
  gstin: string;
  pan: string;
  supportEmail: string;
  supportPhone: string;
  invoiceTerms: string;
  taxRules: TaxRule[];
  defaultTaxRuleId: string;
  /** Staff may grade written test answers (admins always can). Missing = true. */
  staffCanGrade: boolean;
  updatedAt: Date;
}

const taxRuleSchema = new mongoose.Schema<TaxRule>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    hsn: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const instituteSettingsSchema = new mongoose.Schema<InstituteSettingsDoc>(
  {
    key: { type: String, required: true, unique: true, default: "institute" },
    name: { type: String, default: "AuraEdu Institute" },
    legalName: { type: String, default: "" },
    address: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    invoiceTerms: { type: String, default: "" },
    taxRules: { type: [taxRuleSchema], default: [] },
    defaultTaxRuleId: { type: String, default: "" },
    staffCanGrade: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const InstituteSettingsModel =
  (mongoose.models.InstituteSettings as mongoose.Model<InstituteSettingsDoc>) ??
  mongoose.model<InstituteSettingsDoc>("InstituteSettings", instituteSettingsSchema);

/**
 * Read the institute settings (server-only) with safe defaults, and the GST
 * helper used when invoices are raised and printed.
 */
import "server-only";
import { connectDB } from "@/lib/db";
import { InstituteSettingsModel, type InstituteSettingsDoc, type TaxRule } from "@/lib/models/InstituteSettings";

export type InstituteProfile = Omit<InstituteSettingsDoc, "key" | "updatedAt">;

export const DEFAULT_INSTITUTE: InstituteProfile = {
  name: "AuraEdu Institute",
  legalName: "AuraEdu Learning Pvt. Ltd.",
  address: "",
  gstin: "",
  pan: "",
  supportEmail: "",
  supportPhone: "",
  invoiceTerms: "",
  taxRules: [],
  defaultTaxRuleId: "",
};

export async function getInstitute(): Promise<InstituteProfile> {
  await connectDB();
  const doc = await InstituteSettingsModel.findOne({ key: "institute" }).lean();
  if (!doc) return DEFAULT_INSTITUTE;
  return {
    name: doc.name,
    legalName: doc.legalName,
    address: doc.address,
    gstin: doc.gstin,
    pan: doc.pan,
    supportEmail: doc.supportEmail,
    supportPhone: doc.supportPhone,
    invoiceTerms: doc.invoiceTerms,
    taxRules: (doc.taxRules ?? []).map((r) => ({ id: r.id, name: r.name, rate: r.rate, hsn: r.hsn, description: r.description })),
    defaultTaxRuleId: doc.defaultTaxRuleId,
  };
}

export function defaultTaxRule(profile: InstituteProfile): TaxRule | null {
  return profile.taxRules.find((r) => r.id === profile.defaultTaxRuleId) ?? null;
}

/** GST contained in a GST-inclusive amount, e.g. ₹11,800 at 18% → ₹1,800. */
export function inclusiveGst(total: number, rate: number): number {
  return rate > 0 ? Math.round((total * rate) / (100 + rate)) : 0;
}

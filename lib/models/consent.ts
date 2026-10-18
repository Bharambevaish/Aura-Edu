import mongoose from "mongoose";
import type { ConsentRecord } from "@/lib/privacy";

/**
 * Privacy-notice consent as captured on a public form (see lib/privacy.ts).
 * Embedded on Lead, FormSubmission and User; optional everywhere so older
 * documents stay valid.
 */
export const consentSchema = new mongoose.Schema<ConsentRecord>(
  {
    given: { type: Boolean, required: true },
    at: { type: Date, required: true },
    version: { type: String, required: true },
    byGuardian: { type: Boolean, default: false },
    ip: { type: String, default: "" },
  },
  { _id: false },
);

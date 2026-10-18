import mongoose from "mongoose";
import type { ConsentRecord } from "@/lib/privacy";
import { consentSchema } from "@/lib/models/consent";

/**
 * One response to a Form Builder form. `answers` keeps the label as it was at
 * submission time, so later edits to the form never rewrite old responses.
 */
export interface FormAnswer {
  fieldId: string;
  label: string;
  value: string;
}

export interface FormSubmissionDoc {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  answers: FormAnswer[];
  name: string;
  email: string;
  phone: string;
  leadId: mongoose.Types.ObjectId | null;
  leadNo: string;
  consent?: ConsentRecord;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<FormAnswer>(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, default: "" },
  },
  { _id: false },
);

const formSubmissionSchema = new mongoose.Schema<FormSubmissionDoc>(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true, index: true },
    formTitle: { type: String, default: "" },
    answers: { type: [answerSchema], default: [] },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    leadNo: { type: String, default: "" },
    consent: { type: consentSchema, default: undefined },
  },
  { timestamps: true },
);

export const FormSubmissionModel =
  (mongoose.models.FormSubmission as mongoose.Model<FormSubmissionDoc>) ??
  mongoose.model<FormSubmissionDoc>("FormSubmission", formSubmissionSchema);

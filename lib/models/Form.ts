import mongoose from "mongoose";
import type { FormField } from "@/lib/forms";

/**
 * An embeddable lead-capture form built in Admin → Forms. The public copy
 * lives at /f/<slug> (and /f/<slug>?embed=1 inside an <iframe>); every
 * submission is stored as a FormSubmission and creates or refreshes a Lead.
 */
export interface FormDoc {
  title: string;
  slug: string;
  description: string;
  thankYouMessage: string;
  fields: FormField[];
  active: boolean;
  submissionCount: number;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const fieldSchema = new mongoose.Schema<FormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "email", "phone", "number", "select", "textarea", "checkbox", "date"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    placeholder: { type: String, default: "" },
  },
  { _id: false },
);

const formSchema = new mongoose.Schema<FormDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    thankYouMessage: { type: String, default: "" },
    fields: { type: [fieldSchema], default: [] },
    active: { type: Boolean, default: true },
    submissionCount: { type: Number, default: 0 },
    createdByName: { type: String, default: "System" },
  },
  { timestamps: true },
);

export const FormModel =
  (mongoose.models.Form as mongoose.Model<FormDoc>) ?? mongoose.model<FormDoc>("Form", formSchema);

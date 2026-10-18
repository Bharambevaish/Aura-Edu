import mongoose from "mongoose";
import type { ConsentRecord } from "@/lib/privacy";
import { consentSchema } from "@/lib/models/consent";

/**
 * A prospective student (or B2B client) before they become a `users` row.
 *
 * Pipeline: new → contacted → follow_up → qualified → converted | lost.
 * Online Admissions (/register) creates leads with source "web_register" and
 * Form Builder forms (/f/<slug>) create leads with source "form";
 * staff add walk-ins, calls and referrals by hand. `convertLead()` turns a
 * student lead into a student account and links it via `convertedStudentId`.
 */
export type LeadStage = "new" | "contacted" | "follow_up" | "qualified" | "converted" | "lost";
export type LeadPriority = "low" | "medium" | "high";
export type LeadType = "student" | "client";
export type LeadSource = "web_register" | "form" | "walk_in" | "phone" | "referral" | "campaign" | "other";

export interface LeadNote {
  text: string;
  byName: string;
  at: Date;
}

export interface LeadDoc {
  leadNo: string;
  name: string;
  email: string;
  phone: string;
  type: LeadType;
  stage: LeadStage;
  priority: LeadPriority;
  source: LeadSource;
  /** Course title the lead is interested in (free text for client leads). */
  interestedCourse: string;
  preferredBatch: string;
  branch: string;
  gender?: string;
  dateOfBirth?: Date;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  address?: string;
  ownerName: string;
  nextFollowUpAt?: Date | null;
  notes: LeadNote[];
  lostReason?: string;
  convertedStudentId?: mongoose.Types.ObjectId | null;
  convertedAt?: Date | null;
  /** Privacy-notice consent from the public form that created/refreshed the lead. */
  consent?: ConsentRecord;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new mongoose.Schema<LeadNote>(
  {
    text: { type: String, required: true, trim: true },
    byName: { type: String, default: "System" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const leadSchema = new mongoose.Schema<LeadDoc>(
  {
    leadNo: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", lowercase: true, trim: true, index: true },
    phone: { type: String, default: "", trim: true },
    type: { type: String, enum: ["student", "client"], default: "student" },
    stage: {
      type: String,
      enum: ["new", "contacted", "follow_up", "qualified", "converted", "lost"],
      default: "new",
      index: true,
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    source: {
      type: String,
      enum: ["web_register", "form", "walk_in", "phone", "referral", "campaign", "other"],
      default: "other",
    },
    interestedCourse: { type: String, default: "" },
    preferredBatch: { type: String, default: "" },
    branch: { type: String, default: "" },
    gender: String,
    dateOfBirth: Date,
    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    address: String,
    ownerName: { type: String, default: "Unassigned" },
    nextFollowUpAt: { type: Date, default: null },
    notes: { type: [noteSchema], default: [] },
    lostReason: String,
    convertedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    convertedAt: { type: Date, default: null },
    consent: { type: consentSchema, default: undefined },
  },
  { timestamps: true },
);

export const LeadModel =
  (mongoose.models.Lead as mongoose.Model<LeadDoc>) ?? mongoose.model<LeadDoc>("Lead", leadSchema);

import mongoose from "mongoose";

/**
 * An exam as published by an admin/staff member.
 *
 * `status` is a derived field (upcoming / active / completed) computed from
 * {startAt, endAt} at creation time and stored for easy listing/filtering.
 * `+durationMinutes` from startAt defines endAt, so a test never needs a
 * separate end input.
 */
export type TestStatus = "upcoming" | "active" | "completed";

export interface TestDoc {
  title: string;
  subject: string;
  course: string;
  batch: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  startAt: Date;
  endAt: Date;
  status: TestStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const testSchema = new mongoose.Schema<TestDoc>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    course: { type: String, required: true },
    batch: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    durationMinutes: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    passMarks: { type: Number, default: 0 },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const TestModel =
  (mongoose.models.Test as mongoose.Model<TestDoc>) ??
  mongoose.model<TestDoc>("Test", testSchema);
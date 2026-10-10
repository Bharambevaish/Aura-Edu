import mongoose from "mongoose";

/**
 * A coaching batch — the cohort a student is enrolled in (e.g. "NEET Batch A").
 *
 * Students join by an exact string match: `User.batch === Batch.name`. This is
 * the same join the rest of the product already uses (tests, attempts, results,
 * assignments all reference the batch string), so the batches module writes
 * `User.batch` and every derived view stays in sync with zero refactors.
 *
 * `status` is intentionally NOT stored — it derives from startDate/endDate at
 * read time. Capacity is advisory (soft): the UI flags overfull batches but
 * never blocks assignment, keeping the demo frictionless.
 */
export interface BatchDoc {
  name: string;
  /** Single course the batch runs (matches the course on its students). */
  course: string;
  capacity: number;
  startDate: Date;
  endDate: Date;
  description: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new mongoose.Schema<BatchDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    course: { type: String, required: true },
    capacity: { type: Number, required: true, default: 30 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const BatchModel =
  (mongoose.models.Batch as mongoose.Model<BatchDoc>) ??
  mongoose.model<BatchDoc>("Batch", batchSchema);
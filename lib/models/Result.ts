import mongoose from "mongoose";

/**
 * Final scorecard for one (test, student) pair, created once the attempt is
 * submitted. This is the "official" record the student test card, transcripts
 * and admin statistics read from — it is computed server-side on submit
 * (lib/actions/tests.ts `submitStudentTest`).
 *
 * `fullyGraded` tracks whether every written answer has been awarded marks by
 * a staff member; until then `writtenScore` counts only grades that exist and
 * the student UI shows "grading pending".
 */
export interface ResultDoc {
  testId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  /** The attempt that produced this result (kept for the audit trail). */
  attemptId: mongoose.Types.ObjectId;
  title: string;
  batch: string;
  totalMarks: number;
  obtained: number;
  mcqScore: number;
  writtenScore: number;
  fullyGraded: boolean;
  submittedAt: Date;
}

const resultSchema = new mongoose.Schema<ResultDoc>(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "Attempt", required: true },
    title: { type: String, required: true },
    batch: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    obtained: { type: Number, required: true },
    mcqScore: { type: Number, default: 0 },
    writtenScore: { type: Number, default: 0 },
    fullyGraded: { type: Boolean, default: false },
    submittedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

resultSchema.index({ testId: 1, userId: 1 });

export const ResultModel =
  (mongoose.models.Result as mongoose.Model<ResultDoc>) ??
  mongoose.model<ResultDoc>("Result", resultSchema);
import mongoose from "mongoose";

/**
 * A student's submitted answers for one assignment worksheet.
 *
 * `answers` is a plain array of strings aligned to `Assignment.questions[]`
 * by index (the worksheet model deliberately disables question subdoc _ids).
 * Once a student submits they cannot resubmit; faculty review moves the
 * submission from `pending_review` to `reviewed` with marks + verdict + note.
 */
export interface SubmissionDoc {
  assignmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentName: string;
  batch: string;
  answers: string[];
  submittedAt: Date;
  status: "pending_review" | "reviewed";
  marks: number | null;
  verdict: "complete" | "needs_work" | null;
  note: string;
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

const submissionSchema = new mongoose.Schema<SubmissionDoc>(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    batch: { type: String, required: true },
    answers: { type: [String], required: true, default: [] },
    submittedAt: { type: Date, required: true, default: () => new Date() },
    status: { type: String, enum: ["pending_review", "reviewed"], default: "pending_review", index: true },
    marks: { type: Number, default: null },
    verdict: { type: String, enum: ["complete", "needs_work"], default: null },
    note: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

/** Unique (assignment, student) pair — nobody submits the same worksheet twice. */
submissionSchema.index({ assignmentId: 1, userId: 1 }, { unique: true });

export const SubmissionModel =
  (mongoose.models.Submission as mongoose.Model<SubmissionDoc>) ??
  mongoose.model<SubmissionDoc>("Submission", submissionSchema);
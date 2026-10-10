import mongoose from "mongoose";

/**
 * A student's run-through of a test.
 *
 * Lifecycle: `in_progress` (created by `startStudentTest`, `deadlineAt` =
 * start + duration) → `submitted` (created by `submitStudentTest`, which also
 * upserts the Result scorecard; the in-memory proctoring counters live on the
 * client, this doc holds only durable grading data).
 *
 * `answers` mirrors the test's questions one-for-one (`questionId`), storing
 * the student's `selectedIndices` for MCQs / `answerText` for written
 * questions plus the grading outcome (`isCorrect`, `awardedMarks`, `graded`).
 */
export interface AttemptAnswerDoc {
  questionId: mongoose.Types.ObjectId;
  type: "mcq" | "written";
  selectedIndices: number[];
  answerText: string | null;
  isCorrect: boolean | null;
  awardedMarks: number | null;
  graded: boolean;
}

export interface AttemptDoc {
  testId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentName: string;
  batch: string;
  attemptNumber: number;
  status: "in_progress" | "submitted";
  startedAt: Date;
  submittedAt: Date | null;
  deadlineAt: Date;
  answers: AttemptAnswerDoc[];
  mcqScore: number;
  writtenScore: number;
  score: number;
  createdAt: Date;
}

const attemptAnswerSchema = new mongoose.Schema<AttemptAnswerDoc>(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    type: { type: String, enum: ["mcq", "written"], required: true },
    selectedIndices: { type: [Number], default: [] },
    answerText: { type: String, default: null },
    isCorrect: { type: Boolean, default: null },
    awardedMarks: { type: Number, default: null },
    graded: { type: Boolean, default: false },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema<AttemptDoc>(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    batch: { type: String, required: true },
    attemptNumber: { type: Number, default: 1 },
    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress", index: true },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    deadlineAt: { type: Date, required: true },
    answers: { type: [attemptAnswerSchema], default: [] },
    mcqScore: { type: Number, default: 0 },
    writtenScore: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  },
  { timestamps: true },
);

attemptSchema.index({ testId: 1, userId: 1, attemptNumber: 1 });

export const AttemptModel =
  (mongoose.models.Attempt as mongoose.Model<AttemptDoc>) ??
  mongoose.model<AttemptDoc>("Attempt", attemptSchema);
import mongoose from "mongoose";

/**
 * One question inside a test (owned by Test via `testId`).
 *
 * - `type: "mcq"`  → multiple-choice; students answer with `selectedIndices`
 *   and are graded by exact set-match against `correctIndices`.
 * - `type: "written"` → free-text/essay; students type an `answerText` and a
 *   staff member awards marks manually on the grading screen.
 *
 * `correctIndices` is an array (not a single index) on purpose: length > 1 is
 * a "select all that apply" question, and the exam UI switches to checkboxes +
 * exact-set grading for those.
 */
export type QuestionType = "mcq" | "written";

export interface QuestionDoc {
  testId: mongoose.Types.ObjectId;
  type: QuestionType;
  text: string;
  options: string[];
  correctIndices: number[];
  marks: number;
  /** Display/navigation order within the test (1-based). */
  order: number;
}

const questionSchema = new mongoose.Schema<QuestionDoc>(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
    type: { type: String, enum: ["mcq", "written"], required: true },
    text: { type: String, required: true },
    options: { type: [String], default: [] },
    correctIndices: { type: [Number], default: [] },
    marks: { type: Number, required: true },
    order: { type: Number, required: true },
  },
  { timestamps: true },
);

export const QuestionModel =
  (mongoose.models.Question as mongoose.Model<QuestionDoc>) ??
  mongoose.model<QuestionDoc>("Question", questionSchema);
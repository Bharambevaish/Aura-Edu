import mongoose from "mongoose";

/**
 * An online worksheet ("assignment") published to a batch by admin/staff.
 *
 * Unlike tests, assignments are short-form practice sheets: a set of text
 * questions the student answers in-app (free text). Faculty later review the
 * submission and award marks + a verdict + a note (see Submission).
 *
 * Questions are embedded (no separate collection) to keep the module light —
 * a worksheet is simply "read one document, answer N prompts". `_id: false`
 * keeps answers keyed by simple array index instead of subdoc ids.
 */
export interface AssignmentDoc {
  title: string;
  subject: string;
  course: string;
  batch: string;
  description: string;
  totalMarks: number;
  /** When submissions close. `status` is derived from this at read time. */
  dueDate: Date;
  questions: { text: string; marks: number }[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new mongoose.Schema<AssignmentDoc>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    course: { type: String, required: true },
    batch: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    totalMarks: { type: Number, required: true },
    dueDate: { type: Date, required: true, index: true },
    questions: {
      type: [
        {
          _id: false,
          text: { type: String, required: true },
          marks: { type: Number, required: true },
        },
      ],
      required: true,
      default: [],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const AssignmentModel =
  (mongoose.models.Assignment as mongoose.Model<AssignmentDoc>) ??
  mongoose.model<AssignmentDoc>("Assignment", assignmentSchema);
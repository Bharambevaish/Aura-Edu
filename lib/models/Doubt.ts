import mongoose from "mongoose";

/**
 * A student's question on one lesson of a course (Learn player → Doubt
 * Discussion), answered by admin/staff from the Doubts inbox.
 *
 * Lessons are embedded in Course.modules[].lessons[] and identified by their
 * string `id`; `lessonTitle` is a snapshot so the inbox reads well even if
 * the lesson is renamed. `batch` is the student's batch when they asked —
 * staff see doubts for the batches they teach (timetable).
 */
export type DoubtStatus = "open" | "answered";

export interface DoubtReply {
  _id?: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId | null;
  authorName: string;
  authorRole: "admin" | "staff" | "student";
  body: string;
  createdAt: Date;
}

export interface DoubtDoc {
  courseId: mongoose.Types.ObjectId;
  lessonId: string;
  lessonTitle: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  batch: string;
  question: string;
  status: DoubtStatus;
  replies: DoubtReply[];
  answeredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new mongoose.Schema<DoubtReply>({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ["admin", "staff", "student"], required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const doubtSchema = new mongoose.Schema<DoubtDoc>(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: String, required: true },
    lessonTitle: { type: String, default: "" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentName: { type: String, required: true },
    batch: { type: String, default: "", index: true },
    question: { type: String, required: true },
    status: { type: String, enum: ["open", "answered"], default: "open", index: true },
    replies: { type: [replySchema], default: [] },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

doubtSchema.index({ courseId: 1, lessonId: 1, createdAt: -1 });

export const DoubtModel =
  (mongoose.models.Doubt as mongoose.Model<DoubtDoc>) ?? mongoose.model<DoubtDoc>("Doubt", doubtSchema);

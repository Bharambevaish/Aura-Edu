import mongoose from "mongoose";

/**
 * One row per lesson a student has marked complete. Lessons live embedded in
 * Course.modules[].lessons[] and are identified by their string `id`.
 */
export interface LessonProgressDoc {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  lessonId: string;
  completedAt: Date;
}

const lessonProgressSchema = new mongoose.Schema<LessonProgressDoc>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lessonId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
});

lessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export const LessonProgressModel =
  (mongoose.models.LessonProgress as mongoose.Model<LessonProgressDoc>) ??
  mongoose.model<LessonProgressDoc>("LessonProgress", lessonProgressSchema);

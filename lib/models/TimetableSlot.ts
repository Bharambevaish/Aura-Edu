import mongoose from "mongoose";

/**
 * A recurring weekly class for one batch ("NEET Batch A, Monday 09:00–10:30,
 * Physics with R. Sharma in Hall A"). Occurrences on specific dates are
 * derived at read time — nothing is stored per date.
 */
export type ClassMode = "offline" | "online" | "hybrid";

export interface TimetableSlotDoc {
  batch: string;
  /** 0 = Sunday … 6 = Saturday (JavaScript Date#getDay). */
  dayOfWeek: number;
  /** "HH:mm", 24-hour. */
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  /** Staff account teaching the class, when it is one. */
  teacherId?: mongoose.Types.ObjectId | null;
  room: string;
  mode: ClassMode;
  meetingLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSlotSchema = new mongoose.Schema<TimetableSlotDoc>(
  {
    batch: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    teacherName: { type: String, default: "", trim: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    room: { type: String, default: "", trim: true },
    mode: { type: String, enum: ["offline", "online", "hybrid"], default: "offline" },
    meetingLink: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

timetableSlotSchema.index({ batch: 1, dayOfWeek: 1, startTime: 1 });

export const TimetableSlotModel =
  (mongoose.models.TimetableSlot as mongoose.Model<TimetableSlotDoc>) ??
  mongoose.model<TimetableSlotDoc>("TimetableSlot", timetableSlotSchema);

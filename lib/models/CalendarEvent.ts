import mongoose from "mongoose";

/**
 * A calendar entry (Calendar tab): classes, meetings, exams, events, holidays.
 *
 * `type` matches the calendar's existing color coding. Only admin-authored
 * events live here; meetings/tests could be merged in later as a real-product
 * enhancement, but for the demo this stays the single source for the grid.
 */
export interface CalendarEventDoc {
  title: string;
  date: Date;
  time: string;
  type: "class" | "meeting" | "exam" | "event" | "holiday";
  description: string;
  batchNames: string[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const calendarEventSchema = new mongoose.Schema<CalendarEventDoc>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, default: "10:00" },
    type: { type: String, enum: ["class", "meeting", "exam", "event", "holiday"], default: "event" },
    description: { type: String, default: "" },
    batchNames: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const CalendarEventModel =
  (mongoose.models.CalendarEvent as mongoose.Model<CalendarEventDoc>) ??
  mongoose.model<CalendarEventDoc>("CalendarEvent", calendarEventSchema);
import mongoose from "mongoose";

/**
 * A scheduled class / staff meeting / webinar (the Meetings tab).
 *
 * Everything the Schedule-Meeting form shows maps straight onto this doc so
 * the form saves and the list/calendar/dashboard read the same shape.
 * `status` is authored: draft → upcoming → live → completed (or cancelled).
 */
export interface MeetingDoc {
  title: string;
  description: string;
  date: Date;
  startHour: string;
  endHour: string;
  type: "internal" | "class" | "webinar";
  batchNames: string[];
  link: string;
  security: {
    disableScreenshot: boolean;
    disableRecording: boolean;
    disableScreenShare: boolean;
    watermark: boolean;
    waitingRoom: boolean;
    muteOnEntry: boolean;
  };
  status: "draft" | "upcoming" | "live" | "completed" | "cancelled";
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new mongoose.Schema<MeetingDoc>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: Date, required: true, index: true },
    startHour: { type: String, default: "09:00" },
    endHour: { type: String, default: "10:00" },
    type: { type: String, enum: ["internal", "class", "webinar"], default: "internal" },
    batchNames: { type: [String], default: [] },
    link: { type: String, default: "" },
    security: {
      disableScreenshot: { type: Boolean, default: true },
      disableRecording: { type: Boolean, default: true },
      disableScreenShare: { type: Boolean, default: true },
      watermark: { type: Boolean, default: true },
      waitingRoom: { type: Boolean, default: false },
      muteOnEntry: { type: Boolean, default: true },
    },
    status: { type: String, enum: ["draft", "upcoming", "live", "completed", "cancelled"], default: "upcoming", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const MeetingModel =
  (mongoose.models.Meeting as mongoose.Model<MeetingDoc>) ??
  mongoose.model<MeetingDoc>("Meeting", meetingSchema);
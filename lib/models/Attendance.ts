import mongoose from "mongoose";

/**
 * A daily per-batch attendance register.
 *
 * One document per (batch, date): the whole roster's marks for that day,
 * embedded as entries keyed by studentId. This mirrors how a coaching centre's
 * register actually works — you open a batch + a date, mark the grid, and save.
 *
 * Entries are embedded (no separate collection) on purpose:
 *   - saving a day is a single upsert, cheap and atomic for the demo,
 *   - `_id: false` keeps array membership simple (we match by studentId).
 *
 * The roster itself is NOT stored — it is derived at read time from
 * `users.batch` (the string join the whole product uses), so students moving
 * between batches never leave stale rows behind. Entries for students no longer
 * in the roster are simply ignored when the register is read for that batch.
 *
 * `status` is a simple three-state mark (present / absent / late). A whole-day
 * aggregate (%) is computed at request time, never stored.
 */
export interface AttendanceDoc {
  /** Exact string match on `User.batch` — the roster join. */
  batch: string;
  /** Local midnight of the register day. */
  date: Date;
  /** Optional session label (e.g. "Physics & Chemistry"); default "Regular Session". */
  subject: string;
  entries: {
    studentId: mongoose.Types.ObjectId;
    status: "present" | "absent" | "late";
    checkIn?: string;
    remark?: string;
  }[];
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new mongoose.Schema<AttendanceDoc>(
  {
    batch: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    subject: { type: String, default: "Regular Session" },
    entries: {
      type: [
        {
          _id: false,
          studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
          status: { type: String, required: true, enum: ["present", "absent", "late"] },
          checkIn: { type: String, default: "" },
          remark: { type: String, default: "" },
        },
      ],
      required: true,
      default: [],
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// One register per batch per day.
attendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

export const AttendanceModel =
  (mongoose.models.Attendance as mongoose.Model<AttendanceDoc>) ??
  mongoose.model<AttendanceDoc>("Attendance", attendanceSchema);
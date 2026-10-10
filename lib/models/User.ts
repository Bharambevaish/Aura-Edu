import mongoose from "mongoose";

/** Everything important about who can log in and with what authority. */
export type Role = "admin" | "staff" | "student";

export interface UserDoc {
  name: string;
  /** Unique, always lowercased on write so lookups are exact. */
  email: string;
  /** bcrypt hash (cost is embedded in the hash string, ~12, never plaintext). */
  passwordHash: string;
  /** Authority level; every server action re-checks it via requireRole(). */
  role: Role;
  employeeId?: string;
  admissionNo?: string;
  /** Which batch this student belongs to (for test assignment/reports). */
  batch?: string;
  /** Full student profile — populated for role: "student" (additive, never required). */
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  dateOfBirth?: Date;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
  rollNo?: string;
  admissionDate?: Date;
  branch?: string;
  course?: string;
  status?: "Active" | "Inactive";
  admissionStatus?: "Active" | "Pending" | "Graduated" | "Transferred";
  idProofType?: string;
  idProofNumber?: string;
  /** Marks seed/built-in demo accounts so "Reset demo data" can wipe only them. */
  isDemo?: boolean;
  /** Admin-controlled access block — checked at login and on every request. */
  isBlocked?: boolean;
  /** Browser/OS of the most recent sign-in (the Student Logins card). */
  lastDevice?: { browser?: string; os?: string; deviceType?: string; userAgent?: string };
  /** Light audit trail — bumped on every successful sign-in. */
  lastLoginAt?: Date;
  /** Consecutive failed sign-in attempts (reset on success / lock expiry). */
  failedAttempts?: number;
  /** Set while brute-force protection blocks this account. */
  lockoutUntil?: Date;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<UserDoc>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "staff", "student"],
      default: "student",
      index: true,
    },
    employeeId: String,
    admissionNo: String,
    batch: String,
    phone: String,
    alternatePhone: String,
    gender: String,
    dateOfBirth: Date,
    guardianName: String,
    guardianPhone: String,
    guardianEmail: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    rollNo: String,
    admissionDate: Date,
    branch: String,
    course: String,
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    admissionStatus: { type: String, enum: ["Active", "Pending", "Graduated", "Transferred"], default: "Active" },
    idProofType: String,
    idProofNumber: String,
    isDemo: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastDevice: {
      browser: String,
      os: String,
      deviceType: String,
      userAgent: String,
    },
    lastLoginAt: Date,
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", userSchema);
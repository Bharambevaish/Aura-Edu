/**
 * All shared input schemas (zod).
 *
 * Every server action that accepts user input parses through these before
 * touching the database — this is the first line of defense for anything a
 * client can craft (login, test submission, creating a test, written grading).
 * Messages are deliberately user-facing (shown next to inputs), while the
 * authorize/rate-limit logic keeps its own generic errors.
 */
import { z } from "zod";

/** Normalized, trimmed, lowercased email + presence-checked password. */
export const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Password is required." }),
});

/**
 * Public self-registration shape. (For the POC this is aspirational only —
 * the UI lives in app/register but there is NO server action creating users,
 * so it is not an open signup vector.)
 */
export const RegisterSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name is required." }).trim(),
    email: z.string().email({ message: "Enter a valid email address." }).trim().toLowerCase(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { message: "Password must contain a letter." })
      .regex(/[0-9]/, { message: "Password must contain a number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/* Return types that the login/register forms expect from useActionState. */
export type LoginState = {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
} | null;

export type RegisterState = {
  errors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  message?: string;
} | null;

/**
 * Payload for finishing an exam attempt. Answers key off question _ids and
 * carry either `selectedIndices` (MCQ; exact-set-matched against the stored
 * correctIndices later) or `answerText` (written).
 */
export const SubmitTestSchema = z.object({
  attemptId: z.string().min(1),
  testId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedIndices: z.array(z.number().int().min(0)).optional(),
      answerText: z.string().max(4000).nullable().optional(),
    }),
  ),
});

/** A single question as entered on the Create-Test form. */
export const QuestionInputSchema = z.object({
  type: z.enum(["mcq", "written"]),
  text: z.string().min(1, { message: "Question text is required." }).max(1000).trim(),
  marks: z.number().int().min(1).max(100, { message: "Marks per question must be 1–100." }),
  options: z.array(z.string().max(300)).optional(),
  // Which option indices are correct; length > 1 makes the question
  // multi-correct (exact set match required to score).
  correctIndices: z.array(z.number().int().min(0)).optional(),
});

/** Create-Test form payload (admin/staff only at the action layer). */
export const CreateTestSchema = z.object({
  title: z.string().min(3, { message: "Test title must be at least 3 characters." }).max(150).trim(),
  subject: z.string().min(1, { message: "Subject is required." }).max(100).trim(),
  course: z.string().min(1, { message: "Course is required." }).max(150).trim(),
  batch: z.string().min(1, { message: "Batch is required." }).max(150).trim(),
  description: z.string().max(2000).optional(),
  durationMinutes: z.number().int().min(5).max(300, { message: "Duration must be 5–300 minutes." }),
  passMarks: z.number().int().min(0).max(10000),
  // ISO-ish datetime string; parsed to Date inside the action.
  startAt: z.string().min(1, { message: "Start date is required." }),
  questions: z.array(QuestionInputSchema).min(1, { message: "Add at least one question." }).max(100),
});

/** Staff award-save for written answers, capped at each question's marks. */
export const GradeWrittenSchema = z.object({
  attemptId: z.string().min(1),
  grades: z.array(
    z.object({
      questionId: z.string().min(1),
      marks: z.number().min(0),
    }),
  ),
});

export type SubmitTestState = {
  errors?: string;
  message?: string;
} | null;

/**
 * Full student profile as entered on the Add/Edit Student wizard or an
 * imported spreadsheet row. All profile fields are optional at the schema
 * level so partial edits and CSV rows that only fill a subset stay valid;
 * the action layer enforces business rules (email format, password policy,
 * unique email) on top.
 */
export const CreateStudentSchema = z.object({
  name: z.string().min(2, { message: "Student name must be at least 2 characters." }).max(150).trim(),
  email: z.string().email({ message: "Enter a valid email address." }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Password is required." }).max(128),
  gender: z.string().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: z.string().max(25).optional().or(z.literal("")),
  alternatePhone: z.string().max(25).optional().or(z.literal("")),
  guardianName: z.string().max(150).optional().or(z.literal("")),
  guardianPhone: z.string().max(25).optional().or(z.literal("")),
  guardianEmail: z.string().email({ message: "Guardian email must be valid." }).optional().or(z.literal("")),
  street: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  pincode: z.string().max(15).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  rollNo: z.string().max(40).optional().or(z.literal("")),
  admissionDate: z.string().optional().or(z.literal("")),
  batch: z.string().max(150).optional().or(z.literal("")),
  branch: z.string().max(150).optional().or(z.literal("")),
  course: z.string().max(150).optional().or(z.literal("")),
  status: z.enum(["Active", "Inactive"]).optional(),
  admissionStatus: z.enum(["Active", "Pending", "Graduated", "Transferred"]).optional(),
  idProofType: z.string().max(60).optional().or(z.literal("")),
  idProofNumber: z.string().max(60).optional().or(z.literal("")),
});

/** Partial student update — same shape, but nothing is required. */
export const UpdateStudentSchema = CreateStudentSchema.partial().omit({ password: true });

export const BulkAssignFieldSchema = z.enum(["branch", "course", "batch"]);

export const BulkAssignSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, { message: "Select at least one student." }),
  field: BulkAssignFieldSchema,
  value: z.string().min(1, { message: "Choose a value to assign." }).max(150),
});

export const BulkLoginSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, { message: "Select at least one student." }),
});

/** One parsed import row, validated before upsert. */
export const ImportStudentRowSchema = CreateStudentSchema.partial().extend({
  email: z.string().email({ message: "Invalid email in row." }).trim().toLowerCase(),
});

/* ------------------------------------------------------------------ */
/* Assignments (online worksheets)                                      */
/* ------------------------------------------------------------------ */

/** One worksheet question as entered on the Create-Assignment form. */
export const AssignmentQuestionSchema = z.object({
  text: z.string().min(1, { message: "Question text is required." }).max(1000).trim(),
  marks: z.number().int().min(1).max(100, { message: "Per-question marks must be 1–100." }),
});

/** Create-Assignment form payload (admin/staff only at the action layer). */
export const CreateAssignmentSchema = z.object({
  title: z.string().min(3, { message: "Assignment title must be at least 3 characters." }).max(150).trim(),
  subject: z.string().min(1, { message: "Subject is required." }).max(100).trim(),
  course: z.string().min(1, { message: "Course is required." }).max(150).trim(),
  batch: z.string().min(1, { message: "Batch is required." }).max(150).trim(),
  description: z.string().max(2000).optional(),
  // ISO-ish datetime string; parsed to Date inside the action.
  dueDate: z.string().min(1, { message: "Due date is required." }),
  questions: z.array(AssignmentQuestionSchema).min(1, { message: "Add at least one question." }).max(50),
});

/** Student worksheet submission — answers aligned to questions by index. */
export const SubmitAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  answers: z.array(z.string().min(1, { message: "Answer is required." }).max(4000)).min(1).max(50),
});

/** Faculty review of a submission: marks + verdict + short note. */
export const ReviewSubmissionSchema = z.object({
  submissionId: z.string().min(1),
  marks: z.number().int().min(0).max(10000, { message: "Marks must be 0–10000." }),
  verdict: z.enum(["complete", "needs_work"]),
  note: z.string().max(500).optional().or(z.literal("")),
});

/* ------------------------------------------------------------------ */
/* Batches (cohorts)                                                    */
/* ------------------------------------------------------------------ */

/** Create/Edit-Batch form payload (admin/staff only at the action layer). */
export const CreateBatchSchema = z
  .object({
    name: z.string().min(2, { message: "Batch name must be at least 2 characters." }).max(150).trim(),
    course: z.string().min(1, { message: "Course is required." }).max(150).trim(),
    capacity: z.number().int().min(1).max(10000, { message: "Capacity must be 1–10000." }),
    // ISO date string (YYYY-MM-DD), parsed to Date inside the action.
    startDate: z.string().min(1, { message: "Start date is required." }),
    endDate: z.string().min(1, { message: "End date is required." }),
    description: z.string().max(2000).optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.startDate && val.endDate && new Date(val.endDate) <= new Date(val.startDate)) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after the start date." });
    }
  });

/** Assign students to a batch. */
export const AssignStudentsSchema = z.object({
  batchId: z.string().min(1),
  studentIds: z.array(z.string().min(1)).min(1, { message: "Select at least one student." }),
});

/* ------------------------------------------------------------------ */
/* Attendance (daily per-batch register)                                */
/* ------------------------------------------------------------------ */

/** One student's mark inside a daily register. */
export const AttendanceEntrySchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["present", "absent", "late"]),
  checkIn: z.string().max(20).optional().or(z.literal("")),
  remark: z.string().max(200).optional().or(z.literal("")),
});

/** Save a whole day's register for one batch. Date is YYYY-MM-DD, parsed to Date inside the action. */
export const SaveAttendanceSchema = z.object({
  batch: z.string().min(1, { message: "Batch is required." }).max(150).trim(),
  date: z.string().min(1, { message: "Date is required." }),
  subject: z.string().max(100).optional().or(z.literal("")),
  entries: z.array(AttendanceEntrySchema),
});

/* ------------------------------------------------------------------ */
/* Courses (content + sales center)                                    */
/* ------------------------------------------------------------------ */

/** One lesson inside a module. `url` is a demo asset reference (video/PDF/test link). */
export const LessonSchema = z.object({
  title: z.string().min(1, { message: "Lesson title is required." }).max(200).trim(),
  type: z.enum(["video", "document", "quiz"]),
  url: z.string().max(500).optional().or(z.literal("")),
  duration: z.string().max(40).optional().or(z.literal("")),
});

/** A curriculum module (chapter/unit) holding lessons. */
export const ModuleSchema = z.object({
  title: z.string().min(1, { message: "Module title is required." }).max(200).trim(),
  lessons: z.array(LessonSchema).max(200).optional(),
});

/** Create / fully edit a course (Content tab). */
export const CourseSchema = z.object({
  title: z.string().min(2, { message: "Course title must be at least 2 characters." }).max(200).trim(),
  code: z
    .string()
    .min(2, { message: "Course code must be at least 2 characters." })
    .max(40)
    .trim()
    .toUpperCase(),
  category: z.enum(["Medical Entrance", "Engineering Entrance", "Computer Science"]),
  description: z.string().max(2000).optional().or(z.literal("")),
  instructor: z.string().max(150).optional().or(z.literal("")),
  duration: z.string().max(80).optional().or(z.literal("")),
  thumbnail: z.string().max(500).optional().or(z.literal("")),
  published: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().int().min(0).max(10000000),
  originalPrice: z.number().int().min(0).max(10000000).optional(),
  level: z.string().max(80).optional().or(z.literal("")),
  badge: z.string().max(60).optional().or(z.literal("")),
  rating: z.number().min(0).max(5).optional(),
  features: z.array(z.string().max(300)).max(12).optional(),
});

/** Storefront settings edited on the Course Center tab. */
export const CourseStoreSettingsSchema = z.object({
  published: z.boolean(),
  isPaid: z.boolean(),
  price: z.number().int().min(0).max(10000000),
  originalPrice: z.number().int().min(0).max(10000000),
  badge: z.string().max(60).optional().or(z.literal("")),
});

/* ------------------------------------------------------------------ */
/* Finance Operations                                                  */
/* ------------------------------------------------------------------ */

export const VendorSchema = z.object({
  name: z.string().min(2, { message: "Vendor name is required." }).max(200).trim(),
  contactPerson: z.string().max(150).optional().or(z.literal("")),
  email: z.string().email({ message: "Enter a valid email." }).max(200).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  gstin: z.string().max(30).optional().or(z.literal("")),
  pan: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(600).optional().or(z.literal("")),
  bankName: z.string().max(150).optional().or(z.literal("")),
  accountNumber: z.string().max(40).optional().or(z.literal("")),
  ifsc: z.string().max(20).optional().or(z.literal("")),
  branchName: z.string().max(150).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const ExpenseCategorySchema = z.object({
  name: z.string().min(2, { message: "Category name is required." }).max(150).trim(),
  description: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const ExpenseSchema = z.object({
  title: z.string().min(2, { message: "Expense title is required." }).max(300).trim(),
  description: z.string().max(2000).optional().or(z.literal("")),
  amount: z.number().int().min(1, { message: "Amount must be at least ₹1." }).max(100000000),
  expenseDate: z.string().min(1, { message: "Expense date is required." }),
  categoryRef: z.string().min(1, { message: "Category is required." }),
  vendorRef: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["Cash", "Bank Transfer", "UPI", "Cheque", "Online"]),
  paymentSource: z.enum(["Company", "Personal"]),
  refNo: z.string().max(80).optional().or(z.literal("")),
  receiptUrl: z.string().max(500).optional().or(z.literal("")),
  internalNotes: z.string().max(1000).optional().or(z.literal("")),
  isReimbursement: z.boolean().optional(),
  reimbursedTo: z.string().max(150).optional().or(z.literal("")),
});

export const ExpenseDecisionSchema = z.object({
  status: z.enum(["approved", "rejected", "voided"]),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export const InvoiceSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required." }),
  total: z.number().int().min(1, { message: "Total fee must be at least ₹1." }).max(100000000),
  issueDate: z.string().min(1, { message: "Issue date is required." }),
  dueDate: z.string().min(1, { message: "Due date is required." }),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const PaymentSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required." }),
  invoiceId: z.string().optional().or(z.literal("")),
  amount: z.number().int().min(1, { message: "Amount must be at least ₹1." }).max(100000000),
  mode: z.enum(["Cash", "Bank Transfer", "UPI", "Cheque", "Online"]),
  source: z.enum(["Admin", "Student Portal"]),
  gatewayFee: z.number().int().min(0).max(100000000).optional(),
  gst: z.number().int().min(0).max(100000000).optional(),
});

export const RefundSchema = z.object({
  paymentId: z.string().min(1, { message: "Select the payment to refund." }),
  amount: z.number().int().min(1, { message: "Amount must be at least ₹1." }).max(100000000),
  reason: z.string().min(2, { message: "Reason is required." }).max(500).trim(),
  method: z.string().max(80).optional().or(z.literal("")),
});

export const WaiverSchema = z.object({
  studentId: z.string().min(1, { message: "Student is required." }),
  amount: z.number().int().min(1, { message: "Amount must be at least ₹1." }).max(100000000),
  reason: z.string().min(2, { message: "Reason is required." }).max(500).trim(),
});

/* ------------------------------------------------------------------ */
/* Connect (communications)                                             */
/* ------------------------------------------------------------------ */

/** The student-hub categories a broadcast can drop into. */
export const NoticeCategorySchema = z.enum([
  "Announcements",
  "Tests",
  "Assignments",
  "Attendance",
  "Certificates",
  "Payments",
  "Courses",
]);

/**
 * Audience for a broadcast. `kind` "all" → every student; "batches" → students
 * whose `User.batch` string is in batchNames; "staff" → staff role; "students"
 * → explicit student ids (future feature, kept for the skeleton).
 */
export const NoticeAudienceSchema = z.object({
  kind: z.enum(["all", "batches", "staff", "students"]).default("all"),
  batchNames: z.array(z.string().min(1)).default([]),
  studentIds: z.array(z.string().min(1)).default([]),
});

export const CreateNoticeSchema = z
  .object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(120).trim(),
    message: z.string().min(5, { message: "Message must be at least 5 characters." }).max(3000).trim(),
    category: NoticeCategorySchema,
    important: z.boolean().default(false),
    audience: NoticeAudienceSchema,
  })
  .superRefine((val, ctx) => {
    if (val.audience.kind === "batches" && val.audience.batchNames.length === 0) {
      ctx.addIssue({ code: "custom", path: ["audience", "batchNames"], message: "Select at least one batch." });
    }
  });

/** Batch broadcast from the Groups composer — the title is derived, message is free. */
export const SendBroadcastSchema = z.object({
  batchName: z.string().min(1, { message: "A batch is required." }),
  message: z.string().min(1, { message: "Message is required." }).max(3000).trim(),
  category: NoticeCategorySchema.default("Announcements"),
});

export const CreateMeetingSchema = z.object({
  title: z.string().min(3, { message: "Meeting title is required." }).max(150).trim(),
  description: z.string().max(2000).optional().or(z.literal("")),
  date: z.string().min(1, { message: "Date is required." }),
  startHour: z.string().min(1, { message: "Start time is required." }),
  endHour: z.string().min(1, { message: "End time is required." }),
  type: z.enum(["internal", "class", "webinar"]).default("internal"),
  batchNames: z.array(z.string().min(1)).default([]),
  security: z
    .object({
      disableScreenshot: z.boolean().default(true),
      disableRecording: z.boolean().default(true),
      disableScreenShare: z.boolean().default(true),
      watermark: z.boolean().default(true),
      waitingRoom: z.boolean().default(false),
      muteOnEntry: z.boolean().default(true),
    })
    .default({
      disableScreenshot: true,
      disableRecording: true,
      disableScreenShare: true,
      watermark: true,
      waitingRoom: false,
      muteOnEntry: true,
    }),
});

export const CreateCalendarEventSchema = z.object({
  title: z.string().min(2, { message: "Event title is required." }).max(150).trim(),
  date: z.string().min(1, { message: "Date is required." }),
  time: z.string().min(1, { message: "Time is required." }),
  type: z.enum(["class", "meeting", "exam", "event", "holiday"]),
  description: z.string().max(2000).optional().or(z.literal("")),
  batchNames: z.array(z.string().min(1)).default([]),
});
/* ------------------------------------------------------------------ */
/* Student self-service (student portal)                               */
/* ------------------------------------------------------------------ */

const optionalPhone = z
  .string()
  .trim()
  .max(25)
  .regex(/^[+0-9\s()-]*$/, { message: "Phone may only contain digits, spaces, +, ( ) and -." });

/** Contact fields a student may edit themselves. Identity/academic fields stay admin-only. */
export const UpdateMyProfileSchema = z.object({
  phone: optionalPhone,
  guardianPhone: optionalPhone,
  street: z.string().trim().max(200),
  city: z.string().trim().max(80),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Enter your current password." }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters." })
      .max(128),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });

/** Simulated online payment from the student portal (no real gateway in the POC). */
export const StudentPaymentSchema = z.object({
  amount: z
    .number({ message: "Enter a valid amount." })
    .positive({ message: "Amount must be greater than zero." })
    .max(10_000_000),
  mode: z.enum(["Online", "UPI"]),
});

/* ------------------------------------------------------------------ */
/* Leads + Online Admissions                                           */
/* ------------------------------------------------------------------ */

const LeadStageEnum = z.enum(["new", "contacted", "follow_up", "qualified", "converted", "lost"]);
const LeadPriorityEnum = z.enum(["low", "medium", "high"]);
const leadPhone = z
  .string()
  .trim()
  .min(7, { message: "Enter a valid phone number." })
  .max(20)
  .regex(/^[+0-9\s()-]+$/, { message: "Phone may only contain digits, spaces, +, ( ) and -." });

/** Staff-entered lead (walk-in, call, referral...). */
export const CreateLeadSchema = z
  .object({
    name: z.string().trim().min(2, { message: "Name is required." }).max(120),
    email: z.string().trim().toLowerCase().email({ message: "Enter a valid email." }).or(z.literal("")),
    phone: leadPhone.or(z.literal("")),
    type: z.enum(["student", "client"]).default("student"),
    priority: LeadPriorityEnum.default("medium"),
    source: z.enum(["walk_in", "phone", "referral", "campaign", "other"]).default("walk_in"),
    interestedCourse: z.string().trim().max(150).default(""),
    note: z.string().trim().max(1000).default(""),
  })
  .refine((d) => d.email || d.phone, { message: "Add an email or a phone number.", path: ["email"] });

/** Follow-up: move the stage, set the next follow-up, add a note. */
export const UpdateLeadSchema = z.object({
  stage: LeadStageEnum.exclude(["converted"]),
  priority: LeadPriorityEnum,
  nextFollowUpAt: z.string().trim().max(30).default(""),
  note: z.string().trim().max(1000).default(""),
  lostReason: z.string().trim().max(300).default(""),
});

/** Convert a student lead into a student account. */
export const ConvertLeadSchema = z.object({
  batch: z.string().trim().min(1, { message: "Pick a batch." }).max(150),
  feeTotal: z.number().int().min(0).max(10_000_000),
  dueInDays: z.number().int().min(0).max(365).default(30),
});

/** Public Online Admissions form (/register). */
export const AdmissionSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required." }).max(60),
  lastName: z.string().trim().min(1, { message: "Last name is required." }).max(60),
  dateOfBirth: z.string().trim().min(1, { message: "Date of birth is required." }).max(20),
  gender: z.enum(["Male", "Female", "Other"], { message: "Select a gender." }),
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email." }),
  phone: leadPhone,
  course: z.string().trim().min(1, { message: "Choose a course." }).max(150),
  preferredBatch: z.string().trim().max(60).default(""),
  branch: z.string().trim().max(80).default(""),
  guardianName: z.string().trim().min(2, { message: "Guardian name is required." }).max(120),
  guardianRelation: z.string().trim().max(40).default(""),
  guardianPhone: leadPhone,
  address: z.string().trim().min(5, { message: "Address is required." }).max(400),
  /** Honeypot: real users never fill this hidden field. */
  website: z.string().max(0).optional().or(z.literal("")),
});

/* ------------------------------------------------------------------ */
/* Timetable                                                           */
/* ------------------------------------------------------------------ */

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { message: "Use HH:MM (24-hour) times." });

export const TimetableSlotSchema = z
  .object({
    batch: z.string().trim().min(1, { message: "Pick a batch." }).max(150),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: hhmm,
    endTime: hhmm,
    subject: z.string().trim().min(2, { message: "Enter the subject." }).max(120),
    teacherId: z.string().trim().max(40).default(""),
    teacherName: z.string().trim().max(120).default(""),
    room: z.string().trim().max(80).default(""),
    mode: z.enum(["offline", "online", "hybrid"]).default("offline"),
    meetingLink: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === "" || /^https:\/\//.test(v), { message: "Class links must start with https://" })
      .default(""),
  })
  .refine((d) => d.endTime > d.startTime, { message: "End time must be after start time.", path: ["endTime"] })
  .refine((d) => d.mode === "offline" || d.meetingLink, { message: "Online/hybrid classes need a class link.", path: ["meetingLink"] });

/* ------------------------------------------------------------------ */
/* Staff + own account                                                 */
/* ------------------------------------------------------------------ */

export const StaffSchema = z.object({
  name: z.string().trim().min(2, { message: "Name is required." }).max(120),
  email: z.string().trim().toLowerCase().email({ message: "Enter a valid email." }),
  phone: z.string().trim().max(25).regex(/^[+0-9\s()-]*$/, { message: "Phone may only contain digits, spaces, +, ( ) and -." }).default(""),
  employeeId: z.string().trim().max(30).default(""),
  designation: z.string().trim().max(80).default(""),
  department: z.string().trim().max(80).default(""),
  joiningDate: z.string().trim().max(20).default(""),
  monthlySalary: z.number().int().min(0).max(10_000_000).default(0),
});

export const UpdateOwnAccountSchema = z.object({
  phone: z.string().trim().max(25).regex(/^[+0-9\s()-]*$/, { message: "Phone may only contain digits, spaces, +, ( ) and -." }),
});

/* ------------------------------------------------------------------ */
/* Leave                                                               */
/* ------------------------------------------------------------------ */

export const LeaveRequestSchema = z.object({
  type: z.enum(["casual", "sick", "earned", "unpaid"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Pick the first day." }),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Pick the last day." }),
  reason: z.string().trim().min(3, { message: "Add a short reason." }).max(500),
});

export const LeaveDecisionSchema = z.object({
  approve: z.boolean(),
  note: z.string().trim().max(300).default(""),
});

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export const TaskSchema = z.object({
  title: z.string().trim().min(2, { message: "Give the task a title." }).max(150),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assigneeId: z.string().trim().max(40).default(""),
  dueDate: z.string().trim().max(10).default(""),
});

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const InstituteProfileSchema = z.object({
  name: z.string().trim().min(2, { message: "Institute name is required." }).max(120),
  legalName: z.string().trim().max(160).default(""),
  address: z.string().trim().max(400).default(""),
  gstin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v), { message: "GSTIN should look like 27ABCDE1234F1Z5." })
    .default(""),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v), { message: "PAN should look like ABCDE1234F." })
    .default(""),
  supportEmail: z.string().trim().email({ message: "Enter a valid support email." }).or(z.literal("")).default(""),
  supportPhone: z.string().trim().max(25).default(""),
  invoiceTerms: z.string().trim().max(2000).default(""),
});

export const TaxRulesSchema = z.object({
  rules: z
    .array(
      z.object({
        id: z.string().max(60).default(""),
        name: z.string().trim().min(2, { message: "Each rule needs a name." }).max(60),
        rate: z.number().min(0).max(100),
        hsn: z.string().trim().max(20).default(""),
        description: z.string().trim().max(200).default(""),
      }),
    )
    .max(20),
  defaultIndex: z.number().int().min(0).nullable(),
});

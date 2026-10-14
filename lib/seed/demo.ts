import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/lib/models/User";
import { SessionModel } from "@/lib/models/Session";
import { LessonProgressModel } from "@/lib/models/LessonProgress";
import { TimetableSlotModel, type ClassMode } from "@/lib/models/TimetableSlot";
import { LeaveRequestModel } from "@/lib/models/LeaveRequest";
import { TaskModel } from "@/lib/models/Task";
import { workingDaysBetween } from "@/lib/hr";
import { LeadModel, type LeadPriority, type LeadSource, type LeadStage, type LeadType } from "@/lib/models/Lead";
import { TestModel } from "@/lib/models/Test";
import { QuestionModel } from "@/lib/models/Question";
import { AttemptModel } from "@/lib/models/Attempt";
import { ResultModel } from "@/lib/models/Result";
import { AssignmentModel } from "@/lib/models/Assignment";
import { SubmissionModel } from "@/lib/models/Submission";
import { NotificationModel } from "@/lib/models/Notification";
import { BatchModel } from "@/lib/models/Batch";
import { AttendanceModel } from "@/lib/models/Attendance";
import { CourseModel } from "@/lib/models/Course";
import { VendorModel } from "@/lib/models/Vendor";
import { ExpenseCategoryModel } from "@/lib/models/ExpenseCategory";
import { ExpenseModel } from "@/lib/models/Expense";
import { InvoiceModel } from "@/lib/models/Invoice";
import { PaymentModel } from "@/lib/models/Payment";
import { RefundModel } from "@/lib/models/Refund";
import { WaiverModel } from "@/lib/models/Waiver";
import { AuditLogModel } from "@/lib/models/AuditLog";
import { NoticeModel } from "@/lib/models/Notice";
import { MeetingModel } from "@/lib/models/Meeting";
import { CalendarEventModel } from "@/lib/models/CalendarEvent";
import type { Role } from "@/lib/models/User";

export interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: Role;
  employeeId?: string;
  admissionNo?: string;
  batch?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
  rollNo?: string;
  admissionDate?: string;
  branch?: string;
  course?: string;
  status?: "Active" | "Inactive";
  admissionStatus?: "Active" | "Pending" | "Graduated" | "Transferred";
  idProofType?: string;
  idProofNumber?: string;
  designation?: string;
  department?: string;
  joiningDate?: string;
  monthlySalary?: number;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "System Administrator",
    email: "admin@demo.auraedu.com",
    password: "Admin@123",
    role: "admin",
    employeeId: "EMP-0001",
  },
  {
    name: "Ritu Sharma",
    email: "staff@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0012",
    phone: "9820000012",
    designation: "Chemistry Faculty & Academic Coordinator",
    department: "Academics",
    joiningDate: "2023-06-01",
    monthlySalary: 68000,
  },
  {
    name: "Dr. Anil Verma",
    email: "anil.verma@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0005",
    phone: "9820000005",
    designation: "Senior Faculty — Physics",
    department: "Academics",
    joiningDate: "2021-04-12",
    monthlySalary: 85000,
  },
  {
    name: "Dr. Meenakshi Rao",
    email: "meenakshi.rao@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0008",
    phone: "9820000008",
    designation: "Faculty — Biology",
    department: "Academics",
    joiningDate: "2022-07-01",
    monthlySalary: 72000,
  },
  {
    name: "Prof. R. K. Gupta",
    email: "rk.gupta@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0003",
    phone: "9820000003",
    designation: "Head of Mathematics",
    department: "Academics",
    joiningDate: "2020-01-06",
    monthlySalary: 95000,
  },
  {
    name: "Kunal Mehta",
    email: "kunal.mehta@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0021",
    phone: "9820000021",
    designation: "Instructor — Python",
    department: "Technology",
    joiningDate: "2025-02-10",
    monthlySalary: 60000,
  },
  {
    name: "Neha Bhosale",
    email: "neha.bhosale@demo.auraedu.com",
    password: "Staff@123",
    role: "staff",
    employeeId: "EMP-0017",
    phone: "9820000017",
    designation: "Accounts Executive",
    department: "Finance",
    joiningDate: "2024-03-18",
    monthlySalary: 38000,
  },
  {
    name: "Aarav Sharma",
    email: "student@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0010",
    batch: "NEET Batch A",
    phone: "9876500001",
    gender: "Male",
    dateOfBirth: "2003-07-27",
    guardianName: "Rakesh Sharma",
    guardianPhone: "+91-9826012345",
    guardianEmail: "rakesh.sharma@example.com",
    address: { street: "Scheme No. 54, Vijay Nagar", city: "Indore", state: "Madhya Pradesh", pincode: "452010", country: "India" },
    rollNo: "R-1001",
    admissionDate: "2026-06-15",
    branch: "Main Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8896",
  },
  {
    name: "Priya Deshmukh",
    email: "priya.deshmukh@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0009",
    batch: "JEE Batch A",
    phone: "9876500002",
    gender: "Female",
    dateOfBirth: "2004-01-14",
    guardianName: "Sanjay Deshmukh",
    guardianPhone: "+91-9826012346",
    guardianEmail: "sanjay.deshmukh@example.com",
    address: { street: "Laxmi Nagar", city: "Nagpur", state: "Maharashtra", pincode: "440022", country: "India" },
    rollNo: "R-1002",
    admissionDate: "2026-06-18",
    branch: "Main Branch",
    course: "JEE Main & Advanced 2027",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8897",
  },
  {
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0007",
    batch: "NEET Batch A",
    phone: "9876500003",
    gender: "Male",
    dateOfBirth: "2003-11-02",
    guardianName: "Vikram Kulkarni",
    guardianPhone: "+91-9826012347",
    guardianEmail: "vikram.kulkarni@example.com",
    address: { street: "Kalbadevi Road", city: "Mumbai", state: "Maharashtra", pincode: "400002", country: "India" },
    rollNo: "R-1003",
    admissionDate: "2026-06-20",
    branch: "Mumbai Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8898",
  },
  {
    name: "Sneha Patil",
    email: "sneha.patil@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "STU-2026-1004",
    batch: "NEET Batch B",
    phone: "9876500004",
    gender: "Female",
    dateOfBirth: "2004-04-09",
    guardianName: "Mahesh Patil",
    guardianPhone: "+91-9826012348",
    guardianEmail: "mahesh.patil@example.com",
    address: { street: "Sadar Bazar", city: "Pune", state: "Maharashtra", pincode: "411001", country: "India" },
    rollNo: "R-1004",
    admissionDate: "2026-06-22",
    branch: "Main Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8899",
  },
  {
    name: "Aditya Joshi",
    email: "aditya.joshi@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "STU-2026-1005",
    batch: "NEET Batch B",
    phone: "9876500005",
    gender: "Male",
    dateOfBirth: "2004-08-21",
    guardianName: "Nitin Joshi",
    guardianPhone: "+91-9826012349",
    guardianEmail: "nitin.joshi@example.com",
    address: { street: "Gandhi Chowk", city: "Ahmedabad", state: "Gujarat", pincode: "380001", country: "India" },
    rollNo: "R-1005",
    admissionDate: "2026-06-24",
    branch: "Main Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8900",
  },
  {
    name: "Meera Iyer",
    email: "meera.iyer@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0006",
    batch: "NEET Batch A",
    phone: "9876500006",
    gender: "Female",
    dateOfBirth: "2003-12-03",
    guardianName: "Krishna Iyer",
    guardianPhone: "+91-9826012350",
    guardianEmail: "krishna.iyer@example.com",
    address: { street: "Mylapore", city: "Chennai", state: "Tamil Nadu", pincode: "600004", country: "India" },
    rollNo: "0006",
    admissionDate: "2026-06-25",
    branch: "Main Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8901",
  },
  {
    name: "Kabir Singh",
    email: "kabir.singh@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0005",
    batch: "JEE Batch A",
    phone: "9876500007",
    gender: "Male",
    dateOfBirth: "2004-02-17",
    guardianName: "Harvinder Singh",
    guardianPhone: "+91-9826012351",
    guardianEmail: "harvinder.singh@example.com",
    address: { street: "Model Town", city: "Ludhiana", state: "Punjab", pincode: "141002", country: "India" },
    rollNo: "0005",
    admissionDate: "2026-06-26",
    branch: "Main Branch",
    course: "JEE Main & Advanced 2027",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8902",
  },
  {
    name: "Ananya Rao",
    email: "ananya.rao@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0004",
    batch: "JEE Batch A",
    phone: "9876500008",
    gender: "Female",
    dateOfBirth: "2004-05-30",
    guardianName: "Sundeep Rao",
    guardianPhone: "+91-9826012352",
    guardianEmail: "sundeep.rao@example.com",
    address: { street: "Jubilee Hills", city: "Hyderabad", state: "Telangana", pincode: "500033", country: "India" },
    rollNo: "0004",
    admissionDate: "2026-06-27",
    branch: "Main Branch",
    course: "JEE Main & Advanced 2027",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8903",
  },
  {
    name: "Dev Verma",
    email: "dev.verma@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0003",
    batch: "NEET Batch A",
    phone: "9876500009",
    gender: "Male",
    dateOfBirth: "2003-09-11",
    guardianName: "Prakash Verma",
    guardianPhone: "+91-9826012353",
    guardianEmail: "prakash.verma@example.com",
    address: { street: "Civil Lines", city: "Jaipur", state: "Rajasthan", pincode: "302006", country: "India" },
    rollNo: "0003",
    admissionDate: "2026-06-28",
    branch: "Main Branch",
    course: "NEET Comprehensive 2026",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8904",
  },
  {
    name: "Ishita Nair",
    email: "ishita.nair@demo.auraedu.com",
    password: "Student@123",
    role: "student",
    admissionNo: "ADM-2026-0002",
    batch: "Python Programming",
    phone: "9876500010",
    gender: "Female",
    dateOfBirth: "2005-01-25",
    guardianName: "Rajesh Nair",
    guardianPhone: "+91-9826012354",
    guardianEmail: "rajesh.nair@example.com",
    address: { street: "Koramangala", city: "Bengaluru", state: "Karnataka", pincode: "560034", country: "India" },
    rollNo: "0002",
    admissionDate: "2026-07-01",
    branch: "Main Branch",
    course: "Python Programming",
    status: "Active",
    admissionStatus: "Active",
    idProofType: "Aadhar",
    idProofNumber: "5031 0555 8905",
  },
];

/**
 * Demo seed data — the entire reproducible demo world.
 *
 * Responsible for: 5 accounts (admin/staff/3 students, all `isDemo: true`),
 * 3 tests (one Active Biology drill with 10 questions incl. a multi-correct
 * MCQ and two written questions, two Completed MCQ-aggregate tests), attempts
 * and scorecard results so every screen in the demo has live data.
 *
 * Safety: only `isDemo` records are created here (and wiped by the demo
 * reset), never touching manually-created admin/student data.
 */
export async function seedDemoUsers(): Promise<Map<string, string>> {
  await connectDB();

  // Map<email, userId> so later seed sections can link tests/attempts to the
  // exact demo users that were just written.
  const ids = new Map<string, string>();

  for (const account of DEMO_ACCOUNTS) {
    // Cost 12 (bcrypt embeds the cost in the hash) — matches auth.ts. Cost is
    // bumped above the original seed 10 per the Phase A hardening.
    const passwordHash = await bcrypt.hash(account.password, 12);
    const user = await UserModel.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          passwordHash,
          role: account.role,
          employeeId: account.employeeId,
          admissionNo: account.admissionNo,
          batch: account.batch,
          phone: account.phone,
          gender: account.gender,
          dateOfBirth: account.dateOfBirth ? new Date(account.dateOfBirth) : undefined,
          guardianName: account.guardianName,
          guardianPhone: account.guardianPhone,
          guardianEmail: account.guardianEmail,
          address: account.address,
          rollNo: account.rollNo,
          admissionDate: account.admissionDate ? new Date(account.admissionDate) : undefined,
          branch: account.branch,
          course: account.course,
          status: account.status ?? "Active",
          admissionStatus: account.admissionStatus ?? "Active",
          idProofType: account.idProofType,
          idProofNumber: account.idProofNumber,
          designation: account.designation,
          department: account.department,
          joiningDate: account.joiningDate ? new Date(account.joiningDate) : undefined,
          monthlySalary: account.monthlySalary,
          lastLoginAt: undefined,
          isDemo: true,
          mustChangePassword: false,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    ids.set(account.email, String(user._id));
  }

  return ids;
}

const NEET = "NEET Comprehensive 2026";
const BATCH = "NEET Batch A";
const JEE = "JEE Main & Advanced 2027";

/* ------------------------------------------------------------------ */
/* Batches (cohorts)                                                    */
/* ------------------------------------------------------------------ */

/**
 * The 4 batches the demo already assigns students into (strings on users).
 *
 * Upserted by name so the student↔batch string join stays in exact sync across
 * reseeds — every derived view (test combobox, filters, enrollment counts)
 * reads `users.batch` and joins to these docs by name.
 */
export async function seedDemoBatches(): Promise<void> {
  await connectDB();
  const admin = await UserModel.findOne({ role: "admin" }).lean();

  const batches: {
    name: string;
    course: string;
    capacity: number;
    startDate: string;
    endDate: string;
    description: string;
  }[] = [
    {
      name: BATCH,
      course: NEET,
      capacity: 60,
      startDate: "2026-06-15",
      endDate: "2027-04-30",
      description:
        "NEET Comprehensive 2026 flagship cohort — Aarav, Rohan, Meera and Dev. Full-syllabus track with live drills and weekly worksheets.",
    },
    {
      name: "NEET Batch B",
      course: NEET,
      capacity: 40,
      startDate: "2026-06-22",
      endDate: "2027-04-30",
      description: "Second NEET cohort (Sneha, Aditya) — same curriculum, later intake.",
    },
    {
      name: "JEE Batch A",
      course: JEE,
      capacity: 60,
      startDate: "2026-06-18",
      endDate: "2027-03-31",
      description: "JEE Main & Advanced 2027 cohort — Priya, Kabir and Ananya.",
    },
    {
      name: "Python Programming",
      course: "Python Programming",
      capacity: 30,
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      description: "Skill course batch — Ishita. Intro to Python, 6-month track.",
    },
  ];

  for (const b of batches) {
    await BatchModel.findOneAndUpdate(
      { name: b.name },
      {
        $set: {
          course: b.course,
          capacity: b.capacity,
          startDate: new Date(`${b.startDate}T00:00:00`),
          endDate: new Date(`${b.endDate}T00:00:00`),
          description: b.description,
          createdBy: admin?._id,
        },
      },
      { upsert: true, returnDocument: "after" },
    );
  }
}

export async function seedDemoTests(): Promise<void> {
  await connectDB();
  const userIds = await seedDemoUsers();

  // Fresh attempts/results every seed — stale answers would reference
  // questions that were re-created with new _ids.
  await AttemptModel.deleteMany({});
  await ResultModel.deleteMany({});

  // Ensure an admin exists for createdBy (fall back to the first seeded user).
  const admin = await UserModel.findOne({ role: "admin" }).lean();
  const createdBy = admin?._id ?? new mongoose.Types.ObjectId(userIds.values().next().value);

  const now = new Date();

  // Active test the demo student can actually take.
  const active = await TestModel.findOneAndUpdate(
    { title: "Biology Speed Drill - Genetics & Evolution" },
    {
      $set: {
        title: "Biology Speed Drill - Genetics & Evolution",
        subject: "Biology",
        course: NEET,
        batch: BATCH,
        description:
          "Timed online drill covering Genetics, Mendelian inheritance and evolution. MCQ auto-graded instantly; written answers are evaluated by faculty.",
        durationMinutes: 60,
        totalMarks: 48,
        passMarks: 19,
        startAt: new Date(now.getTime() - 60 * 60 * 1000),
        endAt: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        status: "active",
        createdBy,
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  const activeQuestions = [
    {
      type: "mcq" as const,
      text: "In Mendelian monohybrid cross, what is the genotypic ratio of the F2 generation?",
      options: ["3:1", "1:2:1", "9:3:3:1", "1:1"],
      correctIndices: [1],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "Which enzyme acts as a molecular scissor during DNA replication?",
      options: ["Ligase", "Topoisomerase", "Helicase", "Primase"],
      correctIndices: [2],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "The phenotypic ratio of a dihybrid cross is:",
      options: ["9:3:3:1", "3:1", "1:1:1:1", "1:2:1"],
      correctIndices: [0],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "A recessive trait appears when the individual is:",
      options: ["Homozygous dominant", "Heterozygous", "Homozygous recessive", "Hemizygous"],
      correctIndices: [2],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "Which of the following are direct sources of genetic variation in populations? (Select all that apply)",
      options: ["Natural selection", "Mutation", "Genetic drift", "Gene flow"],
      correctIndices: [1, 2, 3],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "In the Hardy-Weinberg equilibrium, the allele frequencies remain constant in the absence of:",
      options: ["Random mating", "Large population size", "Evolutionary forces", "Mendelian inheritance"],
      correctIndices: [2],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "Okazaki fragments are short DNA segments synthesized on the:",
      options: ["Leading strand", "Lagging strand", "Template strand", "Coding strand"],
      correctIndices: [1],
      marks: 4,
    },
    {
      type: "mcq" as const,
      text: "The specific sequence of nucleotides recognised by restriction endonucleases is called the:",
      options: ["Operator site", "Recognition site", "Promoter site", "Sticky end"],
      correctIndices: [1],
      marks: 4,
    },
    {
      type: "written" as const,
      text: "Explain briefly how a single gene can give rise to multiple phenotypes, with one universally cited example.",
      options: [],
      correctIndices: [],
      marks: 8,
    },
    {
      type: "written" as const,
      text: "Describe the role of genetic drift in small, isolated populations and contrast it with gene flow.",
      options: [],
      correctIndices: [],
      marks: 8,
    },
  ];

  await QuestionModel.deleteMany({ testId: active._id });
  for (const [i, q] of activeQuestions.entries()) {
    await QuestionModel.create({
      testId: active._id,
      type: q.type,
      text: q.text,
      options: q.options,
      correctIndices: q.correctIndices,
      marks: q.marks,
      order: i + 1,
    });
  }

  // Two previously completed tests so report cards and admin stats have data.
  const completed = [
    {
      title: "Physics Mechanics Part 1 Assessment",
      subject: "Physics",
      durationMinutes: 180,
      totalMarks: 360,
      passMarks: 144,
      daysAgo: 12,
    },
    {
      title: "Chemistry Equilibrium & Kinetics Test",
      subject: "Chemistry",
      durationMinutes: 180,
      totalMarks: 360,
      passMarks: 144,
      daysAgo: 35,
    },
  ];

  const aarav = userIds.get("student@demo.auraedu.com");
  const rohan = userIds.get("rohan.kulkarni@demo.auraedu.com");

  const completedTests = await Promise.all(
    completed.map(async (c) => {
      const test = await TestModel.findOneAndUpdate(
        { title: c.title },
        {
          $set: {
            title: c.title,
            subject: c.subject,
            course: NEET,
            batch: BATCH,
            description: `${c.subject} term assessment with previous-year-sourced questions.`,
            durationMinutes: c.durationMinutes,
            totalMarks: c.totalMarks,
            passMarks: c.passMarks,
            startAt: new Date(now.getTime() - c.daysAgo * 24 * 60 * 60 * 1000),
            endAt: new Date(now.getTime() - (c.daysAgo - 1) * 24 * 60 * 60 * 1000),
            status: "completed",
            createdBy,
          },
        },
        { upsert: true, returnDocument: "after" },
      );
      await QuestionModel.deleteMany({ testId: test._id });
      return test;
    }),
  );

  if (aarav && rohan) {
    // Completed fully-graded attempts (MCQ only) + results for report cards.
    const [phy, chem] = completedTests;

    await AttemptModel.findOneAndUpdate(
      { testId: phy._id, userId: aarav },
      {
        $set: {
          testId: phy._id,
          userId: aarav,
          studentName: "Aarav Sharma",
          batch: BATCH,
          attemptNumber: 1,
          status: "submitted",
          startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          deadlineAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          answers: [],
          mcqScore: 335,
          writtenScore: 0,
          score: 335,
        },
      },
      { upsert: true },
    );
    await ResultModel.findOneAndUpdate(
      { testId: phy._id, userId: aarav },
      {
        $set: {
          testId: phy._id,
          userId: aarav,
          attemptId: new mongoose.Types.ObjectId(),
          title: "Physics Mechanics Part 1 Assessment",
          batch: BATCH,
          totalMarks: 360,
          obtained: 335,
          mcqScore: 335,
          writtenScore: 0,
          fullyGraded: true,
          submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true },
    );

    await AttemptModel.findOneAndUpdate(
      { testId: chem._id, userId: aarav },
      {
        $set: {
          testId: chem._id,
          userId: aarav,
          studentName: "Aarav Sharma",
          batch: BATCH,
          attemptNumber: 1,
          status: "submitted",
          startedAt: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000),
          deadlineAt: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000),
          answers: [],
          mcqScore: 342,
          writtenScore: 0,
          score: 342,
        },
      },
      { upsert: true },
    );
    await ResultModel.findOneAndUpdate(
      { testId: chem._id, userId: aarav },
      {
        $set: {
          testId: chem._id,
          userId: aarav,
          attemptId: new mongoose.Types.ObjectId(),
          title: "Chemistry Equilibrium & Kinetics Test",
          batch: BATCH,
          totalMarks: 360,
          obtained: 342,
          mcqScore: 342,
          writtenScore: 0,
          fullyGraded: true,
          submittedAt: new Date(now.getTime() - 33 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true },
    );

    await AttemptModel.findOneAndUpdate(
      { testId: phy._id, userId: rohan },
      {
        $set: {
          testId: phy._id,
          userId: rohan,
          studentName: "Rohan Kulkarni",
          batch: BATCH,
          attemptNumber: 1,
          status: "submitted",
          startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          deadlineAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          answers: [],
          mcqScore: 108,
          writtenScore: 0,
          score: 108,
        },
      },
      { upsert: true },
    );
    await ResultModel.findOneAndUpdate(
      { testId: phy._id, userId: rohan },
      {
        $set: {
          testId: phy._id,
          userId: rohan,
          attemptId: new mongoose.Types.ObjectId(),
          title: "Physics Mechanics Part 1 Assessment",
          batch: BATCH,
          totalMarks: 360,
          obtained: 108,
          mcqScore: 108,
          writtenScore: 0,
          fullyGraded: true,
          submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
      },
      { upsert: true },
    );
  }

  await TestModel.deleteMany({
    _id: { $nin: [active._id, ...completedTests.map((t) => t._id)] },
  });
}

export async function seedDemoCourses(): Promise<void> {
  const students = await UserModel.find({ role: "student" }).select("course name").lean();

  const enrolledFor = (needle: string) =>
    students
      .filter((s) => (s.course ?? "").toLowerCase().includes(needle))
      .map((s) => s._id);

  const le = (title: string, type: "video" | "document" | "quiz", url: string, duration: string) => ({
    id: title.slice(0, 3).toUpperCase() + "-" + type.slice(0, 2) + "-" + url.replace(/[^a-zA-Z0-9]/g, ""),
    title,
    type,
    url,
    duration,
  });

  const courses = [
    {
      title: "NEET Comprehensive 2026",
      code: "NEET-MED-2026",
      category: "Medical Entrance",
      description:
        "Complete NEET 2026 preparation covering the full Physics, Chemistry and Biology syllabus with deep concept videos, chapter-wise PYQ practice and mock-test strategy.",
      instructor: "Dr. A. Verma & Team",
      duration: "1 Year Full-Time",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      published: true,
      isPaid: true,
      price: 5000,
      originalPrice: 12000,
      level: "Advanced Dropper Level",
      badge: "BESTSELLER",
      rating: 4.9,
      reviewsCount: 340,
      features: [
        "460+ hours of HD video lectures by IIT/PhD faculty",
        "Chapter-wise topic tests after every module",
        "AI-generated daily revision planner",
        "Offline notes + recorded lectures for every class",
        "12 live doubt-clearing sessions each week",
        "Monthly parent-teacher progress reports",
        "Access to full test series worth ₹8,000",
      ],
      modules: [
        {
          id: "mod-phy",
          title: "Physics",
          lessons: [
            le("Kinematics & Mechanics", "video", "youtu.be/neet-phy-km", "52:10"),
            le("Thermodynamics", "video", "youtu.be/neet-phy-thermo", "41:22"),
            le("Optics & Modern Physics PYQ Drive", "quiz", "tests/neet-phy-optics", "1:30:00"),
          ],
        },
        {
          id: "mod-chem",
          title: "Chemistry",
          lessons: [
            le("Physical Chemistry Foundations", "video", "youtu.be/neet-chem-pc", "48:05"),
            le("Organic Mechanisms Handwritten Notes", "document", "notes/neet-chem-org", "12 pages"),
            le("Inorganic Coordination Compounds", "video", "youtu.be/neet-chem-icc", "39:48"),
          ],
        },
        {
          id: "mod-bio",
          title: "Biology",
          lessons: [
            le("Cell Biology & Genetics", "video", "youtu.be/neet-bio-cell", "55:30"),
            le("Plant Physiology Diagram Pack", "document", "docs/neet-bio-plant", "18 pages"),
            le("Human Anatomy & Rapid Revision", "quiz", "tests/neet-bio-anatomy", "1:15:00"),
          ],
        },
      ],
    },
    {
      title: "JEE Main & Advanced Mathematics Crash Course",
      code: "JEE-MATH-2026",
      category: "Engineering Entrance",
      description:
        "Six-month mathematics crash for JEE Main & Advanced — every topic from calculus to coordinate geometry with shortcuts, PYQs and full-length sectional tests.",
      instructor: "Prof. R. K. Gupta",
      duration: "6 Months",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      published: true,
      isPaid: true,
      price: 4999,
      originalPrice: 9999,
      level: "Target Top 1000",
      badge: "POPULAR",
      rating: 4.8,
      reviewsCount: 210,
      features: [
        "200+ hours of problem-solving sessions",
        "Concept notes for every chapter",
        "Daily practice problem sets (DPPs)",
        "Sectional full-length tests with AIR prediction",
        "Doubt support within 4 working hours",
        "Past 15 years PYQ bank with solutions",
      ],
      modules: [
        {
          id: "mod-calc",
          title: "Calculus",
          lessons: [
            le("Limits, Continuity & Differentiability", "video", "youtu.be/jee-calc-lcd", "1:02:00"),
            le("Definite Integrals", "video", "youtu.be/jee-calc-integral", "47:15"),
            le("Differential Equations DPP", "document", "dpp/jee-calc-de", "6 sets"),
          ],
        },
        {
          id: "mod-alg",
          title: "Algebra",
          lessons: [
            le("Complex Numbers", "video", "youtu.be/jee-alg-complex", "38:40"),
            le("Matrices & Determinants", "video", "youtu.be/jee-alg-matrix", "44:09"),
            le("Permutations & Combinations Level Up", "quiz", "tests/jee-alg-pnc", "1:00:00"),
          ],
        },
        {
          id: "mod-geo",
          title: "Geometry & Vectors",
          lessons: [
            le("Coordinate Geometry", "video", "youtu.be/jee-geo-coord", "51:00"),
            le("Vectors & 3D Geometry", "document", "notes/jee-geo-3d", "15 pages"),
          ],
        },
      ],
    },
    {
      title: "MERN Stack Web Development Specialization",
      code: "CS-MERN-101",
      category: "Computer Science",
      description:
        "One specialization to build full-stack products: React, Next.js and a Node/MongoDB API, capped with a JWT-secured capstone project you can ship.",
      instructor: "Instructor Team",
      duration: "3 Months",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      published: true,
      isPaid: true,
      price: 1,
      originalPrice: 4999,
      level: "Beginner to Advanced",
      badge: "FLASH OFFER ₹1",
      rating: 4.95,
      reviewsCount: 520,
      features: [
        "Hands-on project-first curriculum",
        "React, Next.js App Router, MongoDB and Node.js",
        "Weekly code-review of your pushes",
        "Capstone: a JWT-secured full-stack web app",
        "Certificate of completion awarded at the end",
        "Community + 1:1 mentorship calls",
      ],
      modules: [
        {
          id: "mod-fe",
          title: "Frontend",
          lessons: [
            le("React Hooks & Context API", "video", "youtu.be/mern-fe-hooks", "49:20"),
            le("Next.js App Router", "video", "youtu.be/mern-fe-next", "41:45"),
            le("TailwindCSS Styling", "document", "docs/mern-fe-tailwind", "10 pages"),
          ],
        },
        {
          id: "mod-be",
          title: "Backend",
          lessons: [
            le("Node.js Server Architecture", "video", "youtu.be/mern-be-node", "46:10"),
            le("MongoDB Aggregation & Schemas", "video", "youtu.be/mern-be-mongo", "52:33"),
            le("JWT Security Hands-on", "quiz", "tests/mern-be-jwt", "1:10:00"),
          ],
        },
      ],
    },
  ];

  let seeded = 0;
  for (const c of courses) {
    const existing = await CourseModel.findOne({ code: c.code }).select("_id").lean();
    if (existing) {
      await CourseModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            title: c.title,
            category: c.category,
            description: c.description,
            instructor: c.instructor,
            duration: c.duration,
            thumbnail: c.thumbnail,
            published: c.published,
            isPaid: c.isPaid,
            price: c.price,
            originalPrice: c.originalPrice,
            level: c.level,
            badge: c.badge,
            rating: c.rating,
            reviewsCount: c.reviewsCount,
            features: c.features,
            modules: c.modules,
          },
        },
      );
    } else {
      await CourseModel.create({
        ...c,
        code: c.code,
        enrolledStudents: [],
        reviewsCount: c.reviewsCount,
        modules: c.modules,
      });
    }
    seeded += 1;
  }

  const cohort: Record<string, string[]> = {
    "NEET-MED-2026": ["neet"],
    "JEE-MATH-2026": ["jee"],
    "CS-MERN-101": ["mern", "cs"],
  };
  for (const c of courses) {
    const ids = cohort[c.code].flatMap((needle) => enrolledFor(needle));
    await CourseModel.updateOne({ code: c.code }, { $set: { enrolledStudents: ids } });
  }

  console.log(`[seed] courses=${seeded} (curriculum + storefront, upserted by code)`);
}

export async function seedDemoData(): Promise<void> {
  await connectDB();
  await seedDemoBatches();
  await seedDemoTests();
  await seedDemoTimetable();
  await seedDemoLeave();
  await seedDemoTasks();
  await seedDemoAssignments();
  await seedDemoAttendance();
  await seedDemoCourses();
  await seedDemoProgress();
  await seedDemoLoginState();
  await seedDemoLeads();
  await seedDemoFinance();
  await seedDemoConnect();
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/* ------------------------------------------------------------------ */
/* Assignments (online worksheets + reminder notifications)             */
/* ------------------------------------------------------------------ */

interface SeedQuestion {
  text: string;
  marks: number;
}

const NEET_ASSIGNMENTS: {
  title: string;
  subject: string;
  course: string;
  description: string;
  dueDays: number;
  batch: string;
  questions: SeedQuestion[];
}[] = [
  {
    title: "Chapter Worksheet: Chemical Bonding",
    subject: "Chemistry",
    course: NEET,
    description:
      "Short-answer practice covering ionic, covalent and metallic bonding. Revise VSEPR theory before starting.",
    dueDays: 2,
    batch: BATCH,
    questions: [
      { text: "Distinguish between ionic and covalent bonds with one example each.", marks: 5 },
      { text: "Using VSEPR theory, predict the geometry of NH3 and explain the bond angle (~107°).", marks: 5 },
      { text: "Why are ionic compounds generally brittle in the solid state?", marks: 5 },
      { text: "Arrange O2, N2 and F2 in increasing bond order and justify.", marks: 5 },
    ],
  },
  {
    title: "Practice Sheet: Human Physiology",
    subject: "Biology",
    course: NEET,
    description:
      "A quick worksheet on the digestive and respiratory systems. Answer in your own words — keywords will be checked by faculty.",
    dueDays: 1,
    batch: BATCH,
    questions: [
      { text: "List the sequence of organs food passes through in the alimentary canal.", marks: 5 },
      { text: "Explain the role of villi in the small intestine.", marks: 5 },
      { text: "Compare inhalation and exhalation in terms of ribcage and diaphragm movement.", marks: 5 },
      { text: "Which enzyme acts on fats, where is it produced, and how is it activated?", marks: 5 },
    ],
  },
  {
    title: "Physics Worksheet: Laws of Motion",
    subject: "Physics",
    course: NEET,
    description:
      "Concept-check worksheet on Newton's laws and friction. Show the reasoning for at least two answers.",
    dueDays: 3,
    batch: BATCH,
    questions: [
      { text: "State Newton's second law and write its mathematical form.", marks: 5 },
      { text: "A 2 kg mass accelerates at 3 m/s². Find the net force acting on it.", marks: 5 },
      { text: "Explain why a passenger lurches forward when a moving bus brakes suddenly.", marks: 5 },
    ],
  },
  {
    title: "Quick Sheet: Reproduction in Organisms",
    subject: "Biology",
    course: NEET,
    description:
      "Overdue practice sheet — one-line answers only. Already graded for students who submitted.",
    dueDays: -2,
    batch: BATCH,
    questions: [
      { text: "Define asexual reproduction and give any two examples.", marks: 5 },
      { text: "What is double fertilization in angiosperms?", marks: 5 },
      { text: "Distinguish between pollination and fertilisation.", marks: 5 },
      { text: "Name the male and female gametes in humans and their site of production.", marks: 5 },
    ],
  },
  {
    title: "Worksheet: Newton's Laws of Motion",
    subject: "Physics",
    course: "JEE Main & Advanced 2027",
    description:
      "JEE-level practice on laws of motion with free-body reasoning.",
    dueDays: 4,
    batch: "JEE Batch A",
    questions: [
      { text: "Derive F = ma from the rate of change of momentum.", marks: 5 },
      { text: "A 1.5 kg block slides on a frictionless 30° incline. Find its acceleration (g = 10 m/s²).", marks: 5 },
      { text: "State action–reaction and give a non-contact example.", marks: 5 },
      { text: "A lift of mass 400 kg moves upward at 2 m/s². Find the tension in its cable (g = 10 m/s²).", marks: 5 },
    ],
  },
  {
    title: "Practice: Quadratic Equations",
    subject: "Mathematics",
    course: "JEE Main & Advanced 2027",
    description:
      "Overdue worksheet — solve and show the discriminant step for each problem.",
    dueDays: -1,
    batch: "JEE Batch A",
    questions: [
      { text: "Find the roots of x² − 5x + 6 = 0 by factorisation.", marks: 5 },
      { text: "For what value of k does x² + kx + 9 = 0 have real and equal roots?", marks: 5 },
      { text: "Write the sum and product of roots of 2x² − 4x − 7 = 0.", marks: 5 },
      { text: "Solve 2x² + 3x − 2 = 0 using the quadratic formula.", marks: 5 },
    ],
  },
];

/**
 * Worksheets + their submissions + the student reminder feed, all as real docs.
 *
 * Submissions and notifications are wiped and rebuilt every seed (their _ids
 * mean nothing to the UI). Assignments are upserted by (title, batch) so
 * submissions keep pointing at stable worksheet ids across reseeds.
 */
export async function seedDemoAssignments(): Promise<void> {
  await connectDB();
  const userIds = await seedDemoUsers();

  await SubmissionModel.deleteMany({});
  await NotificationModel.deleteMany({});

  const admin = await UserModel.findOne({ role: "admin" }).lean();
  const createdBy = admin?._id ?? new mongoose.Types.ObjectId(userIds.values().next().value);

  const neetStudents = await UserModel.find({ role: "student", batch: BATCH }).sort({ name: 1 }).lean();
  const jeeStudents = await UserModel.find({ role: "student", batch: "JEE Batch A" }).sort({ name: 1 }).lean();

  const byTitle = new Map<
    string,
    { _id: unknown; title: string; batch: string; questions: { text: string; marks: number }[] }
  >();
  const submissions: Record<string, unknown>[] = [];

  for (const def of NEET_ASSIGNMENTS) {
    const totalMarks = def.questions.reduce((sum, q) => sum + q.marks, 0);
    const dueDate = new Date(Date.now() + def.dueDays * DAY);
    const doc = await AssignmentModel.findOneAndUpdate(
      { title: def.title, batch: def.batch },
      {
        $set: {
          title: def.title,
          subject: def.subject,
          course: def.course,
          batch: def.batch,
          description: def.description,
          totalMarks,
          dueDate,
          questions: def.questions.map((q) => ({ text: q.text, marks: q.marks })),
          createdBy,
        },
      },
{ upsert: true, returnDocument: "after" },
      );
    byTitle.set(def.title, {
      _id: doc._id,
      title: def.title,
      batch: doc.batch,
      questions: doc.questions.map((q) => ({ text: q.text, marks: q.marks })),
    });
  }

  const assignment = (title: string) => byTitle.get(title)!;
  const neetOthers = neetStudents.filter((s) => s.email !== "student@demo.auraedu.com" && s.email !== "rohan.kulkarni@demo.auraedu.com");
  const jeeOthers = jeeStudents.filter((s) => s.email !== "priya.deshmukh@demo.auraedu.com");

  const reviewed = (a: ReturnType<typeof assignment>, student: { _id: unknown; name: string }, marks: number, verdict: "complete" | "needs_work", note: string, submittedDays: number) =>
    submissions.push({
      assignmentId: a._id,
      userId: student._id,
      studentName: student.name,
      batch: a.batch,
      answers: a.questions.map((q: { text: string }) => `Answer for: ${q.text}`),
      submittedAt: new Date(Date.now() - submittedDays * DAY),
      status: "reviewed",
      marks,
      verdict,
      note,
      reviewedBy: createdBy,
      reviewedAt: new Date(Date.now() - 2 * DAY),
    });
  const pending = (a: ReturnType<typeof assignment>, student: { _id: unknown; name: string }, hoursBack: number) =>
    submissions.push({
      assignmentId: a._id,
      userId: student._id,
      studentName: student.name,
      batch: a.batch,
      answers: a.questions.map((q: { text: string }) => `Answer for: ${q.text}`),
      submittedAt: new Date(Date.now() - hoursBack * HOUR),
      status: "pending_review",
      marks: null,
      verdict: null,
      note: "",
      reviewedBy: null,
      reviewedAt: null,
    });
  const studentById = (email: string) =>
    neetStudents.find((s) => s.email === email) ?? jeeStudents.find((s) => s.email === email) ?? neetStudents[0];

  const aarav = studentById("student@demo.auraedu.com");
  const rohan = studentById("rohan.kulkarni@demo.auraedu.com");
  const priya = studentById("priya.deshmukh@demo.auraedu.com");

  // Demo student (aarav): submitted-and-reviewed on the overdue sheet, pending on
  // Chemical Bonding, not yet attempted on Human Physiology + Laws of Motion.
  reviewed(assignment("Quick Sheet: Reproduction in Organisms"), aarav, 14, "complete", "Good attempt. Revise double fertilization and its phases.", 3);
  pending(assignment("Chapter Worksheet: Chemical Bonding"), aarav, 10);
  pending(assignment("Practice Sheet: Human Physiology"), rohan, 6);
  reviewed(assignment("Quick Sheet: Reproduction in Organisms"), rohan, 17, "complete", "Very neat handwriting and clean reasoning. Keep it up.", 3);
  if (neetOthers[0]) pending(assignment("Practice Sheet: Human Physiology"), neetOthers[0], 5);
  if (neetOthers[1]) pending(assignment("Practice Sheet: Human Physiology"), neetOthers[1], 8);
  if (neetOthers[2]) pending(assignment("Chapter Worksheet: Chemical Bonding"), neetOthers[2], 20);
  if (neetOthers[3]) reviewed(assignment("Quick Sheet: Reproduction in Organisms"), neetOthers[3], 9, "needs_work", "Revise the difference between pollination and fertilisation.", 3);

  // JEE side: priya pending on both live sheets so there is grading tail to show.
  pending(assignment("Worksheet: Newton's Laws of Motion"), priya, 6);
  pending(assignment("Practice: Quadratic Equations"), priya, 12);
  if (jeeOthers[0]) pending(assignment("Worksheet: Newton's Laws of Motion"), jeeOthers[0], 4);
  if (jeeOthers[1]) pending(assignment("Practice: Quadratic Equations"), jeeOthers[1], 2);

  await SubmissionModel.insertMany(submissions);

  // Student notification feed — the legacy hub items become real docs, plus one
  // genuine "new assignment" reminder for the due-soon worksheet.
  const notifications: Record<string, unknown>[] = [
    {
      userId: aarav._id,
      title: "Fee Reminder - ₹5,001 Outstanding",
      message:
        "Your 2nd installment for NEET Batch is pending. Please pay by end of this week to avoid late fee penalties.",
      category: "Payments",
      sender: "Finance Dept (Accounts)",
      important: true,
      read: false,
      link: "/student-portal/fees",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(Date.now() - 3 * HOUR),
    },
    {
      userId: aarav._id,
      title: "Mock Test Scheduled: Organic Chemistry",
      message:
        "Grand Mock Test #4 will be live on Sunday at 10:00 AM. Syllabus covers Hydrocarbons & Biomolecules.",
      category: "Tests",
      sender: "Academic Controller",
      important: false,
      read: false,
      link: "/student-portal/tests",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(Date.now() - 6 * HOUR),
    },
    {
      userId: aarav._id,
      title: "New Assignment Uploaded: Physics Mechanics",
      message:
        "Laws of Motion worksheet is now active in your portal. Submission due: deadline on the assignment card.",
      category: "Assignments",
      sender: "Prof. S. Sharma",
      important: false,
      read: true,
      link: `/student-portal/assignments/${String(assignment("Physics Worksheet: Laws of Motion")._id)}`,
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(Date.now() - 30 * HOUR),
    },
    {
      userId: aarav._id,
      title: "Attendance Recorded: Present",
      message: "Your attendance for today's Biology & revision session has been recorded. Keep the streak going!",
      category: "Attendance",
      sender: "Academic Office",
      important: false,
      read: true,
      link: "/student-portal/attendance",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(Date.now() - 32 * HOUR),
    },
    {
      userId: aarav._id,
      title: "Certificate Generated: Basic Biology Fundamentals",
      message:
        "Congratulations! Your completion certificate for Biology Foundations module is ready for download.",
      category: "Certificates",
      sender: "Certification Cell",
      important: false,
      read: true,
      link: "/student-portal/certificates",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(2026, 7, 9, 18, 20),
    },
    {
      userId: aarav._id,
      title: `New Assignment: ${assignment("Practice Sheet: Human Physiology").title}`,
      message: `Worksheet "${assignment("Practice Sheet: Human Physiology").title}" is live for ${BATCH}. Submission deadline is tomorrow. Solve it from the Assignments tab.`,
      category: "Assignments",
      sender: "Academic Cell",
      important: false,
      read: false,
      link: `/student-portal/assignments/${String(assignment("Practice Sheet: Human Physiology")._id)}`,
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
      createdAt: new Date(Date.now() - HOUR),
    },
  ];
  await NotificationModel.insertMany(notifications);

  console.log(`[seed] assignments=${NEET_ASSIGNMENTS.length} submissions=${submissions.length} notifications=${notifications.length}.`);
}

/* ------------------------------------------------------------------ */
/* Attendance (daily per-batch registers)                               */
/* ------------------------------------------------------------------ */

/** Session labels rotate per batch across the seeded days (single session/day). */
const ATTENDANCE_SUBJECTS: Record<string, string[]> = {
  "NEET Batch A": ["Physics & Chemistry", "Botany & Zoology", "Organic Chemistry Drill", "Human Physiology", "Physics & Chemistry"],
  "NEET Batch B": ["Biology Lecture", "Chemistry Class", "Physics Class", "Biology Practice", "Chemistry Class"],
  "JEE Batch A": ["Mathematics Drill", "Physics Mechanics", "Chemistry Practice", "Physics Practice", "Mathematics Drill"],
  "Python Programming": ["Python Core", "Python Practice", "Python Projects", "Data Structures 101", "Python Core"],
};

/** Local date helpers — registers are keyed by local midnight (same timezone). */
const isoDay = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const dayStart = (iso: string) => new Date(`${iso}T00:00:00`);

/** The `count` most recent weekdays (skipping Sundays) in ascending order. */
function lastWeekdays(count: number): Date[] {
  const dates: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (dates.length < count) {
    if (d.getDay() !== 0) dates.push(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return dates.reverse();
}

/**
 * Five weekday registers per batch (the "light seed" choice).
 *
 * The roster is read live from `users.batch` (never stored in the register), so
 * the seed always matches the actual enrolled students. The demo login
 * (student@demo) is kept Present 5/5 to honestly back the dashboard's 100% —
 * everyone else gets a deterministic sprinkle of Absent/Late marks so the admin
 * register and month stats look real without any randomness.
 *
 * Registers are upserted by (batch, date), so re-seeding is idempotent and the
 * Reset-Demo button leaves manually-marked days on other dates untouched.
 */
export async function seedDemoAttendance(): Promise<void> {
  await connectDB();
  const admin = await UserModel.findOne({ role: "admin" }).lean();
  const students = await UserModel.find({ role: "student" }).sort({ name: 1 }).lean();

  const byBatch = new Map<string, typeof students>();
  for (const s of students) {
    const name = s.batch?.trim();
    if (!name) continue;
    const list = byBatch.get(name) ?? [];
    list.push(s);
    byBatch.set(name, list);
  }

  const days = lastWeekdays(5);
  let registers = 0;

  for (const [batch, roster] of byBatch) {
    const subjects = ATTENDANCE_SUBJECTS[batch] ?? ["Regular Session"];
    for (const [i, day] of days.entries()) {
      const date = dayStart(isoDay(day));
      const subject = subjects[i % subjects.length];
      const entries = roster.map((s, p) => {
        // The demo login stays perfect every day — this is the account a visitor
        // actually uses, and it matches the "100% attendance" story on the dashboard.
        if (s.email === "student@demo.auraedu.com") {
          return {
            studentId: s._id,
            status: "present" as const,
            checkIn: `08:5${i % 5} AM`,
            remark: "Regular Attendance",
          };
        }

        if (roster.length > 1) {
          // Rotate one interesting mark per day onto the student at slot p.
          if (i % roster.length === p) {
            if (i % 2 === 1) {
              return { studentId: s._id, status: "absent" as const, checkIn: "", remark: "Absent without intimation" };
            }
            return { studentId: s._id, status: "late" as const, checkIn: `09:0${(p % 5) + 1} AM`, remark: "Marked late — arrived during revision" };
          }
        } else if (i === 3) {
          // Single-student batches: one late in the week instead of nothing.
          return { studentId: s._id, status: "late" as const, checkIn: "09:05 AM", remark: "Marked late — joined after lunch break" };
        }

        return {
          studentId: s._id,
          status: "present" as const,
          checkIn: `08:4${5 + ((i * 2 + p) % 5)} AM`,
          remark: "Regular Attendance",
        };
      });

      await AttendanceModel.findOneAndUpdate(
        { batch, date },
        {
          $set: {
            batch,
            date,
            subject,
            entries,
            updatedBy: admin?._id,
          },
        },
        { upsert: true },
      );
      registers += 1;
    }
  }

  console.log(`[seed] attendance registers=${registers} across ${byBatch.size} batches (5 weekdays each).`);
}

/**
 * Demo accounts that start out blocked, so the Student Logins page can show
 * the Block/Unblock flow. Login *history* is never seeded any more: the
 * `sessions` collection is written only by real sign-ins (auth.ts).
 */
const BLOCKED_DEMO_STUDENTS = ["ananya.rao@demo.auraedu.com", "dev.verma@demo.auraedu.com"];

/** Resets per-student login state (block flag + lockout counters) for a clean demo. */
export async function seedDemoLoginState(): Promise<void> {
  await connectDB();
  await UserModel.updateMany(
    { isDemo: true },
    { $set: { isBlocked: false, failedAttempts: 0, lockoutUntil: null } },
  );
  // Clean slate for the Logins screen; real sign-ins repopulate these.
  await UserModel.updateMany(
    { isDemo: true, role: "student" },
    { $unset: { lastLoginAt: "", lastDevice: "" } },
  );
  await UserModel.updateMany(
    { email: { $in: BLOCKED_DEMO_STUDENTS } },
    { $set: { isBlocked: true } },
  );
  console.log(`[seed] login state: ${BLOCKED_DEMO_STUDENTS.length} demo students blocked; no sessions seeded.`);
}

/* ------------------------------------------------------------------ */
/* Finance (expenses, vendors, invoices, payments, refunds, waivers)   */
/* ------------------------------------------------------------------ */

/**
 * Seeds the Finance Operations module. Deletes and rebuilds all finance
 * collections so repeated reseeds are stable, then writes a story that
 * is consistent with the fee ledger shown in the student portal (Aarav:
 * ₹10,001 total / ₹5,000 paid / ₹5,001 pending).
 */
export async function seedDemoFinance(): Promise<void> {
  await connectDB();

  await VendorModel.deleteMany({});
  await ExpenseCategoryModel.deleteMany({});
  await ExpenseModel.deleteMany({});
  await InvoiceModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await RefundModel.deleteMany({});
  await WaiverModel.deleteMany({});
  await AuditLogModel.deleteMany({});

  const [admin, staff, students] = await Promise.all([
    UserModel.findOne({ email: "admin@demo.auraedu.com" }).lean(),
    UserModel.findOne({ email: "staff@demo.auraedu.com" }).lean(),
    UserModel.find({ role: "student" }).lean(),
  ]);
  if (!admin || !staff) return;

  const studentByEmail = new Map(students.map((s) => [s.email, s]));
  const studentId = (email: string) => studentByEmail.get(email)?._id;

  /* Vendors + categories */
  const vendorNames = ["Indore Realty LLP", "RS Digital Services"];
  const vendors: { _id: mongoose.Types.ObjectId; name: string }[] = [];
  for (const [i, name] of vendorNames.entries()) {
    const doc = await VendorModel.create({
      name,
      contactPerson: i === 0 ? "Mr. Deepak Jain" : "Ms. Divya Rathi",
      phone: i === 0 ? "+91-98261-22010" : "+91-98123-55670",
      email: i === 0 ? "accounts@indorerealty.in" : "hello@rsdigital.in",
      gstin: i === 0 ? "23AAACD1234F1Z5" : "23AEGPR9876L1Z9",
      pan: i === 0 ? "AAACD1234F" : "AEGPR9876L",
      address: i === 0 ? "Vijay Nagar, Indore, MP 452010" : "Palasia Square, Indore, MP 452001",
      bankName: "HDFC Bank",
      accountNumber: i === 0 ? "50100234567890" : "50100987654321",
      ifsc: "HDFC0000214",
      branchName: "Vijay Nagar",
      isActive: true,
    });
    vendors.push({ _id: doc._id as mongoose.Types.ObjectId, name });
  }

  const categorySeeds = [
    { name: "Facility Rent", description: "Office, classroom and premises rentals" },
    { name: "Utilities & Bills", description: "Electricity, water, internet and telephone" },
    { name: "Stationery & Printing", description: "Test booklets, notes and office stationery" },
    { name: "Software & Tools", description: "Test platforms, SaaS and digital services" },
    { name: "Faculty Honorarium", description: "Guest lectures and ad-hoc faculty payments" },
  ];
  const categories: { _id: mongoose.Types.ObjectId; name: string }[] = [];
  for (const c of categorySeeds) {
    const doc = await ExpenseCategoryModel.create({ ...c, isActive: true });
    categories.push({ _id: doc._id as mongoose.Types.ObjectId, name: c.name });
  }
  const cat = (name: string) => categories.find((c) => c.name === name)!;
  const vendor = (name: string) => vendors.find((v) => v.name === name)!;

  /* Expenses */
  const expenseSeeds = [
    {
      refNumber: "EXP-2026-00001",
      title: "Office Rent — June 2026",
      description: "Monthly rent for the coaching premises (building 2, Mezzanine).",
      vendorRef: "Indore Realty LLP",
      categoryRef: "Facility Rent",
      amount: 52000,
      expenseDate: new Date(2026, 5, 1),
      createdBy: admin._id,
      status: "approved" as const,
      approvedBy: admin._id,
      approvedAt: new Date(2026, 5, 2),
      paymentMethod: "Bank Transfer",
    },
    {
      refNumber: "EXP-2026-00002",
      title: "Electricity Bill — May 2026",
      description: "MPEB bill for the main campus meter.",
      vendorRef: "",
      categoryRef: "Utilities & Bills",
      amount: 4300,
      expenseDate: new Date(2026, 4, 25),
      createdBy: admin._id,
      status: "approved" as const,
      approvedBy: admin._id,
      approvedAt: new Date(2026, 4, 27),
      paymentMethod: "UPI",
    },
    {
      refNumber: "EXP-2026-00003",
      title: "Printing — Test Booklets (200 sheets)",
      description: "Bulk prints of the July mock-test answer booklets.",
      vendorRef: "RS Digital Services",
      categoryRef: "Stationery & Printing",
      amount: 1850,
      expenseDate: new Date(2026, 8, 1),
      createdBy: staff._id,
      status: "pending" as const,
      paymentMethod: "Cash",
    },
    {
      refNumber: "EXP-2026-00004",
      title: "Online Test Platform — Monthly Subscription",
      description: "Hosted test series + analytics for NEET and JEE cohorts.",
      vendorRef: "RS Digital Services",
      categoryRef: "Software & Tools",
      amount: 12000,
      expenseDate: new Date(2026, 8, 3),
      createdBy: staff._id,
      status: "pending" as const,
      paymentMethod: "Bank Transfer",
    },
    {
      refNumber: "EXP-2026-00005",
      title: "Guest Lecture Honorarium — Dr. S. Mehta",
      description: "Evening session on exam-day strategy (16 May).",
      vendorRef: "",
      categoryRef: "Faculty Honorarium",
      amount: 5000,
      expenseDate: new Date(2026, 7, 20),
      createdBy: staff._id,
      status: "rejected" as const,
      rejectedBy: admin._id,
      rejectedAt: new Date(2026, 7, 21),
      rejectedReason: "Approach finance with a proper invoice before the session.",
      paymentMethod: "Cheque",
    },
  ];
  let expenses = 0;
  for (const e of expenseSeeds) {
    await ExpenseModel.create({
      refNumber: e.refNumber,
      title: e.title,
      description: e.description,
      categoryRef: cat(e.categoryRef)._id,
      vendorRef: e.vendorRef ? vendor(e.vendorRef)._id : undefined,
      amount: e.amount,
      expenseDate: e.expenseDate,
      paymentMethod: e.paymentMethod,
      paymentSource: "Company",
      refNo: "",
      receiptUrl: "",
      internalNotes: "",
      status: e.status,
      isReimbursement: false,
      reimbursedTo: "",
      createdBy: e.createdBy,
      approvedBy: e.approvedBy,
      approvedAt: e.approvedAt,
      rejectedBy: e.rejectedBy,
      rejectedAt: e.rejectedAt,
      rejectedReason: e.rejectedReason,
    });
    expenses += 1;
  }

  /* Invoices (consistent with the student portal fee ledger) */
  const invoiceSeeds: {
    invoiceNo: string;
    email: string;
    total: number;
    paid: number;
    waived: number;
    issueDate: Date;
    dueDate: Date;
  }[] = [
    { invoiceNo: "INV-2026-00001", email: "student@demo.auraedu.com", total: 10001, paid: 5000, waived: 0, issueDate: new Date(2026, 5, 15), dueDate: new Date(2026, 7, 15) },
    { invoiceNo: "INV-2026-00002", email: "priya.deshmukh@demo.auraedu.com", total: 9001, paid: 9001, waived: 0, issueDate: new Date(2026, 5, 18), dueDate: new Date(2026, 7, 18) },
    { invoiceNo: "INV-2026-00003", email: "rohan.kulkarni@demo.auraedu.com", total: 10001, paid: 4000, waived: 0, issueDate: new Date(2026, 5, 20), dueDate: new Date(2026, 8, 10) },
    { invoiceNo: "INV-2026-00004", email: "sneha.patil@demo.auraedu.com", total: 10001, paid: 3000, waived: 0, issueDate: new Date(2026, 5, 22), dueDate: new Date(2026, 9, 15) },
    { invoiceNo: "INV-2026-00005", email: "meera.iyer@demo.auraedu.com", total: 9001, paid: 0, waived: 0, issueDate: new Date(2026, 5, 10), dueDate: new Date(2026, 8, 5) },
    { invoiceNo: "INV-2026-00006", email: "aditya.joshi@demo.auraedu.com", total: 10001, paid: 5000, waived: 0, issueDate: new Date(2026, 6, 8), dueDate: new Date(2026, 9, 1) },
    { invoiceNo: "INV-2026-00007", email: "kabir.singh@demo.auraedu.com", total: 10001, paid: 0, waived: 0, issueDate: new Date(2026, 6, 20), dueDate: new Date(2026, 9, 20) },
    { invoiceNo: "INV-2026-00008", email: "dev.verma@demo.auraedu.com", total: 9001, paid: 9001, waived: 0, issueDate: new Date(2026, 5, 5), dueDate: new Date(2026, 7, 5) },
  ];
  const invoiceIdByStudent = new Map<string, mongoose.Types.ObjectId>();
  let invoices = 0;
  for (const inv of invoiceSeeds) {
    const sid = studentId(inv.email);
    if (!sid) continue;
    const doc = await InvoiceModel.create({
      invoiceNo: inv.invoiceNo,
      studentId: sid,
      course: studentByEmail.get(inv.email)!.course ?? "",
      batch: studentByEmail.get(inv.email)!.batch ?? "",
      branch: studentByEmail.get(inv.email)!.branch ?? "",
      total: inv.total,
      paid: inv.paid,
      waived: inv.waived,
      taxGst: 0,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      notes: inv.paid > 0 ? "Installments: 1st at admission, rest by due date." : "Payable before due date to avoid late-fee.",
    });
    invoiceIdByStudent.set(inv.email, doc._id as mongoose.Types.ObjectId);
    invoices += 1;
  }

  /* Payments (success + one cancelled gateway attempt) */
  const paymentSeeds: {
    receiptNo: string;
    email: string;
    amount: number;
    mode: string;
    status: "success" | "cancelled";
    recordedAt: Date;
    recordedBy: mongoose.Types.ObjectId;
  }[] = [
    { receiptNo: "RCP-202604-0001", email: "student@demo.auraedu.com", amount: 5000, mode: "Cash", status: "success", recordedAt: new Date(2026, 3, 10), recordedBy: admin._id },
    { receiptNo: "RCP-202605-0001", email: "priya.deshmukh@demo.auraedu.com", amount: 9001, mode: "UPI", status: "success", recordedAt: new Date(2026, 4, 20), recordedBy: admin._id },
    { receiptNo: "RCP-202605-0002", email: "rohan.kulkarni@demo.auraedu.com", amount: 4000, mode: "Bank Transfer", status: "success", recordedAt: new Date(2026, 4, 25), recordedBy: staff._id },
    { receiptNo: "RCP-202606-0001", email: "dev.verma@demo.auraedu.com", amount: 9001, mode: "Bank Transfer", status: "success", recordedAt: new Date(2026, 5, 5), recordedBy: admin._id },
    { receiptNo: "RCP-202606-0002", email: "sneha.patil@demo.auraedu.com", amount: 3000, mode: "UPI", status: "success", recordedAt: new Date(2026, 5, 22), recordedBy: staff._id },
    { receiptNo: "RCP-202607-0001", email: "aditya.joshi@demo.auraedu.com", amount: 5000, mode: "UPI", status: "success", recordedAt: new Date(2026, 6, 8), recordedBy: staff._id },
    { receiptNo: "RCP-202609-0001", email: "kabir.singh@demo.auraedu.com", amount: 10001, mode: "UPI", status: "cancelled", recordedAt: new Date(2026, 8, 2), recordedBy: admin._id },
  ];
  let payments = 0;
  for (const p of paymentSeeds) {
    const sid = studentId(p.email);
    if (!sid) continue;
    await PaymentModel.create({
      receiptNo: p.receiptNo,
      studentId: sid,
      invoiceId: invoiceIdByStudent.get(p.email) ?? undefined,
      amount: p.amount,
      gst: 0,
      gatewayFee: p.status === "cancelled" ? 20 : 0,
      netAmount: p.status === "cancelled" ? p.amount - 20 : p.amount,
      mode: p.mode,
      source: p.mode === "Cash" ? "Admin" : "Student Portal",
      branch: studentByEmail.get(p.email)!.branch ?? "",
      status: p.status,
      recordedBy: p.recordedBy,
      recordedAt: p.recordedAt,
    });
    payments += 1;
  }

  /* Refunds — one processed (Aditya), one pending (Sneha) */
  const adityaPayment = await PaymentModel.findOne({ receiptNo: "RCP-202607-0001" }).lean();
  if (adityaPayment) {
    const refund = await RefundModel.create({
      refundNo: "RUF-2026-0001",
      studentId: adityaPayment.studentId,
      paymentId: adityaPayment._id,
      invoiceId: adityaPayment.invoiceId ?? undefined,
      amount: 1000,
      reason: "Charged extra — fee revision applied late.",
      method: "UPI",
      status: "processed",
      requestedBy: staff._id,
      decidedBy: admin._id,
      decidedAt: new Date(2026, 6, 10),
      remarks: "Approved after fee-structure reconciliation.",
    });
    await PaymentModel.updateOne({ _id: adityaPayment._id }, { $set: { status: "refunded", refundId: refund._id } });
    if (adityaPayment.invoiceId) {
      await InvoiceModel.updateOne({ _id: adityaPayment.invoiceId }, { $inc: { paid: -1000 } });
    }
  }
  const snehaPayment = await PaymentModel.findOne({ receiptNo: "RCP-202606-0002" }).lean();
  if (snehaPayment) {
    await RefundModel.create({
      refundNo: "RUF-2026-0002",
      studentId: snehaPayment.studentId,
      paymentId: snehaPayment._id,
      invoiceId: snehaPayment.invoiceId ?? undefined,
      amount: 1500,
      reason: "Transfer request — joining JEE crash batch instead.",
      method: "Original Mode",
      status: "pending",
      requestedBy: staff._id,
    });
  }

  /* Waivers — one approved (Meera), one pending (Kabir) */
  const meera = studentId("meera.iyer@demo.auraedu.com");
  if (meera) {
    const waiver = await WaiverModel.create({
      waiverNo: "WAV-2026-0001",
      studentId: meera,
      invoiceId: invoiceIdByStudent.get("meera.iyer@demo.auraedu.com") ?? undefined,
      amount: 2000,
      reason: "Sibling discount — elder sister is an alumnus.",
      status: "approved",
      requestedBy: admin._id,
      decidedBy: admin._id,
      decidedAt: new Date(2026, 5, 10),
      remarks: "Alumni family discount approved as per policy.",
    });
    if (waiver.invoiceId) {
      await InvoiceModel.updateOne({ _id: waiver.invoiceId }, { $inc: { waived: waiver.amount } });
    }
  }
  const kabir = studentId("kabir.singh@demo.auraedu.com");
  if (kabir) {
    await WaiverModel.create({
      waiverNo: "WAV-2026-0002",
      studentId: kabir,
      invoiceId: invoiceIdByStudent.get("kabir.singh@demo.auraedu.com") ?? undefined,
      amount: 5000,
      reason: "Merit scholarship — district topper program.",
      status: "pending",
      requestedBy: admin._id,
    });
  }

  /* Audit trail (append-only) */
  const auditSeeds: { action: string; target: string; actor?: mongoose.Types.ObjectId; role?: string; isSystem?: boolean; at: Date }[] = [
    { action: "synced invoices", target: "auto-created 8 invoice(s)", isSystem: true, at: new Date(2026, 5, 5) },
    { action: "approved expense", target: "EXP-2026-00001 — Office Rent — June 2026", actor: admin._id, role: "admin", at: new Date(2026, 5, 2) },
    { action: "approved expense", target: "EXP-2026-00002 — Electricity Bill — May 2026", actor: admin._id, role: "admin", at: new Date(2026, 4, 27) },
    { action: "rejected expense", target: "EXP-2026-00005 — Guest Lecture Honorarium — Dr. S. Mehta", actor: admin._id, role: "admin", at: new Date(2026, 7, 21) },
    { action: "recorded payment", target: "RCP-202607-0001 — Aditya Joshi (₹5000)", actor: staff._id, role: "staff", at: new Date(2026, 6, 8) },
    { action: "approved refund", target: "RUF-2026-0001 (₹1000)", actor: admin._id, role: "admin", at: new Date(2026, 6, 9) },
    { action: "processed refund", target: "RUF-2026-0001 (₹1000)", actor: admin._id, role: "admin", at: new Date(2026, 6, 10) },
    { action: "approved waiver", target: "WAV-2026-0001 — Meera Iyer (₹2000)", actor: admin._id, role: "admin", at: new Date(2026, 5, 10) },
  ];
  let audits = 0;
  for (const [i, a] of auditSeeds.entries()) {
    await AuditLogModel.create({
      eventNo: `AUD-${String(i + 1).padStart(4, "0")}`,
      userId: a.actor ?? new mongoose.Types.ObjectId("000000000000000000000001"),
      userName: a.isSystem ? "System" : a.role === "staff" ? "Ritu Sharma" : "System Administrator",
      userRole: a.isSystem ? "System" : a.role,
      action: a.action,
      target: a.target,
      ip: "-",
      isSystem: a.isSystem ?? false,
      createdAt: a.at,
    });
    audits += 1;
  }

  console.log(`[seed] finance: vendors=2 categories=5 expenses=${expenses} invoices=${invoices} payments=${payments} refunds=2 waivers=2 audit=${audits}`);
}

/* ------------------------------------------------------------------ */
/* Connect (communications: notices, meetings, calendar events)         */
/* ------------------------------------------------------------------ */

/**
 * Broadcasts, meetings and calendar events backed by real collection docs.
 *
 * Notices fan out into per-student Notification rows carrying `sourceId` so
 * the student hub renders the exact messages the admin authored. Reads are
 * pre-marked with click-through fractions so the admin "Delivered N · Read M"
 * chips look alive on the very first demo visit. Notices/meetings/events are
 * wiped and rebuilt every seed (nothing bars on stable _ids).
 */
export async function seedDemoConnect(): Promise<void> {
  await connectDB();

  await NoticeModel.deleteMany({});
  await MeetingModel.deleteMany({});
  await CalendarEventModel.deleteMany({});
  // Broadcast fan-out rows (anything carrying a Notice sourceId).
  await NotificationModel.deleteMany({ sourceId: { $ne: null } });

  const [admin, staff, students] = await Promise.all([
    UserModel.findOne({ role: "admin" }).lean(),
    UserModel.findOne({ role: "staff" }).lean(),
    UserModel.find({ role: "student" }).select("_id name batch").lean(),
  ]);
  if (!admin) return;

  const byBatch = new Map<string, { _id: unknown; name: string }[]>();
  for (const s of students) {
    const name = s.batch?.trim();
    if (!name) continue;
    const list = byBatch.get(name) ?? [];
    list.push({ _id: s._id, name: s.name });
    byBatch.set(name, list);
  }
  const allStudents = students.map((s) => ({ _id: s._id, name: s.name }));

  const fanOut = async (
    noticeId: mongoose.Types.ObjectId,
    cfg: { title: string; message: string; category: string; important: boolean; sender: string },
    targets: { _id: unknown; name: string }[],
    readFrac: number,
    createdAt: Date,
  ) => {
    const rows = targets.map((u, i) => ({
      userId: u._id,
      title: cfg.title,
      message: cfg.message,
      category: cfg.category,
      sender: cfg.sender,
      important: cfg.important,
      read: i < Math.round(targets.length * readFrac),
      link: "/student-portal/notifications",
      ip: "-",
      os: "-",
      device: "-",
      sourceId: noticeId,
      createdAt: new Date(createdAt.getTime() + i * 60000),
    }));
    await NotificationModel.insertMany(rows);
    return rows.length;
  };

  /* ----------------------------- Notices ----------------------------- */

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * DAY);

  const noticeDefs: {
    title: string;
    message: string;
    category: string;
    important: boolean;
    sender: string;
    audience: { kind: "all" | "batches" | "staff"; batchNames: string[] };
    readFrac: number;
    sentDaysAgo: number;
    pinned?: boolean;
  }[] = [
    {
      title: "Grand Scholarship Webinar — Parents & Students",
      message:
        "Join us this Saturday at 6:30 PM for a live session on scholarship eligibility and the 2027 intake. Faculty Q&A included — all parents are welcome.",
      category: "Announcements",
      important: true,
      sender: "System Administrator",
      audience: { kind: "all", batchNames: [] },
      readFrac: 0.75,
      sentDaysAgo: 2,
      pinned: true,
    },
    {
      title: "Fee Installment Deadline Approaching",
      message:
        "The 2nd installment for NEET Batch A is due by end of this week. Clear your dues to avoid late-fee penalties — pay from the Fees tab.",
      category: "Payments",
      important: true,
      sender: "Finance Dept (Accounts)",
      audience: { kind: "batches", batchNames: ["NEET Batch A"] },
      readFrac: 0.6,
      sentDaysAgo: 3,
    },
    {
      title: "Mock Test #4 — Syllabus Update",
      message:
        "Grand Mock Test #4 now covers Hydrocarbons, Biomolecules and full Biology revision. Result cards will be published same evening.",
      category: "Tests",
      important: false,
      sender: "Academic Controller",
      audience: { kind: "all", batchNames: [] },
      readFrac: 0.7,
      sentDaysAgo: 4,
    },
    {
      title: "Timetable Change — Monday Morning Slot",
      message:
        "Monday's 9 AM JEE Physics class moves to 10:30 AM this week. Please plan accordingly; the doubt session remains unchanged.",
      category: "Courses",
      important: false,
      sender: "Academic Office",
      audience: { kind: "batches", batchNames: ["JEE Batch A"] },
      readFrac: 0.5,
      sentDaysAgo: 1,
    },
    {
      title: "New Worksheet Live: Chemical Bonding",
      message:
        "The Chemical Bonding worksheet is now active under Assignments. Submission deadline is 48 hours from publishing.",
      category: "Assignments",
      important: false,
      sender: "Prof. S. Sharma",
      audience: { kind: "batches", batchNames: ["NEET Batch A", "NEET Batch B"] },
      readFrac: 0.85,
      sentDaysAgo: 2,
    },
    {
      title: "Staff Update — Holiday Schedule Published",
      message:
        "The Foundation Day holiday and the summer revision calendar are now published on the Calendar tab. Please note the new duty roster.",
      category: "Announcements",
      important: false,
      sender: "System Administrator",
      audience: { kind: "staff", batchNames: [] },
      readFrac: 0.9,
      sentDaysAgo: 1,
    },
    {
      title: "Attendance Streak Drive — This Week",
      message:
        "Maintain a 100% attendance streak this week to qualify for the monthly achievers' list. Attendance registers close at 8 AM each day.",
      category: "Attendance",
      important: false,
      sender: "Academic Office",
      audience: { kind: "batches", batchNames: ["NEET Batch B"] },
      readFrac: 0.2,
      sentDaysAgo: 0,
    },
  ];

  let notices = 0;
  let notifications = 0;
  for (const def of noticeDefs) {
    const sentAt = daysAgo(def.sentDaysAgo);
    const targets =
      def.audience.kind === "all"
        ? allStudents
        : def.audience.kind === "staff"
          ? [admin, staff].filter((u): u is NonNullable<typeof u> => Boolean(u)).map((u) => ({ _id: u._id, name: u.name }))
          : def.audience.batchNames.flatMap((name) => byBatch.get(name) ?? []);
    if (targets.length === 0) continue;

    const doc = await NoticeModel.create({
      title: def.title,
      message: def.message,
      category: def.category,
      important: def.important,
      audience: { kind: def.audience.kind, batchNames: def.audience.batchNames, studentIds: [] },
      sender: def.sender,
      senderId: admin._id,
      pinnedAt: def.pinned ? new Date(sentAt.getTime() + 5 * 60000) : null,
      sentAt,
    });
    notifications += await fanOut(doc._id, def, targets, def.readFrac, sentAt);
    notices += 1;
  }

  /* ----------------------------- Meetings ---------------------------- */

  const MIN = 60 * 1000;
  const liveStart = new Date(now.getTime() - 45 * MIN);
  const hm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const atDayUTC = (offset: number) => {
    const t = new Date(now.getTime() + offset * DAY);
    return new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  };

  const meetingSeeds: {
    title: string;
    description: string;
    date: Date;
    startHour: string;
    endHour: string;
    type: "internal" | "class" | "webinar";
    batchNames: string[];
    status: "draft" | "upcoming" | "live" | "completed" | "cancelled";
  }[] = [
    {
      title: "Daily Doubt Roundup — NEET & JEE",
      description: "Open doubt floor for the day's problem set. Bring your starred questions.",
      date: atDayUTC(0),
      startHour: hm(liveStart),
      endHour: hm(new Date(now.getTime() + 120 * MIN)),
      type: "class",
      batchNames: ["NEET Batch A", "JEE Batch A"],
      status: "live",
    },
    {
      title: "JEE Advanced Physics Doubt Session",
      description: "Rotational mechanics + modern physics problem walkthrough.",
      date: atDayUTC(1),
      startHour: "18:00",
      endHour: "19:30",
      type: "class",
      batchNames: ["JEE Batch A"],
      status: "upcoming",
    },
    {
      title: "NEET Biology Chapter 4 Revision",
      description: "Full-syllabus revision of Human Physiology with rapid-fire MCQs.",
      date: atDayUTC(2),
      startHour: "19:00",
      endHour: "20:30",
      type: "class",
      batchNames: ["NEET Batch A", "NEET Batch B"],
      status: "upcoming",
    },
    {
      title: "Staff Weekly Sync",
      description: "Week plan, duty roster and open issues across batches.",
      date: atDayUTC(4),
      startHour: "09:00",
      endHour: "10:00",
      type: "internal",
      batchNames: [],
      status: "upcoming",
    },
    {
      title: "Grand Parents Meet — NEET Cohort",
      description: "Parent-teacher interaction + scholarship & progress overview.",
      date: atDayUTC(7),
      startHour: "11:00",
      endHour: "13:00",
      type: "webinar",
      batchNames: ["NEET Batch A", "NEET Batch B"],
      status: "upcoming",
    },
    {
      title: "JEE Mock Solution Walkthrough",
      description: "Step-by-step solutions for Saturday's full mock.",
      date: atDayUTC(-1),
      startHour: "17:00",
      endHour: "18:30",
      type: "class",
      batchNames: ["JEE Batch A"],
      status: "completed",
    },
    {
      title: "Staff Planning — Term 2",
      description: "Term-2 test calendar and worksheet publishing plan.",
      date: atDayUTC(-2),
      startHour: "09:30",
      endHour: "10:30",
      type: "internal",
      batchNames: [],
      status: "completed",
    },
  ];

  let meetings = 0;
  for (const m of meetingSeeds) {
    const slug =
      m.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "meeting";
    await MeetingModel.create({
      title: m.title,
      description: m.description,
      date: m.date,
      startHour: m.startHour,
      endHour: m.endHour,
      type: m.type,
      batchNames: m.batchNames,
      link: `https://meet.auraedu.com/${slug}-${Math.random().toString(36).slice(2, 6)}`,
      security: {
        disableScreenshot: true,
        disableRecording: true,
        disableScreenShare: true,
        watermark: true,
        waitingRoom: false,
        muteOnEntry: true,
      },
      status: m.status,
      createdBy: admin._id,
    });
    meetings += 1;
  }

  /* --------------------------- Calendar events ------------------------ */

  const utcDay = (day: number) => new Date(Date.UTC(now.getFullYear(), now.getMonth(), day));
  const eventSeeds: {
    title: string;
    day: number;
    time: string;
    type: "class" | "meeting" | "exam" | "event" | "holiday";
    description: string;
    batchNames: string[];
  }[] = [
    { title: "JEE Maths — Quadratic Equations", day: 2, time: "17:00", type: "class", description: "Roots, nature of roots and graphs.", batchNames: ["JEE Batch A"] },
    { title: "NEET Bio Live Session", day: 5, time: "19:00", type: "class", description: "Reproduction in Organisms — chapter 2.", batchNames: ["NEET Batch A"] },
    { title: "Mock Test 3 — JEE Full Syllabus", day: 8, time: "09:00", type: "exam", description: "Full-length timed mock, result the same day.", batchNames: ["JEE Batch A"] },
    { title: "Staff Planning Sync", day: 11, time: "09:30", type: "meeting", description: "Fortnightly ops + duty roster.", batchNames: [] },
    { title: "NEET Chemistry Doubt Hour", day: 14, time: "18:00", type: "class", description: "Thermodynamics doubt clearing.", batchNames: ["NEET Batch A", "NEET Batch B"] },
    { title: "Daily Current Affairs (Both Batches)", day: 22, time: "20:00", type: "class", description: "Daily current affairs + static GK recap.", batchNames: ["NEET Batch A", "JEE Batch A"] },
    { title: "Grand Scholarship Webinar", day: 24, time: "18:30", type: "event", description: "Scholarship eligibility + 2027 intake Q&A.", batchNames: [] },
    { title: "Mock Test 4 — NEET", day: 26, time: "09:00", type: "exam", description: "Grand mock featuring Hydrocarbons & Biomolecules.", batchNames: ["NEET Batch A", "NEET Batch B"] },
    { title: "Parent-Teacher Meet", day: 28, time: "11:00", type: "meeting", description: "Slot-based PTM across all batches.", batchNames: [] },
    { title: "Foundation Day Holiday", day: 30, time: "00:00", type: "holiday", description: "Institute holiday — no classes.", batchNames: [] },
  ];

  let events = 0;
  for (const e of eventSeeds) {
    await CalendarEventModel.create({
      title: e.title,
      date: utcDay(e.day),
      time: e.time,
      type: e.type,
      description: e.description,
      batchNames: e.batchNames,
      createdBy: admin._id,
    });
    events += 1;
  }

  console.log(`[seed] connect: notices=${notices} notifications=${notifications} meetings=${meetings} events=${events}`);
}
/* ------------------------------------------------------------------ */
/* Leads + Online Admissions                                           */
/* ------------------------------------------------------------------ */

const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000);

/**
 * A realistic lead pipeline. Names are distinct from the seeded students so
 * a demo conversion creates a genuinely new account. Two "converted" leads
 * point at existing seeded students to show the history.
 *
 * Also removes accounts created during a previous demo (any
 * `@demo.auraedu.com` student or staff not in DEMO_ACCOUNTS — e.g. converted
 * leads, staff added in Staff Corner) so the demo repeats cleanly.
 */
export async function seedDemoLeads(): Promise<void> {
  await connectDB();

  const seedEmails = DEMO_ACCOUNTS.map((a) => a.email);
  const strays = await UserModel.find({
    role: { $in: ["student", "staff"] },
    email: { $regex: /@demo\.auraedu\.com$/, $nin: seedEmails },
  })
    .select("_id")
    .lean();
  if (strays.length) {
    const ids = strays.map((u) => u._id);
    await SessionModel.deleteMany({ userId: { $in: ids } });
    await UserModel.deleteMany({ _id: { $in: ids } });
  }

  await LeadModel.deleteMany({});

  const meera = await UserModel.findOne({ email: "meera.iyer@demo.auraedu.com" }).select("_id").lean();
  const kabir = await UserModel.findOne({ email: "kabir.singh@demo.auraedu.com" }).select("_id").lean();

  type SeedLead = {
    name: string; email: string; phone: string; stage: LeadStage; priority: LeadPriority; source: LeadSource;
    course: string; batch?: string; createdDaysAgo: number; followUpInDays?: number; owner?: string;
    type?: LeadType; notes?: string[]; lostReason?: string; convertedTo?: mongoose.Types.ObjectId; gender?: string;
    guardianName?: string; guardianPhone?: string;
  };

  const plan: SeedLead[] = [
    { name: "Ishaan Malhotra", email: "ishaan.malhotra@demo.auraedu.com", phone: "9876500031", stage: "new", priority: "high", source: "web_register", course: "NEET Comprehensive 2026", batch: "Morning (8 AM - 12 PM)", createdDaysAgo: 0, gender: "Male", guardianName: "Rajiv Malhotra", guardianPhone: "9826000031", notes: ["Applied through the online admission form."] },
    { name: "Tanvi Deshpande", email: "tanvi.deshpande@demo.auraedu.com", phone: "9876500032", stage: "new", priority: "medium", source: "web_register", course: "JEE Main & Advanced Mathematics Crash Course", createdDaysAgo: 1, gender: "Female", guardianName: "Sunita Deshpande", guardianPhone: "9826000032", notes: ["Applied through the online admission form."] },
    { name: "Vihaan Bhatt", email: "vihaan.bhatt@demo.auraedu.com", phone: "9876500033", stage: "contacted", priority: "high", source: "walk_in", course: "NEET Comprehensive 2026", createdDaysAgo: 3, followUpInDays: 0, owner: "Ritu Sharma", notes: ["Walked in with parents; wants the dropper batch.", "Called back — sent fee structure on WhatsApp."] },
    { name: "Riya Chopra", email: "riya.chopra@demo.auraedu.com", phone: "9876500034", stage: "follow_up", priority: "high", source: "referral", course: "JEE Main & Advanced Mathematics Crash Course", createdDaysAgo: 6, followUpInDays: -1, owner: "Ritu Sharma", notes: ["Referred by Priya Deshmukh.", "Asked for a scholarship test date."] },
    { name: "Arnav Saxena", email: "arnav.saxena@demo.auraedu.com", phone: "9876500035", stage: "qualified", priority: "medium", source: "phone", course: "MERN Stack Web Development Specialization", createdDaysAgo: 8, followUpInDays: 2, owner: "System Administrator", notes: ["Demo class attended, liked the project-based format."] },
    { name: "Diya Menon", email: "diya.menon@demo.auraedu.com", phone: "9876500036", stage: "follow_up", priority: "low", source: "campaign", course: "NEET Comprehensive 2026", createdDaysAgo: 10, followUpInDays: 4, owner: "Ritu Sharma", notes: ["Came from the Instagram campaign."] },
    { name: "Yash Agarwal", email: "yash.agarwal@demo.auraedu.com", phone: "9876500037", stage: "new", priority: "medium", source: "phone", course: "JEE Main & Advanced Mathematics Crash Course", createdDaysAgo: 2, notes: ["Enquiry call — wants weekend batch."] },
    { name: "Nisha Pillai", email: "nisha.pillai@demo.auraedu.com", phone: "9876500038", stage: "lost", priority: "low", source: "walk_in", course: "NEET Comprehensive 2026", createdDaysAgo: 20, owner: "Ritu Sharma", lostReason: "Joined a coaching centre closer to home.", notes: ["Fee concern raised on first visit."] },
    { name: "Sunrise Public School", email: "principal@sunrise-school.example", phone: "02240000039", stage: "contacted", priority: "medium", source: "referral", course: "Institution licence (50 seats)", createdDaysAgo: 5, followUpInDays: 1, owner: "System Administrator", type: "client", notes: ["Interested in a white-label portal for Class 11–12."] },
    { name: "Meera Iyer", email: "meera.iyer@demo.auraedu.com", phone: "9876500016", stage: "converted", priority: "medium", source: "web_register", course: "NEET Comprehensive 2026", createdDaysAgo: 120, owner: "Ritu Sharma", convertedTo: meera?._id, notes: ["Applied through the online admission form.", "Converted to student → NEET Batch B"] },
    { name: "Kabir Singh", email: "kabir.singh@demo.auraedu.com", phone: "9876500017", stage: "converted", priority: "high", source: "walk_in", course: "JEE Main & Advanced Mathematics Crash Course", createdDaysAgo: 90, owner: "System Administrator", convertedTo: kabir?._id, notes: ["Walk-in enquiry.", "Converted to student → JEE Batch A"] },
  ];

  let n = 0;
  for (const l of plan) {
    n += 1;
    const createdAt = daysFromNow(-l.createdDaysAgo);
    await LeadModel.create({
      leadNo: `LD-${createdAt.getFullYear()}-${String(n).padStart(4, "0")}`,
      name: l.name,
      email: l.email,
      phone: l.phone,
      type: l.type ?? "student",
      stage: l.stage,
      priority: l.priority,
      source: l.source,
      interestedCourse: l.course,
      preferredBatch: l.batch ?? "",
      branch: "Main Branch",
      gender: l.gender,
      guardianName: l.guardianName,
      guardianPhone: l.guardianPhone,
      ownerName: l.owner ?? "Unassigned",
      nextFollowUpAt: l.followUpInDays === undefined ? null : daysFromNow(l.followUpInDays),
      lostReason: l.lostReason,
      convertedStudentId: l.convertedTo ?? null,
      convertedAt: l.convertedTo ? daysFromNow(-l.createdDaysAgo + 3) : null,
      notes: (l.notes ?? []).map((text, i) => ({
        text,
        byName: i === 0 && l.source === "web_register" ? "Online Admission" : l.owner ?? "System",
        at: daysFromNow(-l.createdDaysAgo + i),
      })),
      createdAt,
    });
  }
  console.log(`[seed] leads=${plan.length} (pipeline across all stages); removed ${strays.length} converted demo account(s).`);
}

/* ------------------------------------------------------------------ */
/* Lesson progress                                                     */
/* ------------------------------------------------------------------ */

/** The demo student has worked through part of their NEET course. */
export async function seedDemoProgress(): Promise<void> {
  await connectDB();
  await LessonProgressModel.deleteMany({});
  const student = await UserModel.findOne({ email: "student@demo.auraedu.com" }).select("_id").lean();
  const course = await CourseModel.findOne({ code: "NEET-MED-2026" }).select("modules").lean();
  if (!student || !course) return;
  const lessons = (course.modules ?? []).flatMap((m) => m.lessons ?? []).slice(0, 4);
  await LessonProgressModel.insertMany(
    lessons.map((l, i) => ({
      userId: student._id,
      courseId: course._id,
      lessonId: l.id,
      completedAt: new Date(Date.now() - (lessons.length - i) * 24 * 60 * 60 * 1000),
    })),
  );
  console.log(`[seed] lesson progress: ${lessons.length} lessons completed for the demo student.`);
}

/* ------------------------------------------------------------------ */
/* Timetable                                                           */
/* ------------------------------------------------------------------ */

/** A believable weekly timetable for the four demo batches (Mon–Sat). */
export async function seedDemoTimetable(): Promise<void> {
  await connectDB();
  await TimetableSlotModel.deleteMany({});
  // Link classes to the demo staff accounts by name (falls back to a plain name).
  const staff = await UserModel.find({ role: "staff", isDemo: true }).select("_id name").lean();
  const t = (teacherName: string) => {
    const acct = staff.find((s) => s.name === teacherName);
    return acct ? { teacherId: acct._id, teacherName: acct.name } : { teacherId: null, teacherName };
  };
  const ritu = t("Ritu Sharma");

  type Seed = [string, number, string, string, string, { teacherId: unknown; teacherName: string }, string, ClassMode, string?];
  const rows: Seed[] = [
    // NEET Batch A — mornings
    ["NEET Batch A", 1, "08:00", "09:30", "Physics", t("Dr. Anil Verma"), "Hall A", "offline"],
    ["NEET Batch A", 1, "09:45", "11:15", "Chemistry", ritu, "Hall A", "offline"],
    ["NEET Batch A", 2, "08:00", "09:30", "Biology — Botany", t("Dr. Meenakshi Rao"), "Hall A", "offline"],
    ["NEET Batch A", 3, "08:00", "09:30", "Physics", t("Dr. Anil Verma"), "Hall A", "hybrid", "https://meet.auraedu.com/neet-a-physics"],
    ["NEET Batch A", 4, "09:45", "11:15", "Chemistry", ritu, "Hall A", "offline"],
    ["NEET Batch A", 5, "08:00", "09:30", "Biology — Zoology", t("Dr. Meenakshi Rao"), "Hall A", "offline"],
    ["NEET Batch A", 6, "10:00", "12:00", "Weekly mock review", ritu, "Online", "online", "https://meet.auraedu.com/neet-a-review"],
    // NEET Batch B — afternoons
    ["NEET Batch B", 1, "13:00", "14:30", "Biology — Botany", t("Dr. Meenakshi Rao"), "Hall B", "offline"],
    ["NEET Batch B", 2, "13:00", "14:30", "Physics", t("Dr. Anil Verma"), "Hall B", "offline"],
    ["NEET Batch B", 3, "13:00", "14:30", "Chemistry", ritu, "Hall B", "offline"],
    ["NEET Batch B", 4, "13:00", "14:30", "Biology — Zoology", t("Dr. Meenakshi Rao"), "Hall B", "offline"],
    ["NEET Batch B", 5, "13:00", "14:30", "Physics", t("Dr. Anil Verma"), "Hall B", "hybrid", "https://meet.auraedu.com/neet-b-physics"],
    // JEE Batch A — evenings
    ["JEE Batch A", 1, "16:00", "17:30", "Mathematics", t("Prof. R. K. Gupta"), "Hall C", "offline"],
    ["JEE Batch A", 2, "16:00", "17:30", "Physics", t("Dr. Anil Verma"), "Hall C", "offline"],
    ["JEE Batch A", 3, "16:00", "17:30", "Chemistry", ritu, "Hall C", "offline"],
    ["JEE Batch A", 4, "16:00", "17:30", "Mathematics", t("Prof. R. K. Gupta"), "Hall C", "offline"],
    ["JEE Batch A", 6, "15:00", "17:00", "Problem-solving lab", t("Prof. R. K. Gupta"), "Online", "online", "https://meet.auraedu.com/jee-a-lab"],
    // Python — weekends online
    ["Python Programming", 6, "18:00", "19:30", "Python fundamentals", t("Kunal Mehta"), "Online", "online", "https://meet.auraedu.com/python-weekend"],
    ["Python Programming", 0, "18:00", "19:30", "Project clinic", t("Kunal Mehta"), "Online", "online", "https://meet.auraedu.com/python-clinic"],
  ];
  await TimetableSlotModel.insertMany(
    rows.map(([batch, dayOfWeek, startTime, endTime, subject, teacher, room, mode, meetingLink]) => ({
      batch, dayOfWeek, startTime, endTime, subject, ...teacher, room, mode, meetingLink: meetingLink ?? "",
    })),
  );
  console.log(`[seed] timetable: ${rows.length} weekly classes across 4 batches.`);
}

/* ------------------------------------------------------------------ */
/* Leave                                                               */
/* ------------------------------------------------------------------ */

/** A few leave requests in every state; one approved unpaid leave shows up in payroll. */
export async function seedDemoLeave(): Promise<void> {
  await connectDB();
  await LeaveRequestModel.deleteMany({});
  const staff = await UserModel.find({ role: "staff", isDemo: true }).select("_id name").lean();
  const who = (name: string) => staff.find((s) => s.name === name);
  const now = new Date();
  const d = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const plan: { name: string; type: "casual" | "sick" | "earned" | "unpaid"; from: Date; to: Date; reason: string; status: "pending" | "approved" | "rejected"; note?: string }[] = [
    { name: "Ritu Sharma", type: "casual", from: d(-20), to: d(-19), reason: "Family function", status: "approved", note: "Enjoy!" },
    { name: "Kunal Mehta", type: "unpaid", from: d(-6), to: d(-5), reason: "Personal travel", status: "approved", note: "Approved as loss of pay." },
    { name: "Dr. Anil Verma", type: "sick", from: d(2), to: d(3), reason: "Minor surgery follow-up", status: "pending" },
    { name: "Dr. Meenakshi Rao", type: "earned", from: d(10), to: d(14), reason: "Conference in Bengaluru", status: "pending" },
    { name: "Neha Bhosale", type: "casual", from: d(-3), to: d(-3), reason: "Bank work", status: "rejected", note: "Month-end closing — please pick another day." },
  ];
  let n = 0;
  for (const l of plan) {
    const s = who(l.name);
    if (!s) continue;
    await LeaveRequestModel.create({
      userId: s._id,
      userName: s.name,
      type: l.type,
      from: l.from,
      to: l.to,
      days: Math.max(1, workingDaysBetween(l.from, l.to)),
      reason: l.reason,
      status: l.status,
      decidedByName: l.status === "pending" ? "" : "System Administrator",
      decidedAt: l.status === "pending" ? null : d(-1),
      decisionNote: l.note ?? "",
    });
    n += 1;
  }
  console.log(`[seed] leave: ${n} requests (2 pending).`);
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export async function seedDemoTasks(): Promise<void> {
  await connectDB();
  await TaskModel.deleteMany({});
  const people = await UserModel.find({ role: { $in: ["admin", "staff"] }, isDemo: true }).select("_id name").lean();
  const who = (name: string) => people.find((p) => p.name === name);
  const admin = who("System Administrator");
  if (!admin) return;
  const day = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);
  const plan: [string, string, "todo" | "in_progress" | "done", "low" | "medium" | "high", string, number][] = [
    ["Call back Riya Chopra about the scholarship test", "She asked for the next test date — share the schedule and fee concession rules.", "todo", "high", "Ritu Sharma", -1],
    ["Prepare NEET mock #5 question paper", "180 questions, NEET pattern, include 20 from last year's weak topics.", "in_progress", "high", "Dr. Anil Verma", 3],
    ["Upload Organic Chemistry notes to the course", "Module 2 lessons are missing their PDF links.", "todo", "medium", "Ritu Sharma", 5],
    ["Chase overdue fees — JEE Batch A", "Three students past due; send reminders and log calls.", "in_progress", "high", "Neha Bhosale", 1],
    ["Book Hall B for the parent-teacher meeting", "", "todo", "low", "System Administrator", 9],
    ["Review Python project submissions", "Grade the mini-projects from the weekend batch.", "todo", "medium", "Kunal Mehta", 4],
    ["Set up Biology doubt-clearing timetable", "", "done", "medium", "Dr. Meenakshi Rao", -4],
    ["Renew projector AMC", "Vendor quote received; approve and pay.", "done", "low", "Neha Bhosale", -8],
  ];
  await TaskModel.insertMany(
    plan.map(([title, description, status, priority, assignee, due]) => {
      const a = who(assignee);
      return {
        title,
        description,
        status,
        priority,
        assigneeId: a?._id ?? null,
        assigneeName: a?.name ?? "Unassigned",
        dueDate: day(due),
        createdById: admin._id,
        createdByName: admin.name,
        completedAt: status === "done" ? day(due) : null,
      };
    }),
  );
  console.log(`[seed] tasks: ${plan.length}.`);
}

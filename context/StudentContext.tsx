"use client";

/**
 * Student portal client state: the demo profile (locked to Aarav Sharma), the
 * enrolled courses list, notifications, and the simulator's dark-mode swatch.
 *
 * IMPORTANT scope note: this is POC/demo data only. Auth identity comes from
 * Auth.js (the JWT), but the rich student-facing data (profile, courses,
 * notifications, fees ledger) is a context-provided simulation so every
 * student screen has instant content without a DB round-trip. Real backend
 * wiring per screen is being introduced in the crown-jewel modules (tests,
 * attendance, etc.).
 */
import React, { createContext, useContext, useState } from "react";

export interface StudentProfile {
  name: string;
  admissionNo: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  category: string;
  bloodGroup: string;
  rollNo: string;
  batch: string;
  course: string;
  joiningDate: string;
  academicYear: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "Assignments" | "Tests" | "Courses" | "Attendance" | "Certificates" | "Payments" | "Announcements";
  time: string;
  date: string;
  read: boolean;
  important?: boolean;
  sender: string;
  ip: string;
  os: string;
  device: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  thumbnail: string;
  category: string;
  duration: string;
  status: "Active" | "Completed" | "Pending";
  description: string;
  syllabus: { section: string; topics: string[] }[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  batch: string;
  subject: string;
  status: "Present" | "Absent" | "Late" | "Holiday";
  checkIn: string;
  remarks: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Approved" | "Overdue";
  totalMarks: number;
  obtainedMarks?: number;
  instructions: string;
  submittedFile?: string;
  submittedAt?: string;
}

export interface TestItem {
  id: string;
  title: string;
  course: string;
  batch: string;
  date: string;
  time: string;
  durationMinutes: number;
  totalMarks: number;
  status: "Upcoming" | "Active Now" | "Completed";
  obtainedMarks?: number;
  rank?: number;
  totalStudents?: number;
}

export interface CertificateItem {
  id: string;
  title: string;
  course: string;
  issuedDate: string;
  certificateNo: string;
  downloadUrl: string;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  date: string;
  mode: "Cash" | "Online" | "Bank Transfer" | "UPI";
  amount: number;
  status: "Success" | "Cancelled" | "Pending";
  description: string;
}

export interface CourseStoreItem {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  duration: string;
  level: string;
  rating: number;
  reviewsCount: number;
  isEnrolled: boolean;
  badge?: string;
  description: string;
  features: string[];
}

interface StudentContextType {
  profile: StudentProfile;
  updateProfile: (updated: Partial<StudentProfile>) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  enrolledCourses: EnrolledCourse[];
  attendanceLogs: AttendanceRecord[];
  assignments: AssignmentItem[];
  submitAssignment: (id: string, fileName: string) => void;
  tests: TestItem[];
  certificates: CertificateItem[];
  totalFee: number;
  paidFee: number;
  pendingFee: number;
  paymentReceipts: FeeReceipt[];
  addPayment: (amount: number, mode: "Online" | "UPI" | "Cash") => void;
  courseStore: CourseStoreItem[];
  enrollInStoreCourse: (courseId: string) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Aarav Sharma",
    admissionNo: "ADM-2026-0010",
    email: "aarav.sharma@demo.myedou.com",
    phone: "+91 98765 00001",
    dob: "2003-07-27",
    gender: "Male",
    category: "General",
    bloodGroup: "O+",
    rollNo: "NEET-2026-010",
    batch: "NEET Dropper Batch",
    course: "NEET Comprehensive 2026",
    joiningDate: "15 June 2025",
    academicYear: "2025-2026",
    fatherName: "Mr. Sharma",
    motherName: "Mrs. Sharma",
    guardianPhone: "+91 98260 12345",
    address: "Scheme No. 54, Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452010",
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Fee Reminder - ₹5,001 Outstanding",
      message: "Your 2nd installment for NEET Batch is pending. Please pay by end of this week to avoid late fee penalties.",
      category: "Payments",
      time: "10:30 AM",
      date: "Today",
      read: false,
      important: true,
      sender: "Finance Dept (Accounts)",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
    },
    {
      id: "notif-2",
      title: "Mock Test Scheduled: Organic Chemistry",
      message: "Grand Mock Test #4 will be live on Sunday at 10:00 AM. Syllabus covers Hydrocarbons & Biomolecules.",
      category: "Tests",
      time: "08:15 AM",
      date: "Today",
      read: false,
      important: false,
      sender: "Academic Controller",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
    },
    {
      id: "notif-3",
      title: "New Assignment Uploaded: Physics Mechanics",
      message: "Rotational Dynamics Worksheets 1 & 2 are now active in your portal. Submission due: Friday 5 PM.",
      category: "Assignments",
      time: "04:45 PM",
      date: "Yesterday",
      read: true,
      sender: "Prof. S. Sharma",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
    },
    {
      id: "notif-4",
      title: "Attendance Recorded: Present",
      message: "Your attendance for today's Biology & revision session has been recorded.",
      category: "Attendance",
      time: "01:00 PM",
      date: "Yesterday",
      read: true,
      sender: "Academic Office",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
    },
    {
      id: "notif-5",
      title: "Certificate Generated: Basic Biology Fundamentals",
      message: "Congratulations! Your completion certificate for Biology Foundations module is ready for download.",
      category: "Certificates",
      time: "06:20 PM",
      date: "09 Aug 2026",
      read: true,
      sender: "Certification Cell",
      ip: "103.14.24.11",
      os: "Windows 11",
      device: "Desktop Chrome",
    },
  ]);

  const [enrolledCourses] = useState<EnrolledCourse[]>([
    {
      id: "neet-2026",
      title: "NEET Comprehensive 2026",
      code: "NEET-MED-2026",
      instructor: "Dr. A. Verma & Team",
      progress: 45,
      totalLessons: 120,
      completedLessons: 54,
      nextLesson: "Chapter 14: Plant Growth & Physiology",
      thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
      category: "Medical Entrance",
      duration: "1 Year Full-Time",
      status: "Active",
      description: "Comprehensive 1-year intensive preparation for NEET-UG with daily mock drills, NCERT line-by-line breakdown, and video solutions.",
      syllabus: [
        { section: "Physics", topics: ["Kinematics & Mechanics", "Thermodynamics", "Optics & Modern Physics"] },
        { section: "Chemistry", topics: ["Physical Chemistry Foundations", "Organic Mechanisms", "Inorganic Coordination Compounds"] },
        { section: "Biology", topics: ["Cell Biology & Genetics", "Plant Physiology", "Human Anatomy & Systematics"] },
      ],
    },
    {
      id: "jee-advance-2026",
      title: "JEE Main & Advanced Mathematics Crash Course",
      code: "JEE-MATH-2026",
      instructor: "Prof. R. K. Gupta",
      progress: 20,
      totalLessons: 60,
      completedLessons: 12,
      nextLesson: "Lesson 13: Integral Calculus & Area Under Curves",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      category: "Engineering Entrance",
      duration: "6 Months",
      status: "Active",
      description: "Advanced problem-solving tactics for JEE Mathematics covering Algebra, Calculus, Coordinate Geometry, and Vectors.",
      syllabus: [
        { section: "Calculus", topics: ["Limits, Continuity & Differentiability", "Definite Integrals", "Differential Equations"] },
        { section: "Algebra", topics: ["Complex Numbers", "Matrices & Determinants", "Permutations & Combinations"] },
      ],
    },
    {
      id: "mern-stack-demo",
      title: "MERN Stack Web Development Specialization",
      code: "CS-MERN-101",
      instructor: "Instructor Team",
      progress: 80,
      totalLessons: 40,
      completedLessons: 32,
      nextLesson: "Module 9: Deploying Next.js & Node.js Microservices",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      category: "Computer Science",
      duration: "3 Months",
      status: "Active",
      description: "Hands-on full stack engineering with React, Next.js, Express, and MongoDB.",
      syllabus: [
        { section: "Frontend", topics: ["React Hooks & Context API", "Next.js App Router", "TailwindCSS Styling"] },
        { section: "Backend", topics: ["Node.js Server Architecture", "MongoDB Aggregation & Schemas", "JWT Security"] },
      ],
    },
  ]);

  const [attendanceLogs] = useState<AttendanceRecord[]>([
    { id: "att-1", date: "11 Aug 2026", day: "Tuesday", batch: "NEET Batch A", subject: "Physics & Chemistry", status: "Present", checkIn: "08:55 AM", remarks: "Regular Attendance" },
    { id: "att-2", date: "10 Aug 2026", day: "Monday", batch: "NEET Batch A", subject: "Botany & Zoology", status: "Present", checkIn: "08:58 AM", remarks: "Regular Attendance" },
    { id: "att-3", date: "09 Aug 2026", day: "Sunday", batch: "NEET Batch A", subject: "Sunday Grand Mock Test", status: "Present", checkIn: "09:45 AM", remarks: "Test Session" },
    { id: "att-4", date: "08 Aug 2026", day: "Saturday", batch: "NEET Batch A", subject: "Organic Chemistry Drill", status: "Present", checkIn: "08:50 AM", remarks: "Regular Attendance" },
  ]);

  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: "asg-1",
      title: "Worksheet #04: Rotational Motion & Torque",
      course: "NEET Comprehensive 2026",
      dueDate: "14 Aug 2026",
      status: "Pending",
      totalMarks: 50,
      instructions: "Solve all 25 numerical problems in your exercise notebook and submit clear PDF scan with step-by-step working.",
    },
    {
      id: "asg-2",
      title: "NCERT Organic Mechanisms Drill #02",
      course: "NEET Comprehensive 2026",
      dueDate: "10 Aug 2026",
      status: "Submitted",
      totalMarks: 100,
      obtainedMarks: 94,
      instructions: "Explain Aldol condensation, Cannizzaro reaction, and Reimer-Tiemann mechanism with energy diagrams.",
      submittedFile: "Organic_Mechanisms_Drill2.pdf",
      submittedAt: "09 Aug 2026, 11:20 PM",
    },
    {
      id: "asg-3",
      title: "Definite Integrals Practice Sheet",
      course: "JEE Main & Advanced Mathematics Crash Course",
      dueDate: "05 Aug 2026",
      status: "Approved",
      totalMarks: 40,
      obtainedMarks: 38,
      instructions: "Solve properties of definite integrals problems from Chapter 7.",
      submittedFile: "Definite_Integrals_Worksheet.pdf",
      submittedAt: "04 Aug 2026, 07:15 PM",
    },
  ]);

  const [tests] = useState<TestItem[]>([
    {
      id: "t-1",
      title: "NEET All-India Major Test Series #05",
      course: "NEET Comprehensive 2026",
      batch: "NEET Batch A",
      date: "16 Aug 2026",
      time: "10:00 AM - 01:20 PM",
      durationMinutes: 200,
      totalMarks: 720,
      status: "Upcoming",
    },
    {
      id: "t-2",
      title: "Biology Speed Drill - Genetics & Evolution",
      course: "NEET Comprehensive 2026",
      batch: "NEET Batch A",
      date: "12 Aug 2026",
      time: "04:00 PM - 05:00 PM",
      durationMinutes: 60,
      totalMarks: 180,
      status: "Active Now",
    },
    {
      id: "t-3",
      title: "Physics Mechanics Part 1 Assessment",
      course: "NEET Comprehensive 2026",
      batch: "NEET Batch A",
      date: "02 Aug 2026",
      time: "10:00 AM - 01:00 PM",
      durationMinutes: 180,
      totalMarks: 360,
      status: "Completed",
      obtainedMarks: 335,
      rank: 4,
      totalStudents: 185,
    },
    {
      id: "t-4",
      title: "Chemistry Equilibrium & Kinetics Test",
      course: "NEET Comprehensive 2026",
      batch: "NEET Batch A",
      date: "25 Jul 2026",
      time: "10:00 AM - 01:00 PM",
      durationMinutes: 180,
      totalMarks: 360,
      status: "Completed",
      obtainedMarks: 342,
      rank: 2,
      totalStudents: 182,
    },
  ]);

  const [certificates] = useState<CertificateItem[]>([
    {
      id: "cert-1",
      title: "Certificate of Achievement - Biology Foundations",
      course: "NEET Comprehensive 2026",
      issuedDate: "09 Aug 2026",
      certificateNo: "MYEDOU-CERT-2026-8841",
      downloadUrl: "#",
    },
    {
      id: "cert-2",
      title: "Certificate of Completion - React & Next.js Core",
      course: "MERN Stack Web Development Specialization",
      issuedDate: "15 Jul 2026",
      certificateNo: "MYEDOU-CERT-2026-7712",
      downloadUrl: "#",
    },
  ]);

  const [totalFee] = useState<number>(10001);
  const [paidFee, setPaidFee] = useState<number>(5000);
  const pendingFee = totalFee - paidFee;

  const [paymentReceipts, setPaymentReceipts] = useState<FeeReceipt[]>([
    {
      id: "rcp-1",
      receiptNo: "RCP-202606-9430",
      date: "15 Jun 2025",
      mode: "Online",
      amount: 5000,
      status: "Success",
      description: "1st Installment Admission Fee - NEET Dropper Batch 2026",
    },
    {
      id: "rcp-2",
      receiptNo: "RCP-202606-5093",
      date: "10 Jul 2025",
      mode: "UPI",
      amount: 0,
      status: "Cancelled",
      description: "Failed UPI Transaction (Timed Out)",
    },
  ]);

  const [courseStore, setCourseStore] = useState<CourseStoreItem[]>([
    {
      id: "store-1",
      title: "NEET Batch A Intensive Crash & Test Series 2026",
      category: "Medical Entrance",
      price: 5000,
      originalPrice: 12000,
      duration: "6 Months",
      level: "Advanced Dropper Level",
      rating: 4.9,
      reviewsCount: 340,
      isEnrolled: true,
      badge: "BESTSELLER",
      description: "Comprehensive test series + live problem solving with top AIIMS alumni faculties.",
      features: ["50+ Full Mock Tests", "1-on-1 Doubt Sessions", "Printed NCERT Maps", "Performance Analytics"],
    },
    {
      id: "store-2",
      title: "JEE Mains & Advanced Mathematics Mastery 2026",
      category: "Engineering Entrance",
      price: 4999,
      originalPrice: 9999,
      duration: "5 Months",
      level: "Target Top 1000",
      rating: 4.8,
      reviewsCount: 210,
      isEnrolled: false,
      badge: "POPULAR",
      description: "Master calculus, algebra, and coordinate geometry with high-yield shortcut tricks.",
      features: ["300+ Video Lectures", "Topic-wise Problem Banks", "Weekly Live Quizzes", "Rank Predictor"],
    },
    {
      id: "store-3",
      title: "Full Stack MERN & Next.js Boot Camp (Special Discount)",
      category: "Computer Science",
      price: 1,
      originalPrice: 4999,
      duration: "3 Months",
      level: "Beginner to Advanced",
      rating: 4.95,
      reviewsCount: 520,
      isEnrolled: false,
      badge: "FLASH OFFER ₹1",
      description: "Learn web development from scratch to production deployment with live projects.",
      features: ["React 19 & Next.js 16", "Express & MongoDB", "TailwindCSS & Framer Motion", "Job Portal Access"],
    },
  ]);

  const updateProfile = (updated: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitAssignment = (id: string, fileName: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "Submitted",
              submittedFile: fileName,
              submittedAt: new Date().toLocaleString(),
            }
          : a
      )
    );
  };

  const addPayment = (amount: number, mode: "Online" | "UPI" | "Cash") => {
    const newReceipt: FeeReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNo: `RCP-202608-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      mode,
      amount,
      status: "Success",
      description: "Balance Fee Payment Clearance",
    };
    setPaymentReceipts((prev) => [newReceipt, ...prev]);
    setPaidFee((prev) => prev + amount);
  };

  const enrollInStoreCourse = (courseId: string) => {
    setCourseStore((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isEnrolled: true } : c))
    );
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        updateProfile,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        enrolledCourses,
        attendanceLogs,
        assignments,
        submitAssignment,
        tests,
        certificates,
        totalFee,
        paidFee,
        pendingFee,
        paymentReceipts,
        addPayment,
        courseStore,
        enrollInStoreCourse,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
}

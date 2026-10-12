"use client";

/**
 * Student portal client state.
 *
 * `profile` and `pendingFee` are the signed-in student's real data, loaded
 * server-side by app/student-portal/layout.tsx (getMyProfile / getMyFees) and
 * passed in as props — call `router.refresh()` after a mutation to reload them.
 * Courses, fees and the store are fetched per page from server actions.
 *
 * Still simulated here (POC): notifications bell feed, attendance logs,
 * assignments, tests and certificates fallbacks.
 */
import React, { createContext, useContext, useState } from "react";
import type { MyProfile } from "@/lib/actions/student-portal";

export type StudentProfile = MyProfile;

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

interface StudentContextType {
  profile: StudentProfile;
  /** Outstanding fee balance across the student's invoices (live). */
  pendingFee: number;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  attendanceLogs: AttendanceRecord[];
  assignments: AssignmentItem[];
  submitAssignment: (id: string, fileName: string) => void;
  tests: TestItem[];
  certificates: CertificateItem[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({
  children,
  profile,
  pendingFee,
}: {
  children: React.ReactNode;
  profile: StudentProfile;
  pendingFee: number;
}) {
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
      certificateNo: "AURAEDU-CERT-2026-8841",
      downloadUrl: "#",
    },
    {
      id: "cert-2",
      title: "Certificate of Completion - React & Next.js Core",
      course: "MERN Stack Web Development Specialization",
      issuedDate: "15 Jul 2026",
      certificateNo: "AURAEDU-CERT-2026-7712",
      downloadUrl: "#",
    },
  ]);

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

  return (
    <StudentContext.Provider
      value={{
        profile,
        pendingFee,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        attendanceLogs,
        assignments,
        submitAssignment,
        tests,
        certificates,
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

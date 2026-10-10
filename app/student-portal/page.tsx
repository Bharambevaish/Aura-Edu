"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import { getStudentAssignments, type StudentAssignmentRow } from "@/lib/actions/assignments";
import { getStudentAttendance, type StudentAttendance } from "@/lib/actions/attendance";
import {
  BookOpen,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Award,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Calendar,
  X,
  CreditCard,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function StudentDashboardPage() {
  const {
    profile,
    enrolledCourses,
    assignments,
    tests,
    certificates,
    pendingFee,
  } = useStudent();

  const [showFeeModal, setShowFeeModal] = useState(pendingFee > 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dbAssignments, setDbAssignments] = useState<StudentAssignmentRow[] | null>(null);
  const [dbAttendance, setDbAttendance] = useState<StudentAttendance | null>(null);

  useEffect(() => {
    let ignore = false;
    getStudentAssignments()
      .then((data) => {
        if (!ignore) setDbAssignments(data);
      })
      .catch(() => {
        // Fall back to context assignments below; the dashboard still renders.
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    getStudentAttendance()
      .then((data) => {
        if (!ignore) setDbAttendance(data);
      })
      .catch(() => {
        // Attendace falls back to the demo context values below.
      });
    return () => {
      ignore = true;
    };
  }, []);

  const realAssignments = dbAssignments ?? assignments;
  const pendingAssignmentsCount = realAssignments.filter((a) => a.status === "Pending").length;
  const upcomingTestsCount = tests.filter((t) => t.status === "Upcoming" || t.status === "Active Now").length;

  // Live attendance wins once registers exist; otherwise keep the demo 100% story.
  const attendanceLive = !!dbAttendance && dbAttendance.totalSessions > 0;
  const attendancePct = attendanceLive ? dbAttendance!.overallPercentage : 100;
  const presentDays = attendanceLive ? dbAttendance!.present : 4;
  const totalTrackedDays = attendanceLive ? dbAttendance!.totalSessions : 4;

  const totalLessons = enrolledCourses.reduce((sum, c) => sum + c.totalLessons, 0);
  const completedLessons = enrolledCourses.reduce((sum, c) => sum + c.completedLessons, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Payment Reminder Alert Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 p-6 md:p-8 shadow-2xl shadow-amber-500/10">
            <button
              onClick={() => setShowFeeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-7 w-7 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase font-mono">
                  ACTION REQUIRED
                </span>
                <h3 className="text-xl font-bold text-white">Payment Reminder Pending</h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Dear <strong className="text-white">{profile.name}</strong>, your course fee payment installment is currently pending. Outstanding due amount:
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-slate-400 font-medium">Pending Installment Due</p>
                <p className="text-2xl font-black text-amber-400 font-mono">₹{pendingFee.toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                DUE NOW
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student-portal/fees"
                onClick={() => setShowFeeModal(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all"
              >
                <CreditCard className="h-4.5 w-4.5" /> Pay Due Amount Now
              </Link>
              <button
                onClick={() => setShowFeeModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 hover:text-white transition-colors"
              >
                Remind Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/40 p-6 md:p-8 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase font-mono">
                ADMISSION: {profile.admissionNo}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                {attendancePct === 100 ? "100% Attendance" : `${attendancePct}% Attendance`}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Welcome back, {profile.name}! <Sparkles className="h-6 w-6 text-cyan-400" />
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              You are currently enrolled in <strong className="text-cyan-400">{profile.course}</strong> ({profile.batch}). Keep pushing your academic goals today!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <span>Refresh Metrics</span>
            </button>

            <Link
              href="/student-portal/schedule"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Calendar className="h-4 w-4" />
              <span>Today&apos;s Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Metrics Grid (6 Overview Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Courses Enrolled */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Courses Enrolled</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{enrolledCourses.length}</p>
          <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Active Batches
          </p>
        </div>

        {/* Card 2: Completed Lessons */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Lessons Finished</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{completedLessons}/{totalLessons}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3 w-3" /> {Math.round((completedLessons / totalLessons) * 100)}% Syllabus
          </p>
        </div>

        {/* Card 3: Assignments Pending */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Pending Work</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{pendingAssignmentsCount}</p>
          <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
            Due this week
          </p>
        </div>

        {/* Card 4: Upcoming Tests */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Upcoming Tests</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{upcomingTestsCount}</p>
          <p className="text-[11px] text-purple-400 mt-1 flex items-center gap-1 font-medium">
            Mock & Major
          </p>
        </div>

        {/* Card 5: Certificates Earned */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Certificates</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{certificates.length}</p>
          <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-medium">
            Verified Badges
          </p>
        </div>

        {/* Card 6: Attendance % */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Attendance</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{attendancePct}%</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> {presentDays}/{totalTrackedDays} Days Present
          </p>
        </div>
      </div>

      {/* 4. Quick Actions Panel */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 font-mono">
          <Sparkles className="h-4 w-4 text-cyan-400" /> QUICK ACTION SHORTCUTS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/student-portal/my-courses"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <BookOpen className="h-6 w-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">My Courses</span>
          </Link>
          <Link
            href="/student-portal/schedule"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <Calendar className="h-6 w-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Class Schedule</span>
          </Link>
          <Link
            href="/student-portal/assignments"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <FileCheck className="h-6 w-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Assignments</span>
          </Link>
          <Link
            href="/student-portal/tests"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <GraduationCap className="h-6 w-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Tests & Quizzes</span>
          </Link>
          <Link
            href="/student-portal/attendance"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <Clock className="h-6 w-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Attendance</span>
          </Link>
          <Link
            href="/student-portal/certificates"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all text-center group"
          >
            <Award className="h-6 w-6 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-white">Certificates</span>
          </Link>
        </div>
      </div>

      {/* 5. Performance Center + Upcoming Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic Performance Card & Enrolled Course Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Center */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" /> Academic Score Center
              </h3>
              <Link
                href="/student-portal/test-card"
                className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Detailed Test Card <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Recent Test Score</span>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">335 / 360</p>
                <p className="text-[11px] text-slate-400 mt-1">Physics Mechanics Assessment</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Batch Rank</span>
                <p className="text-2xl font-black text-cyan-400 font-mono mt-1">#4 <span className="text-xs text-slate-400 font-normal">of 185</span></p>
                <p className="text-[11px] text-emerald-400 mt-1">Top 3% Percentile</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-xs font-semibold text-slate-400">Overall Accuracy</span>
                <p className="text-2xl font-black text-purple-400 font-mono mt-1">93.1%</p>
                <p className="text-[11px] text-slate-400 mt-1">Across 4 Mock Drills</p>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300">Faculty-Marked Attendance</span>
                <span className="font-bold text-emerald-400 font-mono">{attendancePct}% Attendance</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Course Card */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-cyan-400" /> Active Course Tracker
              </h3>
              <Link
                href="/student-portal/my-courses"
                className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                All Courses <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {enrolledCourses.slice(0, 2).map((course) => (
              <div
                key={course.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">
                    {course.code}
                  </span>
                  <h4 className="text-base font-bold text-white">{course.title}</h4>
                  <p className="text-xs text-slate-400">Next: {course.nextLesson}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-cyan-400 font-mono">{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/student-portal/my-courses/${course.id}/learn`}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors whitespace-nowrap"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Activities & Widgets */}
        <div className="space-y-6">
          {/* Test Center Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-400" /> Upcoming Tests
              </h3>
              <Link
                href="/student-portal/tests"
                className="text-xs font-semibold text-purple-400 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {tests.slice(0, 2).map((test) => (
                <div key={test.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      test.status === "Active Now"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}>
                      {test.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{test.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{test.title}</h4>
                  <p className="text-[11px] text-slate-400">{test.time} ({test.durationMinutes} mins)</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Assignment Widget */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-400" /> Assignments Due
              </h3>
              <Link
                href="/student-portal/assignments"
                className="text-xs font-semibold text-amber-400 hover:underline"
              >
                Submission Portal
              </Link>
            </div>

            <div className="space-y-3">
              {realAssignments.slice(0, 2).map((asg) => (
                <div key={asg.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      asg.status === "Pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : asg.status === "Overdue"
                        ? "bg-red-500/20 text-red-400"
                        : asg.status === "Submitted"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {asg.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Due: {asg.dueDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{asg.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{asg.course}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

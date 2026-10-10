"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Download,
} from "lucide-react";

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params?.id as string;
  const { enrolledCourses, profile } = useStudent();

  const course = enrolledCourses.find((c) => c.id === courseId) || enrolledCourses[0];

  const lessonsList = [
    { id: 1, title: "Lesson 01: Course Orientation & NCERT Strategy", duration: "24:15", type: "video", completed: true },
    { id: 2, title: "Lesson 02: Kinematics 1D Motion Basics", duration: "45:30", type: "video", completed: true },
    { id: 3, title: "Lesson 03: Vector Analysis & Relative Velocity", duration: "50:10", type: "video", completed: true },
    { id: 4, title: "Lesson 04: Newton's Laws & Friction Worksheets", duration: "38:40", type: "document", completed: false },
    { id: 5, title: "Lesson 05: Rotational Mechanics Numerical Drills", duration: "55:00", type: "video", completed: false },
  ];

  const [activeLesson, setActiveLesson] = useState(lessonsList[2]);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "discussion">("overview");

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Back CTA */}
      <div className="flex items-center justify-between p-4 md:p-6 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/student-portal/my-courses"
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider uppercase">
              {course.code} • VIDEO LEARNING CANVAS
            </span>
            <h2 className="text-lg font-bold text-white line-clamp-1">{course.title}</h2>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono border border-emerald-500/20">
            Progress: {course.progress}%
          </span>
        </div>
      </div>

      {/* 2. Main Player & Lesson Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Video Canvas Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulated Video Player Container with Security Overlay */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-6">
            {/* Watermark Security Text */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-15deg]">
              <p className="text-xl md:text-3xl font-black text-cyan-400 font-mono select-none">
                {profile.email} • {profile.admissionNo} • MYEDOU PLAYER
              </p>
            </div>

            {/* Top Bar inside Player */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl backdrop-blur-md border border-slate-800">
              <span className="font-semibold text-white flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-cyan-400" /> {activeLesson.title}
              </span>
              <span className="font-mono text-cyan-400">{activeLesson.duration}</span>
            </div>

            {/* Center Video Play Simulation Graphic */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4 my-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                <PlayCircle className="h-10 w-10" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Click to stream 1080p HD Encrypted Video Session
              </p>
            </div>

            {/* Bottom Controls inside Player */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl backdrop-blur-md border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>HD 1080p Live Stream</span>
              </div>
              <span className="font-mono text-slate-300">Watermark Secured</span>
            </div>
          </div>

          {/* Lesson Metadata & Tabbed Discussion */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Current Unit</span>
                <h3 className="text-lg font-bold text-white">{activeLesson.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-cyan-500/20">
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-2.5 font-bold transition-colors border-b-2 ${
                  activeTab === "overview"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-2.5 font-bold transition-colors border-b-2 ${
                  activeTab === "notes"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Downloadable PDF Notes
              </button>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`pb-2.5 font-bold transition-colors border-b-2 ${
                  activeTab === "discussion"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Doubt Discussion Portal
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  In this session, Dr. A. Verma covers high-yield vector operations, dot & cross product resolution, and relative velocity vectors in 2D space.
                </p>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
                  <p>• Key Focus 1: Rain-man & River-swimmer problem vectors</p>
                  <p>• Key Focus 2: Standard NCERT Exercises 3.1 to 3.12</p>
                  <p>• Key Focus 3: PYQ Analysis from NEET 2019-2025</p>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Handwritten_Lecture_Notes_Unit3.pdf</h4>
                      <p className="text-[10px] text-slate-400">PDF • 4.2 MB • Watermarked for {profile.name}</p>
                    </div>
                  </div>
                  <button className="px-3 py-2 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask a question about this lecture..."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-500"
                  />
                  <button className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs">
                    Post Doubt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Course Lessons Playlist */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-400" /> Course Modules & Lessons
            </h3>

            <div className="space-y-2">
              {lessonsList.map((les) => (
                <button
                  key={les.id}
                  onClick={() => setActiveLesson(les)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    activeLesson.id === les.id
                      ? "bg-cyan-950/40 border-cyan-500/40 text-white"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {les.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold line-clamp-1">{les.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{les.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

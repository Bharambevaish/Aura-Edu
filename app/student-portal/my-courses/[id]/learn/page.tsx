"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { getMyCourse, setLessonComplete, type MyCourse, type MyLesson } from "@/lib/actions/student-portal";
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
  const { profile } = useStudent();

  // undefined = loading, null = not found / not enrolled
  const [course, setCourse] = useState<MyCourse | null | undefined>(undefined);
  const [selectedLesson, setSelectedLesson] = useState<MyLesson | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "discussion">("overview");
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    let ignore = false;
    getMyCourse(courseId)
      .then((data) => {
        if (!ignore) setCourse(data);
      })
      .catch(() => {
        if (!ignore) setCourse(null);
      });
    return () => {
      ignore = true;
    };
  }, [courseId]);

  if (course === undefined) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-sm text-slate-400">
        Loading course…
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
        <BookOpen className="h-8 w-8 text-cyan-400 mx-auto" />
        <p className="text-sm font-semibold text-white">This course is not available in your account.</p>
        <Link href="/student-portal/my-courses" className="text-xs font-semibold text-cyan-400 hover:underline">
          Back to My Courses
        </Link>
      </div>
    );
  }

  const lessonsList = course.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
  const completed = new Set(course.completedLessonIds);
  // Default to the first lesson not yet completed.
  const activeLesson =
    (selectedLesson && lessonsList.find((l) => l.id === selectedLesson.id)) ||
    lessonsList.find((l) => !completed.has(l.id)) ||
    lessonsList[0];
  const activeDone = !!activeLesson && completed.has(activeLesson.id);

  const toggleComplete = async () => {
    if (!activeLesson) return;
    setSavingProgress(true);
    try {
      const res = await setLessonComplete(course.id, activeLesson.id, !activeDone);
      if (res.ok) {
        const refreshed = await getMyCourse(course.id);
        if (refreshed) setCourse(refreshed);
        // After completing, move on to the next lesson in order.
        if (!activeDone) {
          const idx = lessonsList.findIndex((l) => l.id === activeLesson.id);
          const next = lessonsList[idx + 1];
          if (next) setSelectedLesson(next);
        }
      }
    } finally {
      setSavingProgress(false);
    }
  };

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
            Progress: {course.completedLessons}/{course.totalLessons} ({course.progress}%)
          </span>
        </div>
      </div>

      {/* 2. Main Player & Lesson Navigation Layout */}
      {!activeLesson ? (
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center text-sm text-slate-400">
          Lessons for this course have not been published yet.
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column: Video Canvas Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulated Video Player Container with Security Overlay */}
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-6">
            {/* Watermark Security Text */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-15deg]">
              <p className="text-xl md:text-3xl font-black text-cyan-400 font-mono select-none">
                {profile.email} • {profile.admissionNo} • AURAEDU PLAYER
              </p>
            </div>

            {/* Top Bar inside Player */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl backdrop-blur-md border border-slate-800">
              <span className="font-semibold text-white flex items-center gap-2">
                <PlayCircle className="h-4 w-4 text-cyan-400" /> {activeLesson.title}
              </span>
              <span className="font-mono text-cyan-400">{activeLesson.duration || "—"}</span>
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
                <button
                  onClick={toggleComplete}
                  disabled={savingProgress}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
                    activeDone
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {savingProgress ? "Saving…" : activeDone ? "Completed · Undo" : "Mark Complete"}
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
                  {activeLesson.title} is part of <strong className="text-white">{activeLesson.moduleTitle}</strong> in{" "}
                  {course.title}
                  {course.instructor ? `, taught by ${course.instructor}` : ""}.
                </p>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px] text-slate-400">
                  <p>• Format: {activeLesson.type}</p>
                  <p>• Duration: {activeLesson.duration || "—"}</p>
                  <p>• Module: {activeLesson.moduleTitle}</p>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{activeLesson.title} — study material</h4>
                      <p className="text-[10px] text-slate-400">
                        {activeLesson.url ? `Shared by your faculty for ${profile.name}` : "No material uploaded for this lesson yet."}
                      </p>
                    </div>
                  </div>
                  {activeLesson.url ? (
                    <a
                      href={activeLesson.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Open
                    </a>
                  ) : (
                    <span className="px-3 py-2 rounded-xl bg-slate-900 text-slate-500 text-xs font-semibold">Not available</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === "discussion" && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex gap-3">
                  <input
                    type="text"
                    disabled
                    placeholder="Doubt discussions are coming soon — ask your faculty in class meanwhile."
                    className="flex-1 bg-transparent text-xs text-white outline-none placeholder-slate-500 cursor-not-allowed"
                  />
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 font-bold text-xs">Coming soon</span>
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
                  onClick={() => setSelectedLesson(les)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    activeLesson.id === les.id
                      ? "bg-cyan-950/40 border-cyan-500/40 text-white"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completed.has(les.id) ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    ) : les.type === "video" ? (
                      <PlayCircle className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold line-clamp-1">{les.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {les.moduleTitle} · {les.duration || les.type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

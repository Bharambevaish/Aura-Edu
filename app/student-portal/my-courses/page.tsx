"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStudent } from "@/context/StudentContext";
import { getMyCourses, type MyCourse } from "@/lib/actions/student-portal";
import {
  BookOpen,
  Search,
  LayoutGrid,
  List,
  CheckCircle2,
  PlayCircle,
  FileText,
  X,
  Sparkles,
  Info,
} from "lucide-react";

/** next/image only proxies hosts allowed in next.config.ts; anything else gets a placeholder. */
function hasRenderableThumb(url: string) {
  return url.startsWith("https://images.unsplash.com/");
}

function ThumbPlaceholder({ className }: { className: string }) {
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-br from-cyan-950 to-slate-900`}>
      <BookOpen className="h-8 w-8 text-cyan-500/50" />
    </div>
  );
}

export default function MyCoursesPage() {
  const { profile } = useStudent();

  const [enrolledCourses, setEnrolledCourses] = useState<MyCourse[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCourse, setSelectedCourse] = useState<MyCourse | null>(null);

  useEffect(() => {
    let ignore = false;
    getMyCourses()
      .then((data) => {
        if (!ignore) setEnrolledCourses(data);
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (!enrolledCourses) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-sm text-slate-400">
        {loadError ? "Could not load your courses. Please refresh the page." : "Loading your courses…"}
      </div>
    );
  }

  const totalModules = enrolledCourses.reduce((s, c) => s + c.modules.length, 0);
  const totalLessons = enrolledCourses.reduce((s, c) => s + c.totalLessons, 0);
  const videoLessons = enrolledCourses.reduce(
    (s, c) => s + c.modules.reduce((n, m) => n + m.lessons.filter((l) => l.type === "video").length, 0),
    0,
  );

  const filteredCourses = enrolledCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Stats Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">My Enrolled Courses</h2>
            </div>
            <p className="text-xs text-slate-400">
              Access video lectures, syllabus breakdown, and reading study materials for your active batches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student-portal/course-store"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> Explore Course Store
            </Link>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs text-slate-400">Enrolled Courses</span>
            <p className="text-xl font-black text-white font-mono">{enrolledCourses.length}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Modules</span>
            <p className="text-xl font-black text-cyan-400 font-mono">{totalModules}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Lessons</span>
            <p className="text-xl font-black text-emerald-400 font-mono">{totalLessons}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400">Video Lessons</span>
            <p className="text-xl font-black text-purple-400 font-mono">{videoLessons}</p>
          </div>
        </div>
      </div>

      {/* 2. Controls: Search + Grid/List View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl border transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl border transition-all ${
              viewMode === "list"
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Course Catalog Rendering */}
      {enrolledCourses.length === 0 ? (
        <div className="p-10 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
          <BookOpen className="h-8 w-8 text-cyan-400 mx-auto" />
          <p className="text-sm font-semibold text-white">You are not enrolled in any course yet.</p>
          <Link href="/student-portal/course-store" className="text-xs font-semibold text-cyan-400 hover:underline">
            Browse the Course Store
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Course Banner Image */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  {hasRenderableThumb(course.thumbnail) ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                  ) : (
                    <ThumbPlaceholder className="absolute inset-0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-bold text-cyan-400 font-mono">
                    {course.code}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Enrolled
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400">Instructor: {course.instructor || "—"}</p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Curriculum size */}
                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-400">Curriculum</span>
                    <span className="font-bold text-cyan-400 font-mono">
                      {course.modules.length} modules · {course.totalLessons} lessons
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <Link
                  href={`/student-portal/my-courses/${course.id}/learn`}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <PlayCircle className="h-4 w-4" /> Continue Learning
                </Link>
                <button
                  onClick={() => setSelectedCourse(course)}
                  className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Course Details & Syllabus"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                {hasRenderableThumb(course.thumbnail) ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    width={112}
                    height={80}
                    className="h-20 w-28 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                ) : (
                  <ThumbPlaceholder className="h-20 w-28 rounded-xl shrink-0 border border-slate-800" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold font-mono">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-400">{course.duration}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400">Instructor: {course.instructor || "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="hidden sm:block text-xs font-bold text-cyan-400 font-mono">
                  {course.modules.length} modules · {course.totalLessons} lessons
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/student-portal/my-courses/${course.id}/learn`}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all flex items-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" /> Continue
                  </Link>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Course Details Popup Dialog with Watermark & Syllabus Breakdown */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl">
            {/* Security Watermark Background */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 rotate-[-30deg]">
              <span className="text-4xl md:text-5xl font-black text-cyan-400 tracking-widest font-mono select-none">
                AURAEDU • {profile.admissionNo} • CONFIDENTIAL
              </span>
            </div>

            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono border border-cyan-500/30">
                  {selectedCourse.code} • {selectedCourse.category}
                </span>
                <h2 className="text-2xl font-bold text-white">{selectedCourse.title}</h2>
                <p className="text-xs text-slate-400">
                  Faculty: <strong className="text-white">{selectedCourse.instructor || "—"}</strong> | Duration: {selectedCourse.duration || "—"}
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                {selectedCourse.description}
              </p>

              {/* Detailed Syllabus Sections */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400" /> Syllabus Structure & Modules
                </h4>

                <div className="space-y-3">
                  {selectedCourse.modules.length === 0 && (
                    <p className="text-xs text-slate-500">The curriculum for this course has not been published yet.</p>
                  )}
                  {selectedCourse.modules.map((mod) => (
                    <div key={mod.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <h5 className="text-xs font-bold text-cyan-400">{mod.title}</h5>
                      <ul className="space-y-1">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="text-xs text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>{lesson.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <Link
                  href={`/student-portal/my-courses/${selectedCourse.id}/learn`}
                  onClick={() => setSelectedCourse(null)}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 text-center shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" /> Open Course Player
                </Link>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

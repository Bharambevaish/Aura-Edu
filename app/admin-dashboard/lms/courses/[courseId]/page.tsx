"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Video,
  FileText,
  Edit3,
  Loader2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { LESSON_TYPES } from "@/lib/courses";
import type { LessonType } from "@/lib/courses";
import {
  getCourseDetail,
  addModule,
  renameModule,
  deleteModule,
  moveModule,
  addLesson,
  updateLesson,
  deleteLesson,
  moveLesson,
} from "@/lib/actions/courses";
import type { CourseDetail, CourseModuleDTO, CourseLessonDTO } from "@/lib/actions/courses";

const input =
  "w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-[#5E9A2E] focus:ring-1 focus:ring-[#5E9A2E] placeholder-slate-500 text-sm";

const typeMeta: Record<LessonType, { icon: React.ReactNode; cls: string }> = {
  video: { icon: <Video size={13} />, cls: "bg-blue-500/15 text-blue-300" },
  document: { icon: <FileText size={13} />, cls: "bg-amber-500/15 text-amber-300" },
  quiz: { icon: <Edit3 size={13} />, cls: "bg-purple-500/15 text-purple-300" },
};

export default function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = React.use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Module modals
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleBusy, setModuleBusy] = useState(false);
  const [editModule, setEditModule] = useState<CourseModuleDTO | null>(null);

  // Lesson modals
  const [openLesson, setOpenLesson] = useState<{ moduleId: string; lesson: CourseLessonDTO | null } | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("video");
  const [lessonUrl, setLessonUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonBusy, setLessonBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await getCourseDetail(courseId);
    setCourse(data);
  }, [courseId]);

  useEffect(() => {
    let ignore = false;
    getCourseDetail(courseId)
      .then((data) => {
        if (!ignore) setCourse(data);
      })
      .catch(() => toast("Failed to load course.", "error"))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [courseId, toast]);

  const toggleModule = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ------------------------- module actions ------------------------- */

  const onCreateModule = async () => {
    if (!moduleTitle.trim()) {
      toast("Module title is required.", "error");
      return;
    }
    setModuleBusy(true);
    try {
      const r = await addModule(courseId, { title: moduleTitle.trim() });
      if (r.ok) {
        toast("Module added.");
        setAddModuleOpen(false);
        setModuleTitle("");
        await load();
      } else toast(r.message ?? "Could not add module.", "error");
    } catch { toast("Could not add module.", "error"); }
    finally { setModuleBusy(false); }
  };

  const onRenameModule = async () => {
    if (!editModule) return;
    if (!moduleTitle.trim()) {
      toast("Module title is required.", "error");
      return;
    }
    setModuleBusy(true);
    try {
      const r = await renameModule(courseId, editModule.id, { title: moduleTitle.trim() });
      if (r.ok) {
        toast("Module renamed.");
        setEditModule(null);
        setModuleTitle("");
        await load();
      } else toast(r.message ?? "Could not rename module.", "error");
    } catch { toast("Could not rename module.", "error"); }
    finally { setModuleBusy(false); }
  };

  const onDeleteModuleConfirm = async (m: CourseModuleDTO) => {
    if (!window.confirm(`Delete module "${m.title}" and its ${m.lessons.length} lesson(s)?`)) return;
    try {
      const r = await deleteModule(courseId, m.id);
      if (r.ok) {
        toast("Module deleted.");
        await load();
      } else toast(r.message ?? "Could not delete module.", "error");
    } catch { toast("Could not delete module.", "error"); }
  };

  const onMoveModule = async (m: CourseModuleDTO, dir: "up" | "down") => {
    await moveModule(courseId, m.id, dir);
    await load();
  };

  /* ------------------------- lesson actions ------------------------- */

  const openCreateLesson = (moduleId: string) => {
    setOpenLesson({ moduleId, lesson: null });
    setLessonTitle("");
    setLessonType("video");
    setLessonUrl("");
    setLessonDuration("");
  };

  const openEditLesson = (moduleId: string, lesson: CourseLessonDTO) => {
    setOpenLesson({ moduleId, lesson });
    setLessonTitle(lesson.title);
    setLessonType(lesson.type);
    setLessonUrl(lesson.url);
    setLessonDuration(lesson.duration);
  };

  const onSaveLesson = async () => {
    if (!openLesson) return;
    if (!lessonTitle.trim()) {
      toast("Lesson title is required.", "error");
      return;
    }
    setLessonBusy(true);
    try {
      const payload = {
        title: lessonTitle.trim(),
        type: lessonType,
        url: lessonUrl.trim(),
        duration: lessonDuration.trim(),
      };
      const r = openLesson.lesson
        ? await updateLesson(courseId, openLesson.moduleId, openLesson.lesson.id, payload)
        : await addLesson(courseId, openLesson.moduleId, payload);
      if (r.ok) {
        toast(openLesson.lesson ? "Lesson updated." : "Lesson added.");
        setOpenLesson(null);
        await load();
      } else toast(r.message ?? "Could not save lesson.", "error");
    } catch { toast("Could not save lesson.", "error"); }
    finally { setLessonBusy(false); }
  };

  const onDeleteLesson = async (m: CourseModuleDTO, l: CourseLessonDTO) => {
    if (!window.confirm(`Delete lesson "${l.title}"?`)) return;
    try {
      const r = await deleteLesson(courseId, m.id, l.id);
      if (r.ok) {
        toast("Lesson deleted.");
        await load();
      } else toast(r.message ?? "Could not delete lesson.", "error");
    } catch { toast("Could not delete lesson.", "error"); }
  };

  const onMoveLesson = async (l: CourseLessonDTO, dir: "up" | "down") => {
    await moveLesson(courseId, currentModuleIdOf(l), l.id, dir);
    await load();
  };

  const currentModuleIdOf = (l: CourseLessonDTO) =>
    course?.modules.find((m) => m.lessons.some((x) => x.id === l.id))?.id ?? "";

  /* ------------------------------ render ------------------------------ */

  if (loading && !course) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="text-slate-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <EmptyState
        title="Course not found"
        message="It may have been deleted."
        action={<Link href="/admin-dashboard/lms/courses"><Button variant="secondary">Back to courses</Button></Link>}
      />
    );
  }

  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Back nav + title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href="/admin-dashboard/lms/courses"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Course Content
          </Link>
          <div className="flex items-center gap-3">
            {course.thumbnail ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                <Image src={course.thumbnail} alt={course.title} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                <Layers size={20} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {course.code} · {course.category}
                <span className={`ml-2 capitalize ${course.published ? "text-emerald-400" : "text-slate-500"}`}>
                  {course.published ? "active" : "draft"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <Button onClick={() => { setEditModule(null); setModuleTitle(""); setAddModuleOpen(true); }}>
          <Plus size={16} /> Add Module
        </Button>
      </div>

      {/* Curriculum summary */}
      <div className="grid grid-cols-3 gap-3 max-w-md">
        <div className="glass-panel rounded-xl p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Modules</p>
          <p className="text-2xl font-bold text-white mt-1">{course.modules.length}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Lessons</p>
          <p className="text-2xl font-bold text-white mt-1">{lessonCount}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-white/5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Enrolled</p>
          <p className="text-2xl font-bold text-white mt-1">{course.enrolled}</p>
        </div>
      </div>

      {/* Modules */}
      {course.modules.length === 0 ? (
        <EmptyState
          icon={<Layers size={22} />}
          title="No modules yet"
          message="Start building the curriculum — add your first module and lessons."
          action={<Button onClick={() => setAddModuleOpen(true)}><Plus size={16} /> Add Module</Button>}
        />
      ) : (
        <div className="space-y-3">
          {course.modules.map((m, mi) => {
            const isOpen = expanded[m.id] ?? true;
            return (
              <div key={m.id} className="glass-panel rounded-xl border border-white/10 overflow-hidden">
                {/* Module header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/5">
                  <button
                    onClick={() => toggleModule(m.id)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    {isOpen ? <ChevronDown size={18} className="text-slate-500 shrink-0" /> : <ChevronUp size={18} className="text-slate-500 shrink-0" />}
                    <span className="text-xs font-bold text-slate-500">M{mi + 1}</span>
                    <span className="font-semibold text-white truncate">{m.title}</span>
                    <span className="text-xs text-slate-500">{m.lessons.length} lessons</span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" title="Move up" onClick={() => onMoveModule(m, "up")}>
                      <ChevronUp size={15} />
                    </Button>
                    <Button size="icon" variant="ghost" title="Move down" onClick={() => onMoveModule(m, "down")}>
                      <ChevronDown size={15} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Rename module"
                      onClick={() => { setEditModule(m); setModuleTitle(m.title); }}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button size="icon" variant="ghost" title="Delete module" onClick={() => onDeleteModuleConfirm(m)}>
                      <Trash2 size={15} className="hover:text-red-400" />
                    </Button>
                    <div className="w-px h-5 bg-white/10 mx-1" />
                    <Button size="sm" variant="secondary" onClick={() => openCreateLesson(m.id)}>
                      <Plus size={14} /> Lesson
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 py-3">
                    {m.lessons.length === 0 ? (
                      <p className="text-xs text-slate-500">No lessons in this module yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {m.lessons.map((l, li) => {
                          const meta = typeMeta[l.type];
                          return (
                            <div
                              key={l.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-slate-600">{mi + 1}.{li + 1}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize shrink-0 ${meta.cls}`}>
                                  {meta.icon} {l.type}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm text-white truncate">{l.title}</p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {l.duration || "-"} {l.url ? "· " + l.url : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button size="icon" variant="ghost" title="Move up" onClick={() => onMoveLesson(l, "up")}>
                                  <ChevronUp size={14} />
                                </Button>
                                <Button size="icon" variant="ghost" title="Move down" onClick={() => onMoveLesson(l, "down")}>
                                  <ChevronDown size={14} />
                                </Button>
                                <Button size="icon" variant="ghost" title="Edit lesson" onClick={() => openEditLesson(m.id, l)}>
                                  <Pencil size={14} />
                                </Button>
                                <Button size="icon" variant="ghost" title="Delete lesson" onClick={() => onDeleteLesson(m, l)}>
                                  <Trash2 size={14} className="hover:text-red-400" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / rename module modal */}
      <Modal
        open={addModuleOpen || !!editModule}
        onClose={() => { if (!moduleBusy) { setAddModuleOpen(false); setEditModule(null); setModuleTitle(""); } }}
        title={editModule ? "Rename Module" : "Add Module"}
        description={editModule ? "Give this module a clearer title." : "Add a chapter, unit or section to the curriculum."}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setAddModuleOpen(false); setEditModule(null); setModuleTitle(""); }} disabled={moduleBusy}>Cancel</Button>
            <Button onClick={editModule ? onRenameModule : onCreateModule} loading={moduleBusy}>Save</Button>
          </>
        }
      >
        <input
          autoFocus
          value={moduleTitle}
          onChange={(e) => setModuleTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (editModule ? onRenameModule() : onCreateModule())}
          className={input}
          placeholder="Module title"
        />
      </Modal>

      {/* Add / edit lesson modal */}
      <Modal
        open={!!openLesson}
        onClose={() => { if (!lessonBusy) setOpenLesson(null); }}
        title={openLesson?.lesson ? "Edit Lesson" : "Add Lesson"}
        description="Attach a video, PDF notes or quiz reference to this module."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenLesson(null)} disabled={lessonBusy}>Cancel</Button>
            <Button onClick={onSaveLesson} loading={lessonBusy}>Save Lesson</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Lesson Title *</label>
            <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className={input} placeholder="e.g. Newton's Laws of Motion" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {LESSON_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setLessonType(t.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    lessonType === t.value
                      ? "border-[#5E9A2E] bg-[#5E9A2E]/15 text-emerald-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Asset URL</label>
              <input value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)} className={input} placeholder="youtu.be/... or notes/..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Duration</label>
              <input value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} className={input} placeholder="45:00" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
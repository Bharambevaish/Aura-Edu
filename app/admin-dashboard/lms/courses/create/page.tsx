"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Combobox } from "@/components/ui/Combobox";
import { COURSE_CATEGORIES } from "@/lib/courses";
import { createCourse } from "@/lib/actions/courses";

const input =
  "w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-[#5E9A2E] focus:ring-1 focus:ring-[#5E9A2E] placeholder-slate-500 text-sm";

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [duration, setDuration] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [level, setLevel] = useState("");
  const [badge, setBadge] = useState("");
  const [featuresRaw, setFeaturesRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !category) {
      toast("Title, code and category are required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const features = featuresRaw
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const r = await createCourse({
        title: title.trim(),
        code: code.trim(),
        category,
        description: description.trim(),
        instructor: instructor.trim(),
        duration: duration.trim(),
        thumbnail: thumbnail.trim(),
        isPaid,
        price,
        originalPrice,
        level: level.trim(),
        badge: badge.trim(),
        features,
      });

      if (r.ok && r.id) {
        toast(r.message ?? "Course created.");
        router.push(`/admin-dashboard/lms/courses/${r.id}`);
      } else {
        toast(r.message ?? "Could not create course.", "error");
      }
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      <Link
        href="/admin-dashboard/lms/courses"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Course Content
      </Link>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Add New Course</h2>
          <p className="text-xs text-slate-400 mt-1">Create the shell, then add modules and lessons from the curriculum editor.</p>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Course Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="e.g. NEET Comprehensive 2026" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Course Code *</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={input} placeholder="e.g. NEET-MED-2026" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Category *</label>
            <Combobox
              value={category}
              onChange={setCategory}
              options={COURSE_CATEGORIES.map((c) => ({ value: c }))}
              placeholder="Select or type a category"
              className={input}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Instructor</label>
              <input value={instructor} onChange={(e) => setInstructor(e.target.value)} className={input} placeholder="e.g. Dr. A. Verma" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Duration</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} className={input} placeholder="e.g. 1 Year Full-Time" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Level</label>
              <input value={level} onChange={(e) => setLevel(e.target.value)} className={input} placeholder="e.g. Beginner to Advanced" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Badge</label>
              <input value={badge} onChange={(e) => setBadge(e.target.value)} className={input} placeholder="e.g. BESTSELLER" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${input} resize-none`}
              placeholder="What students will learn…"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Thumbnail URL</label>
            <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className={input} placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-2 md:col-span-1 flex items-center gap-2 pt-5">
              <input
                id="isPaid"
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900/50 text-[#5E9A2E] focus:ring-[#5E9A2E]"
              />
              <label htmlFor="isPaid" className="text-sm text-slate-300 cursor-pointer font-medium">Paid Course</label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Price (₹)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Original Price (₹)</label>
              <input
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Rating</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                defaultValue={4.5}
                onChange={() => {}}
                className={input}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Features (comma-separated)</label>
            <textarea
              value={featuresRaw}
              onChange={(e) => setFeaturesRaw(e.target.value)}
              rows={3}
              className={`${input} resize-none`}
              placeholder="460+ hours of HD video lectures, Chapter-wise topic tests, ..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/admin-dashboard/lms/courses">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button type="submit" loading={submitting}>
              <Save size={16} /> Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
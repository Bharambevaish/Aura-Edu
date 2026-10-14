"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCertificateOptions, issueCertificateLink, type CertificateOptions } from "@/lib/actions/certificates";
import { Combobox } from "@/components/ui/Combobox";
import { Button } from "@/components/ui/Button";
import { CERTIFICATE_TEMPLATES, type CertificateTemplate } from "@/lib/certificates";
import { Award, Search, Check, Loader2, ArrowLeft, Download } from "lucide-react";

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 appearance-none";

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d).padStart(2, "0")} ${MONTH[m - 1]} ${y}`;
};

const templateLabel: Record<CertificateTemplate, string> = {
  premium_classic: "Premium Classic",
  modern_clean: "Modern Clean",
  elegant_gold: "Elegant Gold",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function GenerateCertificatePage() {
  const [options, setOptions] = useState<CertificateOptions | null>(null);
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState("");
  const [template, setTemplate] = useState<CertificateTemplate>("premium_classic");
  const [issuedDate, setIssuedDate] = useState(todayISO());
  const [issueError, setIssueError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [singleId, setSingleId] = useState("");

  useEffect(() => {
    let ignore = false;
    getCertificateOptions()
      .then((data) => {
        if (ignore) return;
        setOptions(data);
        if (data.courses.length > 0) setCourse(data.courses[0].name);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  // Pre-select the template when arriving via a template card's "Use" button.
  useEffect(() => {
    if (typeof window === "undefined") return;
    Promise.resolve(new URLSearchParams(window.location.search).get("template")).then((t) => {
      if (t === "premium_classic" || t === "modern_clean" || t === "elegant_gold") setTemplate(t);
    });
  }, []);

  const students = options?.students ?? [];
  const qq = q.trim().toLowerCase();
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(qq) ||
      s.admissionNo.toLowerCase().includes(qq) ||
      s.course.toLowerCase().includes(qq),
  );

  const selectedStudent = students.find((s) => s.id === singleId) ?? null;

  const pickSingle = (id: string) => {
    setSingleId(id);
    const s = students.find((x) => x.id === id);
    if (s?.course && !course) setCourse(s.course);
  };

  const canDownload = !!selectedStudent && course.trim().length > 0 && !!issuedDate;

  const download = async () => {
    if (!canDownload || !selectedStudent) return;
    // Open the tab synchronously (popup blockers allow that), then point it at
    // the signed link the server issues.
    const tab = window.open("", "_blank");
    const res = await issueCertificateLink({
      studentId: selectedStudent.id,
      course: course.trim(),
      template,
      date: fmt(issuedDate),
    });
    if (!res.ok || !res.url) {
      tab?.close();
      setIssueError(res.message);
      return;
    }
    setIssueError(null);
    if (tab) tab.location.href = res.url;
    else window.location.href = res.url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        <Loader2 className="animate-spin mr-3" size={20} /> Loading students…
      </div>
    );
  }

  const previewName = selectedStudent?.name ?? "Student Name";
  const previewCourse = course.trim() || "Course Name";
  const previewDate = issuedDate ? fmt(issuedDate) : "Issue Date";

  return (
    <div className="space-y-6">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin-dashboard/lms/students/certificates"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={15} /> Back to Certificate Center
        </Link>
        <span className="text-xs text-slate-500">Generates a PDF on demand — nothing is stored.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-emerald-400" />
            <h2 className="text-base font-bold text-white">Create Certificate</h2>
          </div>

          {/* Student picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Student <span className="text-red-400">*</span>
            </label>
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, admission no, or course…"
                className={`${inputCls} pl-9`}
              />
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No students enrolled yet.</p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No students match “{q}”.</p>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto custom-scrollbar">
                {filtered.map((s) => {
                  const isSelected = s.id === singleId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => pickSingle(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors border-b border-slate-800/60 last:border-b-0 ${
                        isSelected ? "bg-emerald-500/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-300 ring-1 ring-slate-700 shrink-0">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold truncate ${isSelected ? "text-emerald-300" : "text-slate-200"}`}>{s.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {s.admissionNo || "—"} · {s.batch || "no batch"} · {s.course || "no course"}
                        </p>
                      </div>
                      {isSelected && <Check size={15} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course <span className="text-red-400">*</span>
            </label>
            <Combobox
              value={course}
              onChange={setCourse}
              options={(options?.courses ?? []).map((c) => ({ value: c.name, hint: `${c.studentCount} students` }))}
              placeholder="Search or type a course…"
              className={inputCls}
              allowCustom
            />
          </div>

          {/* Template selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Template <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CERTIFICATE_TEMPLATES.map((t) => {
                const active = template === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTemplate(t.key)}
                    className={`rounded-xl border p-2 text-center transition-colors ${
                      active ? "border-emerald-500/60 bg-emerald-500/10" : "border-slate-700 bg-slate-900/40 hover:border-slate-500"
                    }`}
                  >
                    <span className="block h-14 rounded-lg bg-white/90 border border-white/10 mb-1.5" />
                    <span className={`text-[10px] font-semibold ${active ? "text-emerald-300" : "text-slate-400"}`}>
                      {templateLabel[t.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Issue Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <Button size="md" onClick={download} disabled={!canDownload} className="w-full">
            <Download size={16} />
            Download PDF
          </Button>
          {issueError && <p className="text-xs text-rose-400 text-center">{issueError}</p>}
          <p className="text-[10px] text-slate-500 text-center -mt-2">
            Issues a signed, verifiable certificate and opens it print-ready — use the browser&apos;s Save as PDF.
          </p>
        </div>

        {/* Right: live preview */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Preview</h3>
            <span className="text-[10px] text-slate-500">{templateLabel[template]} template</span>
          </div>
          <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6">
            <LiveCertificate
              name={previewName}
              course={previewCourse}
              date={previewDate}
              template={template}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-4 text-center">
            The certificate prints with the student&apos;s live name and the course you set. No record is saved.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Live certificate preview                                             */
/* ------------------------------------------------------------------ */

function LiveCertificate({
  name,
  course,
  date,
  template,
}: {
  name: string;
  course: string;
  date: string;
  template: CertificateTemplate;
}) {
  const frame =
    template === "premium_classic" ? "border-[6px] border-amber-600/80" :
    template === "modern_clean" ? "border border-slate-300" : "border-[6px] border-yellow-400";
  return (
    <div className={`relative w-full max-w-sm aspect-[4/3] bg-white rounded-sm shadow-2xl ${frame} flex flex-col items-center p-5 text-center overflow-hidden`}>
      <div className="flex items-center gap-1.5">
        <Award size={12} className="text-emerald-600" />
        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">AuraEdu Institution of Excellence</span>
      </div>
      <span className="text-[11px] text-slate-800 font-bold uppercase tracking-wide mt-2">Certificate of Achievement</span>
      <span className="text-[8px] text-slate-500 mt-1.5">This is to certify that</span>
      <span className="text-base text-slate-900 font-serif font-bold italic mt-1 border-b border-slate-300 pb-0.5">{name}</span>
      <span className="text-[8px] text-slate-600 mt-1.5">
        has successfully completed all required modules and assessments for{" "}
        <strong className="text-slate-800">{course}</strong> with distinction.
      </span>
      <div className="w-full flex justify-between items-end mt-auto px-2">
        <div className="text-left">
          <span className="block text-[6px] text-slate-400 uppercase">Issued</span>
          <span className="block text-[8px] font-bold text-slate-800">{date}</span>
        </div>
        <div className="w-8 h-8 border border-slate-300 p-0.5">
          <div className="w-full h-full border border-slate-200" />
        </div>
        <div className="text-right">
          <span className="block text-[6px] text-slate-400 uppercase">Issued Digitally</span>
          <span className="block text-[8px] font-bold text-emerald-700">AURAEDU</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span className="text-4xl font-bold text-slate-900 transform -rotate-45">VERIFIED</span>
      </div>
    </div>
  );
}
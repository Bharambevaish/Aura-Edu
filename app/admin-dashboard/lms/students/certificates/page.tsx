"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  FileText,
  Search,
  Download,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CERTIFICATE_TEMPLATES, type CertificateTemplate } from "@/lib/certificates";

export default function CertificateCenterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Certificate Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Pick a student, choose a template, and download a print-ready PDF certificate on the spot — nothing is
            stored, it&apos;s generated on demand.
          </p>
        </div>
        <Link href="/admin-dashboard/lms/students/certificates/generate">
          <Button size="md">
            <Plus size={16} /> Generate Certificate PDF
          </Button>
        </Link>
      </div>

      {/* How it works strip */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-emerald-400" />
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            { icon: <Search size={16} className="text-blue-400" />, step: "1", title: "Pick a student", text: "Live student search with auto-filled course." },
            { icon: <Award size={16} className="text-amber-400" />, step: "2", title: "Choose a template", text: "Three designs — the preview updates live." },
            { icon: <Download size={16} className="text-emerald-400" />, step: "3", title: "Download the PDF", text: "A print-ready A4 sheet opens — save as PDF." },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700">
                {item.icon}
              </div>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="text-xs text-slate-400 max-w-[220px]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText size={14} className="text-emerald-400" />
            Certificate Templates
          </h3>
          <span className="text-[10px] text-slate-500">{CERTIFICATE_TEMPLATES.length} designs</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CERTIFICATE_TEMPLATES.map((t) => (
            <div
              key={t.key}
              className="bg-slate-900/70 border border-slate-700 rounded-xl overflow-hidden flex flex-col hover:border-slate-500 transition-colors"
            >
              <div className="p-5 flex items-center justify-center min-h-[180px]">
                <TemplateMockup variant={t.key} />
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-slate-700 flex flex-col gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{t.label}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                </div>
                <Link
                  href={`/admin-dashboard/lms/students/certificates/generate?template=${t.key}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/30 hover:bg-blue-500/20 transition-colors mt-1"
                >
                  <Plus size={12} /> Use this template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template previews                                                    */
/* ------------------------------------------------------------------ */

function TemplateMockup({ variant }: { variant: CertificateTemplate }) {
  if (variant === "premium_classic") {
    return (
      <div className="w-full max-w-[220px] aspect-[4/3] bg-white rounded border-4 border-amber-600/80 shadow-lg flex flex-col items-center justify-center p-3 relative">
        <span className="text-[7px] text-slate-800 font-bold uppercase mb-1">Certificate</span>
        <span className="text-xs text-slate-900 font-serif font-bold mb-0.5">Student Name</span>
        <span className="text-[6px] text-slate-600 text-center leading-tight">has successfully completed<br />Course Title</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 transform -rotate-45">CERT</span>
        </div>
      </div>
    );
  }
  if (variant === "modern_clean") {
    return (
      <div className="w-full max-w-[220px] aspect-[4/3] bg-white rounded shadow-lg flex flex-col items-center justify-center p-3">
        <div className="w-5 h-5 rounded-full bg-blue-100 mb-1" />
        <span className="text-[7px] text-slate-800 font-bold uppercase mb-1 tracking-widest">Certificate</span>
        <span className="text-xs text-slate-900 font-sans font-bold mb-0.5">Student Name</span>
        <span className="text-[6px] text-slate-600 text-center leading-tight">For successful completion of<br />Course Title</span>
        <div className="w-full flex justify-between mt-2 px-2">
          <div className="w-8 h-px bg-slate-300" />
          <div className="w-8 h-px bg-slate-300" />
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-[220px] aspect-[4/3] bg-white rounded border-[5px] border-yellow-400 shadow-lg flex flex-col items-center justify-center p-3">
      <span className="text-[7px] text-slate-800 font-serif font-bold mb-1">Certificate</span>
      <span className="text-[5px] text-slate-500 mb-0.5">PROUDLY PRESENTED TO</span>
      <span className="text-xs text-slate-900 font-serif font-bold italic mb-0.5 border-b border-slate-300 pb-0.5">Student Name</span>
      <span className="text-[6px] text-slate-600 text-center font-serif mt-1 leading-tight">Course Title</span>
    </div>
  );
}
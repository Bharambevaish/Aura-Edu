"use client";

import React, { useState } from "react";
import { useStudent, CertificateItem } from "@/context/StudentContext";
import {
  Award,
  Download,
  Eye,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Share2,
} from "lucide-react";

export default function CertificatesPage() {
  const { certificates, profile } = useStudent();
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Course Completion Certificates</h2>
          </div>
          <p className="text-xs text-slate-400">
            Verified academic credentials and module certificates for {profile.name}.
          </p>
        </div>
      </div>

      {/* 2. Certificate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 space-y-6 flex flex-col justify-between transition-all group shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono border border-emerald-500/30">
                  VERIFIED CERTIFICATE
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs text-slate-400">Course: {cert.course}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono space-y-1">
                <p>Issued: <strong className="text-slate-200">{cert.issuedDate}</strong></p>
                <p>Credential ID: <strong className="text-cyan-400">{cert.certificateNo}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCert(cert)}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Eye className="h-4 w-4" /> Preview Certificate
              </button>
              <button
                onClick={() => alert(`Downloading Certificate ${cert.certificateNo}`)}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Download PDF"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Certificate Frame Preview */}
            <div className="p-8 rounded-2xl bg-slate-950 border-2 border-cyan-500/30 text-center space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-400 font-mono tracking-widest uppercase">
                  MYEDOU INSTITUTION OF EXCELLENCE
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-white">Certificate of Achievement</h2>

              <p className="text-xs text-slate-400">This is to certify that</p>
              <h3 className="text-xl font-black text-cyan-300 font-mono underline underline-offset-8">
                {profile.name}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has successfully completed all required modules, tests, and assignments for{" "}
                <strong className="text-white">{selectedCert.course}</strong> with distinction.
              </p>

              <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Issued: {selectedCert.issuedDate}</span>
                <span className="text-cyan-400">{selectedCert.certificateNo}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
              >
                Close Preview
              </button>
              <button
                onClick={() => alert(`Downloading Certificate ${selectedCert.certificateNo}`)}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Download className="h-4 w-4" /> Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

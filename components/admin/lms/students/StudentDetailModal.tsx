"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  FileText,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { getStudentDetail, type StudentDetailDTO } from "@/lib/actions/students";
import { Modal } from "@/components/ui/Modal";

interface StudentDetailModalProps {
  open: boolean;
  studentId: string | null;
  onClose: () => void;
}

function Field({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm text-slate-200 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function StudentDetailModal({ open, studentId, onClose }: StudentDetailModalProps) {
  const [detail, setDetail] = useState<StudentDetailDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !studentId) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      setDetail(null);
      getStudentDetail(studentId)
        .then((d) => {
          if (!cancelled) setDetail(d);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, studentId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Student Profile"
      description={detail ? `Internal profile for ${detail.name}` : "Loading student profile…"}
      size="xl"
    >
      {loading || !detail ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading student details…</div>
      ) : (
        <div className="space-y-8">
          {/* Identity header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User size={30} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xl font-bold text-white">{detail.name}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {detail.status}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {detail.admissionStatus}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 font-mono text-xs">{detail.admissionNo} · Roll {detail.rollNo}</p>
            </div>
          </div>

          {/* Derived metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><BookOpen size={13} className="text-blue-400" /> Tests Taken</p>
              <p className="text-2xl font-bold text-white">{detail.testsTaken}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><Trophy size={13} className="text-purple-400" /> Average Score</p>
              <p className="text-2xl font-bold text-white">{detail.avgPct === null ? "—" : `${detail.avgPct}%`}</p>
            </div>
            <div className="glass-panel rounded-xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1.5"><FileText size={13} className="text-amber-400" /> Last Test</p>
              <p className="text-2xl font-bold text-white">{detail.lastTestDate ?? "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Field icon={Mail} label="Email" value={detail.email} />
            <Field icon={Phone} label="Phone" value={detail.phone} />
            <Field icon={Phone} label="Alternate Phone" value={detail.alternatePhone} />
            <Field icon={Layers} label="Batch" value={detail.batch} />
            <Field icon={BookOpen} label="Course" value={detail.course} />
            <Field icon={GraduationCap} label="Branch" value={detail.branch} />
            <Field icon={Users} label="Guardian" value={detail.guardianName} />
            <Field icon={Phone} label="Guardian Phone" value={detail.guardianPhone} />
            <Field icon={Mail} label="Guardian Email" value={detail.guardianEmail} />
            <Field icon={FileText} label="ID Proof" value={`${detail.idProofType} · ${detail.idProofNumber}`} />
            <Field icon={MapPin} label="Address" value={`${detail.street}, ${detail.city}, ${detail.state}, ${detail.pincode}, ${detail.country}`} />
            <Field icon={GraduationCap} label="Admission Date" value={detail.admissionDate} />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Attendance and fee ledgers for this student are managed in the Attendance and Finance modules. Test metrics above are computed from live attempt and result records.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
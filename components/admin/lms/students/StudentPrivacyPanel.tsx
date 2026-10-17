"use client";

/**
 * "Data & privacy" on the student profile (admins only): download everything
 * held about the student as JSON, or erase their personal data after typing
 * their name. The server actions re-check the admin role and the name.
 */
import React, { useState } from "react";
import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { Button, useToast } from "@/components/ui";
import { eraseStudentData, exportStudentData } from "@/lib/actions/privacy";
import type { StudentDetailDTO } from "@/lib/actions/students";

interface Props {
  detail: StudentDetailDTO;
  /** Called after a successful erase so the caller can reload. */
  onErased: () => void;
}

export default function StudentPrivacyPanel({ detail, onErased }: Props) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [erasing, setErasing] = useState(false);

  const download = async () => {
    setExporting(true);
    try {
      const res = await exportStudentData(detail.id);
      if (!res.ok || !res.json) {
        toast(res.message, "error");
        return;
      }
      const url = URL.createObjectURL(new Blob([res.json], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename ?? "student-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("Student data exported.", "success");
    } catch {
      toast("Could not export right now. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const erase = async () => {
    setErasing(true);
    try {
      const res = await eraseStudentData(detail.id, typed);
      toast(res.message, res.ok ? "success" : "error");
      if (res.ok) {
        setConfirming(false);
        setTyped("");
        onErased();
      }
    } catch {
      toast("Could not erase right now. Please try again.", "error");
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-white">Data &amp; privacy</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {detail.erasedAt
              ? `Personal data erased on ${detail.erasedAt}. Fee records are kept without the student's name.`
              : detail.consent
                ? `Consent to Privacy Notice v${detail.consent.version} given on ${detail.consent.at}${detail.consent.byGuardian ? " by a parent/guardian" : ""}.`
                : "No online consent on record (added by staff or before consent capture)."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" loading={exporting} onClick={download}>
          {!exporting && <Download size={14} />} Export this student&apos;s data
        </Button>
        {!detail.erasedAt && !confirming && (
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
            <Trash2 size={14} /> Erase personal data
          </Button>
        )}
      </div>

      {confirming && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 space-y-3">
          <p className="text-xs text-slate-300">
            This replaces the student&apos;s name, email, phone, address, guardian and ID-proof details with &ldquo;Erased student&rdquo;, blocks their
            login and signs them out everywhere. Invoices and payments keep their amounts. This cannot be undone.
          </p>
          <label htmlFor="erase-confirm" className="block text-xs text-slate-400">
            Type <span className="font-semibold text-white">{detail.name}</span> to confirm
          </label>
          <input
            id="erase-confirm"
            className="w-full bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setConfirming(false); setTyped(""); }} disabled={erasing}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={erasing} disabled={typed.trim() !== detail.name.trim()} onClick={erase}>
              Erase permanently
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

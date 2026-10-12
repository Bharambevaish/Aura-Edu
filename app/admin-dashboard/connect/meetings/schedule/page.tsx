"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createMeeting,
  getBroadcastBatches,
} from "@/lib/actions/connect";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Shield,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors";
const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

const todayStr = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

const SECURITY_OPTIONS: { key: keyof ReturnType<typeof baseSecurity>; label: string }[] = [
  { key: "disableScreenshot", label: "Disable Screenshot" },
  { key: "disableRecording", label: "Disable Screen Recording" },
  { key: "disableScreenShare", label: "Disable Screen Share (Participants)" },
  { key: "watermark", label: "Show Watermark" },
  { key: "waitingRoom", label: "Enable Waiting Room" },
  { key: "muteOnEntry", label: "Mute Participants upon Entry" },
];

const baseSecurity = () => ({
  disableScreenshot: true,
  disableRecording: true,
  disableScreenShare: true,
  watermark: true,
  waitingRoom: false,
  muteOnEntry: true,
});

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("10:00");
  const [type, setType] = useState<"internal" | "class" | "webinar">("internal");
  const [batches, setBatches] = useState<{ name: string; enrolled: number }[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [security, setSecurity] = useState(baseSecurity());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    getBroadcastBatches().then((b) => {
      if (!ignore) setBatches(b.map((x) => ({ name: x.name, enrolled: x.enrolled })));
    });
    return () => {
      ignore = true;
    };
  }, []);

  const toggleBatch = (name: string) =>
    setSelectedBatches((prev) => (prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]));

  const submit = async () => {
    if (!title.trim()) {
      toast("Meeting title is required", "error");
      return;
    }
    if (!date) {
      toast("Pick a date", "error");
      return;
    }
    if (endHour <= startHour) {
      toast("End time must be after start time", "error");
      return;
    }
    if (type !== "internal" && selectedBatches.length === 0) {
      toast("Select at least one batch", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await createMeeting({
        title,
        description,
        date,
        startHour,
        endHour,
        type,
        batchNames: selectedBatches,
        security,
      });
      if (res.ok) {
        toast(`Meeting scheduled — link ready` , "success");
        router.push("/admin-dashboard/connect/meetings");
      } else {
        toast(res.message, "error");
      }
    } catch {
      toast("Something went wrong", "error");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Schedule Meeting" subtitle="Set up a secure virtual meeting, class, or webinar." icon={<Video size={20} className="text-emerald-400" />} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Video size={18} className="text-emerald-400" /> Meeting Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Meeting Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekly Staff Sync or JEE Physics Chapter 4" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Description (Optional)</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Agenda or context for the meeting..." className={`${inputCls} resize-y custom-scrollbar`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}><Calendar size={14} className="text-slate-400" /> Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}><Clock size={14} className="text-slate-400" /> Start</label>
                  <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={`${labelCls} flex items-center gap-2`}><Clock size={14} className="text-slate-400" /> End</label>
                  <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Participants & Access
            </h2>

            <div className="space-y-6">
              <div className="flex gap-2 p-1 bg-slate-900/50 border border-white/10 rounded-xl w-fit">
                {([["internal", "Internal"], ["class", "Class / Batch"], ["webinar", "Webinar"]] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setType(k)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      type === k ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {type !== "internal" && (
                <div>
                  <label className={labelCls}>Batches invited</label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {batches.map((b) => {
                      const active = selectedBatches.includes(b.name);
                      return (
                        <button
                          key={b.name}
                          onClick={() => toggleBatch(b.name)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            active ? "bg-blue-500/15 border-blue-500/40 text-blue-400" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {b.name}
                          <span className="text-[10px] text-slate-500">{b.enrolled}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield size={18} className="text-purple-400" /> Security Options
            </h2>

            <div className="space-y-4">
              {SECURITY_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                  <button
                    onClick={() => setSecurity((s) => ({ ...s, [opt.key]: !s[opt.key] }))}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      security[opt.key] ? "bg-emerald-500 border-emerald-500" : "border-slate-600 group-hover:border-slate-500 bg-transparent"
                    }`}
                  >
                    {security[opt.key] && <span className="w-2 h-2 rounded-sm bg-[#070B14]" />}
                  </button>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <Button className="w-full mb-3" loading={loading} onClick={submit}>
              <Video size={14} /> Schedule Meeting
            </Button>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1.5">
                <Shield size={12} /> Secure link auto-generated
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A unique meet.auraedu.com link is created when you schedule and is instantly available in the Meetings tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
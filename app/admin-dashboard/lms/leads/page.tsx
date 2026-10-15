"use client";

/**
 * Leads workspace (live DB). Online Admissions (/register) and staff-entered
 * enquiries land here; Follow-up moves them through the pipeline and Convert
 * turns a student lead into a student account (lib/actions/leads.ts).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader, StatCard, Button, Modal, useToast } from "@/components/ui";
import { useLookups } from "@/components/admin/useLookups";
import {
  Plus,
  RefreshCw,
  Download,
  Search,
  ChevronDown,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Copy,
} from "lucide-react";
import {
  getLeads,
  getConversionOptions,
  createLead,
  updateLead,
  convertLead,
  type LeadRow,
  type LeadStats,
  type ConversionOptions,
} from "@/lib/actions/leads";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STAGES,
  sourceLabel,
  stageLabel,
  stagePill,
} from "@/lib/leads";
import type { LeadStage } from "@/lib/models/Lead";

const PAGE_SIZE = 10;

const inputCls =
  "w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500";

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function isOverdue(iso: string | null) {
  if (!iso) return false;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return new Date(iso) <= end;
}

function SelectBox({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative min-w-[150px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-emerald-500 appearance-none"
      >
        {children}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

export default function AllLeadsPage() {
  const { toast } = useToast();

  const [data, setData] = useState<{ stats: LeadStats; leads: LeadRow[] } | null>(null);
  const [options, setOptions] = useState<ConversionOptions | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const deepLinked = useRef(false);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [page, setPage] = useState(1);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [followUp, setFollowUp] = useState<LeadRow | null>(null);
  const [convert, setConvert] = useState<LeadRow | null>(null);
  const [converted, setConverted] = useState<{ name: string; email: string; password: string; invoiceNo?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const lookups = useLookups();

  // Form state
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", type: "student", priority: "medium", source: "walk_in", interestedCourse: "", note: "" });
  const [fuForm, setFuForm] = useState({ stage: "contacted", priority: "medium", nextFollowUpAt: "", note: "", lostReason: "" });
  const [cvForm, setCvForm] = useState({ batch: "", feeTotal: "0", dueInDays: "30" });

  useEffect(() => {
    let ignore = false;
    Promise.all([getLeads(), getConversionOptions()])
      .then(([leads, opts]) => {
        if (ignore) return;
        setData(leads);
        // Deep link from a form response: /admin-dashboard/lms/leads?q=LD-2026-0012
        if (!deepLinked.current) {
          deepLinked.current = true;
          const q = new URLSearchParams(window.location.search).get("q");
          if (q) setSearch(q);
        }
        setOptions(opts);
      })
      .catch(() => toast("Could not load leads.", "error"));
    return () => {
      ignore = true;
    };
  }, [reloadKey, toast]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.leads.filter((l) => {
      if (stage && l.stage !== stage) return false;
      if (priority && l.priority !== priority) return false;
      if (type && l.type !== type) return false;
      if (source && l.source !== source) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.leadNo, l.ownerName, l.interestedCourse, sourceLabel(l.source)]
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [data, search, stage, priority, type, source]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ---- actions ----

  const openFollowUp = (lead: LeadRow) => {
    setFuForm({
      stage: lead.stage === "new" ? "contacted" : lead.stage,
      priority: lead.priority,
      nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.slice(0, 10) : "",
      note: "",
      lostReason: lead.lostReason,
    });
    setFollowUp(lead);
  };

  const openConvert = (lead: LeadRow) => {
    const match = options?.batches.find((b) => b.course === lead.interestedCourse) ?? options?.batches[0];
    setCvForm({
      batch: match?.name ?? "",
      feeTotal: String(match ? options?.feeByCourse[match.course] ?? 0 : 0),
      dueInDays: "30",
    });
    setConvert(lead);
  };

  const submitAdd = async () => {
    setSaving(true);
    const res = await createLead(addForm);
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setShowAdd(false);
      setAddForm({ name: "", email: "", phone: "", type: "student", priority: "medium", source: "walk_in", interestedCourse: "", note: "" });
      reload();
    }
  };

  const submitFollowUp = async () => {
    if (!followUp) return;
    setSaving(true);
    const res = await updateLead(followUp.id, fuForm);
    setSaving(false);
    toast(res.message, res.ok ? "success" : "error");
    if (res.ok) {
      setFollowUp(null);
      reload();
    }
  };

  const submitConvert = async () => {
    if (!convert) return;
    setSaving(true);
    const res = await convertLead(convert.id, {
      batch: cvForm.batch,
      feeTotal: Number(cvForm.feeTotal) || 0,
      dueInDays: Number(cvForm.dueInDays) || 0,
    });
    setSaving(false);
    if (!res.ok || !res.credentials) {
      toast(res.message, "error");
      return;
    }
    toast(res.message, "success");
    setConverted({ name: convert.name, ...res.credentials, invoiceNo: res.invoiceNo });
    setConvert(null);
    reload();
  };

  const exportCsv = () => {
    const header = ["Lead No", "Name", "Type", "Stage", "Priority", "Source", "Course", "Owner", "Next Follow-up", "Phone", "Email", "Created"];
    const lines = filtered.map((l) =>
      [l.leadNo, l.name, l.type, stageLabel(l.stage), l.priority, sourceLabel(l.source), l.interestedCourse, l.ownerName, fmtDate(l.nextFollowUpAt), l.phone, l.email, fmtDate(l.createdAt)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = data?.stats;
  const selectedBatch = options?.batches.find((b) => b.name === cvForm.batch);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Leads"
        subtitle="Online admissions and enquiries — follow up, then convert to students."
        icon={<Users size={20} className="text-emerald-400" />}
      >
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Add Lead
        </Button>
        <Button variant="secondary" size="sm" onClick={reload}>
          <RefreshCw size={16} />
          Refresh
        </Button>
        <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!filtered.length}>
          <Download size={16} />
          Export
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="TOTAL" value={stats?.total ?? "—"} accent="slate" />
        <StatCard label="NEW" value={stats?.byStage.new ?? "—"} accent="blue" />
        <StatCard label="CONTACTED" value={stats?.byStage.contacted ?? "—"} accent="purple" />
        <StatCard label="FOLLOW-UP" value={stats?.byStage.follow_up ?? "—"} accent="amber" />
        <StatCard label="QUALIFIED" value={stats?.byStage.qualified ?? "—"} accent="slate" />
        <StatCard label="CONVERTED" value={stats?.byStage.converted ?? "—"} accent="emerald" />
        <StatCard label="LOST" value={stats?.byStage.lost ?? "—"} accent="red" />
        <StatCard label="DUE F/U · CONV %" value={stats ? `${stats.followUpsDue} · ${stats.conversionRate}%` : "—"} accent="blue" />
      </div>

      {/* Filters */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-t-xl p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, lead no, course, owner, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>
        <SelectBox value={stage} onChange={(v) => { setStage(v); setPage(1); }}>
          <option value="">All Lifecycle Stages</option>
          {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </SelectBox>
        <SelectBox value={priority} onChange={(v) => { setPriority(v); setPage(1); }}>
          <option value="">All Priorities</option>
          {LEAD_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </SelectBox>
        <SelectBox value={source} onChange={(v) => { setSource(v); setPage(1); }}>
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </SelectBox>
        <SelectBox value={type} onChange={(v) => { setType(v); setPage(1); }}>
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="client">Client</option>
        </SelectBox>
      </div>

      <div className="bg-slate-900/50 border-x border-slate-800 px-4 py-3 text-xs text-slate-400">
        {data ? `Showing ${filtered.length} of ${data.leads.length} leads after filters.` : "Loading leads…"}
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-b-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th className="py-3 px-4">Lead</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Lifecycle</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Next follow-up</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data && rows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-500">
                  No leads match these filters.
                </td>
              </tr>
            )}
            {rows.map((lead) => {
              const closed = lead.stage === "converted" || lead.stage === "lost";
              const overdue = !closed && isOverdue(lead.nextFollowUpAt);
              return (
                <tr key={lead.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white">{lead.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {lead.leadNo} · {lead.interestedCourse || "—"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-900/20 text-blue-400 border border-blue-900/30 capitalize">
                      {lead.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${stagePill(lead.stage)}`}>
                      {stageLabel(lead.stage)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-medium text-slate-300 capitalize">{lead.priority}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 font-medium uppercase">{sourceLabel(lead.source)}</td>
                  <td className="py-3 px-4 text-[13px] text-slate-400">{lead.ownerName}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[13px] ${overdue ? "text-red-400 font-semibold" : "text-slate-400"}`}>
                      {closed ? "—" : fmtDate(lead.nextFollowUpAt)}
                      {overdue && " · due"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[13px] text-white font-medium">{lead.phone || "—"}</div>
                    <div className="text-[11px] text-slate-500">{lead.email || "—"}</div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-slate-400 font-medium">{fmtDate(lead.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {lead.stage === "converted" ? (
                        <Link
                          href="/admin-dashboard/lms/students"
                          className="px-3 py-1 border border-emerald-600/40 text-emerald-400 rounded text-xs font-medium flex items-center gap-1"
                        >
                          <UserCheck size={12} /> Student
                        </Link>
                      ) : (
                        <>
                          <button
                            onClick={() => openFollowUp(lead)}
                            className="px-3 py-1 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-300 rounded text-xs font-medium transition-colors"
                          >
                            Follow-up
                          </button>
                          {lead.type === "student" && lead.stage !== "lost" && (
                            <button
                              onClick={() => openConvert(lead)}
                              className="px-3 py-1 bg-transparent border border-emerald-600/50 hover:border-emerald-500 text-emerald-400 rounded text-xs font-medium transition-colors"
                            >
                              Convert
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
          <p className="text-xs text-slate-400">
            {filtered.length
              ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} results`
              : "No results"}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded border border-slate-700 text-slate-400 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-3 py-1 rounded bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 text-sm font-medium">
              {currentPage} / {pageCount}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="p-1.5 rounded border border-slate-700 text-slate-400 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add lead */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Lead"
        description="Walk-in, phone enquiry, referral or campaign lead."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button size="sm" onClick={submitAdd} disabled={saving}>{saving ? "Saving…" : "Add Lead"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className={inputCls} placeholder="Full name *" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
          <input className={inputCls} placeholder="Phone" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
          <input className={inputCls} placeholder="Email (becomes the login on conversion)" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
          <input className={inputCls} placeholder="Interested course" value={addForm.interestedCourse} onChange={(e) => setAddForm({ ...addForm, interestedCourse: e.target.value })} />
          <select className={inputCls} value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}>
            <option value="student">Student</option>
            <option value="client">Client (institution)</option>
          </select>
          <select className={inputCls} value={addForm.priority} onChange={(e) => setAddForm({ ...addForm, priority: e.target.value })}>
            {LEAD_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label} priority</option>)}
          </select>
          <select className={inputCls} value={addForm.source} onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}>
            {LEAD_SOURCES.filter((s) => s.value !== "web_register" && s.value !== "form").map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <textarea className={`${inputCls} md:col-span-2`} rows={2} placeholder="First note (optional)" value={addForm.note} onChange={(e) => setAddForm({ ...addForm, note: e.target.value })} />
        </div>
      </Modal>

      {/* Follow-up */}
      <Modal
        open={!!followUp}
        onClose={() => setFollowUp(null)}
        title={followUp ? `Follow-up · ${followUp.name}` : "Follow-up"}
        description={followUp ? `${followUp.leadNo} · ${sourceLabel(followUp.source)} · ${followUp.interestedCourse || "No course yet"}` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setFollowUp(null)}>Cancel</Button>
            <Button size="sm" onClick={submitFollowUp} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </>
        }
      >
        {followUp && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-xs text-slate-400 space-y-1">
                <span>Stage</span>
                <select className={inputCls} value={fuForm.stage} onChange={(e) => setFuForm({ ...fuForm, stage: e.target.value as LeadStage })}>
                  {LEAD_STAGES.filter((s) => s.value !== "converted").map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-400 space-y-1">
                <span>Priority</span>
                <select className={inputCls} value={fuForm.priority} onChange={(e) => setFuForm({ ...fuForm, priority: e.target.value })}>
                  {LEAD_PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </label>
              <label className="text-xs text-slate-400 space-y-1">
                <span>Next follow-up</span>
                <input type="date" className={inputCls} value={fuForm.nextFollowUpAt} disabled={fuForm.stage === "lost"} onChange={(e) => setFuForm({ ...fuForm, nextFollowUpAt: e.target.value })} />
              </label>
            </div>
            {fuForm.stage === "lost" && (
              <>
                <input className={inputCls} list="lost-reasons" placeholder="Reason the lead was lost *" value={fuForm.lostReason} onChange={(e) => setFuForm({ ...fuForm, lostReason: e.target.value })} />
                <datalist id="lost-reasons">{lookups.lost_reason.map((r) => <option key={r} value={r} />)}</datalist>
              </>
            )}
            <textarea className={inputCls} rows={2} placeholder="Note from this call / visit" value={fuForm.note} onChange={(e) => setFuForm({ ...fuForm, note: e.target.value })} />

            <div className="text-xs text-slate-400 grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-900/60 border border-white/5">
              <span>Phone: <span className="text-slate-200">{followUp.phone || "—"}</span></span>
              <span>Email: <span className="text-slate-200">{followUp.email || "—"}</span></span>
              <span>Guardian: <span className="text-slate-200">{followUp.guardianName || "—"}</span></span>
              <span>Guardian phone: <span className="text-slate-200">{followUp.guardianPhone || "—"}</span></span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">History</p>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {followUp.notes.length === 0 && <p className="text-xs text-slate-500">No notes yet.</p>}
                {followUp.notes.map((n, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-slate-900/50 border border-white/5">
                    <p className="text-slate-200">{n.text}</p>
                    <p className="text-slate-500 mt-1">{n.byName} · {fmtDate(n.at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Convert */}
      <Modal
        open={!!convert}
        onClose={() => setConvert(null)}
        title={convert ? `Convert ${convert.name} to student` : "Convert"}
        description="Creates the student login, places them in a batch, enrolls them in the course and raises the fee invoice."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConvert(null)}>Cancel</Button>
            <Button size="sm" onClick={submitConvert} disabled={saving || !cvForm.batch}>{saving ? "Converting…" : "Convert to student"}</Button>
          </>
        }
      >
        {convert && (
          <div className="space-y-4">
            {!convert.email && (
              <p className="text-xs text-amber-300 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                This lead has no email. Add one first — it becomes the student&apos;s login.
              </p>
            )}
            <label className="text-xs text-slate-400 space-y-1 block">
              <span>Batch</span>
              <select
                className={inputCls}
                value={cvForm.batch}
                onChange={(e) => {
                  const b = options?.batches.find((x) => x.name === e.target.value);
                  setCvForm({ ...cvForm, batch: e.target.value, feeTotal: String(b ? options?.feeByCourse[b.course] ?? cvForm.feeTotal : cvForm.feeTotal) });
                }}
              >
                {options?.batches.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} — {b.course} ({b.enrolled}/{b.capacity})
                  </option>
                ))}
              </select>
            </label>
            {selectedBatch && selectedBatch.enrolled >= selectedBatch.capacity && (
              <p className="text-xs text-amber-300">This batch is at capacity — the student will be added over capacity.</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-slate-400 space-y-1">
                <span>Course fee (₹) — 0 for no invoice</span>
                <input type="number" min={0} className={inputCls} value={cvForm.feeTotal} onChange={(e) => setCvForm({ ...cvForm, feeTotal: e.target.value })} />
              </label>
              <label className="text-xs text-slate-400 space-y-1">
                <span>Due in (days)</span>
                <input type="number" min={0} className={inputCls} value={cvForm.dueInDays} onChange={(e) => setCvForm({ ...cvForm, dueInDays: e.target.value })} />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Login: <span className="text-slate-300">{convert.email || "—"}</span>. A one-time password is shown once; the student must change it at first sign-in.
            </p>
          </div>
        )}
      </Modal>

      {/* Conversion result */}
      <Modal
        open={!!converted}
        onClose={() => setConverted(null)}
        title="Student account created"
        description={converted ? `${converted.name} can now sign in to the student portal.` : undefined}
        footer={<Button size="sm" onClick={() => setConverted(null)}>Done</Button>}
      >
        {converted && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-900/50 border border-white/10">
              <span className="text-sm text-slate-300 font-mono truncate">{converted.email}</span>
              <code className="text-sm text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{converted.password}</code>
              <button
                onClick={() => navigator.clipboard?.writeText(`${converted.email} / ${converted.password}`).then(() => toast("Copied."))}
                className="text-slate-400 hover:text-white"
                title="Copy"
              >
                <Copy size={14} />
              </button>
            </div>
            {converted.invoiceNo && <p className="text-xs text-slate-400">Fee invoice <span className="text-slate-200">{converted.invoiceNo}</span> raised in Finance → Invoices.</p>}
            <p className="text-xs text-slate-500">This password is shown once and stored only as a hash. The student must set a new one at first sign-in.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Users,
  Search,
  Download,
  Upload,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  Loader2,
} from "lucide-react";
import AddStudentModal from "@/components/admin/lms/students/AddStudentModal";
import StudentDetailModal from "@/components/admin/lms/students/StudentDetailModal";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/components/admin/shell/AdminUserContext";
import { useBranch, BranchChip } from "@/components/admin/shell/BranchContext";
import {
  getStudents,
  deleteStudent,
  bulkAssignStudents,
  bulkGenerateLogins,
  bulkSendCredentials,
  importStudents,
  type StudentRowDTO,
  type StudentStats,
  type SortField,
  type SortDir,
} from "@/lib/actions/students";

type ColumnKey = "sr" | "student" | "admission" | "batch" | "phone" | "status" | "admStatus" | "actions";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  sr: "SR NO",
  student: "STUDENT",
  admission: "ADMISSION",
  batch: "BATCH",
  phone: "PHONE",
  status: "STATUS",
  admStatus: "ADMISSION STATUS",
  actions: "ACTIONS",
};

const COLUMN_ORDER: ColumnKey[] = ["sr", "student", "admission", "batch", "phone", "status", "admStatus", "actions"];

const IMPORT_FIELDS = [
  "name",
  "email",
  "gender",
  "dateOfBirth",
  "phone",
  "alternatePhone",
  "guardianName",
  "guardianPhone",
  "guardianEmail",
  "street",
  "city",
  "state",
  "pincode",
  "country",
  "rollNo",
  "admissionDate",
  "batch",
  "branch",
  "course",
  "status",
  "admissionStatus",
  "idProofType",
  "idProofNumber",
] as const;

const IMPORT_KEYMAP: Record<string, string> = Object.fromEntries(
  IMPORT_FIELDS.map((k) => [k.toLowerCase().replace(/[^a-z0-9]/g, ""), k]),
);

const EXPORT_COLUMNS: { header: string; key: keyof StudentRowDTO }[] = [
  { header: "Name", key: "name" },
  { header: "Email", key: "email" },
  { header: "Admission No", key: "admissionNo" },
  { header: "Roll No", key: "rollNo" },
  { header: "Batch", key: "batch" },
  { header: "Course", key: "course" },
  { header: "Branch", key: "branch" },
  { header: "Phone", key: "phone" },
  { header: "Status", key: "status" },
  { header: "Admission Status", key: "admissionStatus" },
];

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Inactive: "bg-red-500/10 text-red-400 border-red-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Graduated: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Transferred: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const COURSE_OPTIONS = [
  "NEET Comprehensive 2026",
  "JEE Main & Advanced 2027",
  "Python Programming",
  "MERN Stack Web Development",
];

export default function StudentManagementPage() {
  const { toast } = useToast();
  // Deleting students and (re)issuing passwords are admin-only (server-enforced).
  const isAdmin = useIsAdmin();
  const branchOptions = useBranch().branches;

  const [data, setData] = useState<{ stats: StudentStats; students: StudentRowDTO[]; totalPages: number; currentPage: number; total: number }>({
    stats: { totalStudents: 0, active: 0, inactive: 0, batchCount: 0, batches: [] },
    students: [],
    totalPages: 1,
    currentPage: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(new Set(COLUMN_ORDER));
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentRowDTO | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentRowDTO | null>(null);
  const [assignField, setAssignField] = useState<"branch" | "course" | "batch" | null>(null);
  const [assignValue, setAssignValue] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [creds, setCreds] = useState<{ email: string; password: string }[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // top dropdowns + import
  const [openMenu, setOpenMenu] = useState<"export" | "template" | "pageExport" | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);
  const pageExportRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function fetchStudents(params?: { search?: string; batch?: string; status?: string; page?: number; sortCol?: SortField; sortDir?: SortDir }) {
    setLoading(true);
    const res = await getStudents({
      search: params?.search ?? searchTerm,
      batch: params?.batch ?? batchFilter,
      status: params?.status ?? statusFilter,
      page: params?.page ?? page,
      sortCol: params?.sortCol ?? sortCol,
      sortDir: params?.sortDir ?? sortDir,
    });
    setData(res);
    setSelected(new Set());
    setLoading(false);
  }

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      void fetchStudents({ page: 1, search: searchTerm, batch: batchFilter, status: statusFilter, sortCol, sortDir });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Page / batch / status changes (and initial load)
  useEffect(() => {
    const t = setTimeout(() => {
      void fetchStudents({ page, search: searchTerm, batch: batchFilter, status: statusFilter, sortCol, sortDir });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, batchFilter, statusFilter, sortCol, sortDir]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setOpenMenu((m) => (m === "export" ? null : m));
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) setOpenMenu((m) => (m === "template" ? null : m));
      if (pageExportRef.current && !pageExportRef.current.contains(e.target as Node)) setOpenMenu((m) => (m === "pageExport" ? null : m));
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setColsOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const toggleCol = (col: ColumnKey) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleSort = (col: SortField) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortedStudents = [...data.students];
  if (sortCol === "name") {
    sortedStudents.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }
  // other sort columns are applied server-side; local re-sort only for the page slice on name.

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allOnPageSelected = data.students.length > 0 && data.students.every((s) => selected.has(s.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        data.students.forEach((s) => next.delete(s.id));
      } else {
        data.students.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setBatchFilter("");
    setStatusFilter("");
    setPage(1);
    fetchStudents({ search: "", batch: "", status: "", page: 1 });
  };

  // ---- export / template / import ----

  const buildExportRows = async (scope: "filtered" | "all"): Promise<StudentRowDTO[]> => {
    const res = await getStudents({
      limit: 10000,
      page: 1,
      sortCol,
      sortDir,
      search: scope === "filtered" ? searchTerm : undefined,
      batch: scope === "filtered" ? batchFilter : undefined,
      status: scope === "filtered" ? statusFilter : undefined,
    });
    return res.students;
  };

  const handleExport = async (scope: "filtered" | "all") => {
    setOpenMenu(null);
    try {
      const rows = await buildExportRows(scope);
      if (!rows.length) {
        toast("No students to export.", "info");
        return;
      }
      const sheetData = rows.map((s) => {
        const out: Record<string, string> = {};
        EXPORT_COLUMNS.forEach(({ header, key }) => {
          out[header] = String(s[key]);
        });
        return out;
      });
      const ws = XLSX.utils.json_to_sheet(sheetData);
      ws["!cols"] = EXPORT_COLUMNS.map(() => ({ wch: 24 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      const stamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Students_${scope === "filtered" ? "CurrentView" : "All"}_${stamp}.xlsx`);
      toast(`Exported ${rows.length} student(s).`);
    } catch {
      toast("Export failed.", "error");
    }
  };

  const handleDownloadExcelTemplate = () => {
    setOpenMenu(null);
    const example: Record<string, string> = {
      name: "Sample Student",
      email: "sample@coaching.com",
      gender: "Male",
      dateOfBirth: "2004-05-12",
      phone: "9876543210",
      alternatePhone: "",
      guardianName: "Sample Guardian",
      guardianPhone: "+91-9876512340",
      guardianEmail: "guardian@example.com",
      street: "Vijay Nagar",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452010",
      country: "India",
      rollNo: "R-1100",
      admissionDate: "2026-06-01",
      batch: "NEET Batch A",
      branch: "Main Branch",
      course: "NEET Comprehensive 2026",
      status: "Active",
      admissionStatus: "Active",
      idProofType: "Aadhar",
      idProofNumber: "1234 5678 9012",
    };

    const ws = XLSX.utils.json_to_sheet([example], {
      header: IMPORT_FIELDS as unknown as string[],
    });
    ws["!cols"] = IMPORT_FIELDS.map(() => ({ wch: 22 }));
    const instructions = XLSX.utils.aoa_to_sheet([
      ["Student Import Template"],
      [""],
      ["Fill one student per row. Keep the header row exactly as-is."],
      ["email is required and unique. Existing emails will UPDATE that student (upsert)."],
      ["status: Active or Inactive. admissionStatus: Active, Pending, Graduated or Transferred."],
      ["Dates use YYYY-MM-DD. You can safely delete the example row before importing."],
    ]);
    instructions["!cols"] = [{ wch: 90 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.utils.book_append_sheet(wb, instructions, "Instructions");
    XLSX.writeFile(wb, "Students_Import_Template.xlsx");
  };

  const handleDownloadCsvTemplate = () => {
    setOpenMenu(null);
    const example: Record<string, string> = {
      name: "Sample Student",
      email: "sample@coaching.com",
      gender: "Male",
      dateOfBirth: "2004-05-12",
      phone: "9876543210",
      alternatePhone: "",
      guardianName: "Sample Guardian",
      guardianPhone: "+91-9876512340",
      guardianEmail: "guardian@example.com",
      street: "Vijay Nagar",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452010",
      country: "India",
      rollNo: "R-1100",
      admissionDate: "2026-06-01",
      batch: "NEET Batch A",
      branch: "Main Branch",
      course: "NEET Comprehensive 2026",
      status: "Active",
      admissionStatus: "Active",
      idProofType: "Aadhar",
      idProofNumber: "1234 5678 9012",
    };
    const ws = XLSX.utils.json_to_sheet([example], { header: IMPORT_FIELDS as unknown as string[] });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "Students_Import_Template.csv");
  };

  const onImportFile = async (file: File) => {
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      if (!sheet) {
        toast("No sheet found in the file.", "error");
        return;
      }
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows = raw
        .map((r) => {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(r)) {
            const canon = IMPORT_KEYMAP[k.toLowerCase().replace(/[^a-z0-9]/g, "")];
            if (canon && v !== "" && v !== null && v !== undefined) out[canon] = v;
          }
          return out;
        })
        .filter((r) => Object.keys(r).length > 0);

      if (!rows.length) {
        toast("No data rows found in the file.", "error");
        return;
      }

      const res = await importStudents(rows);
      if (!res.ok) {
        toast("Import failed.", "error");
        return;
      }
      toast(`Imported: ${res.imported} new, ${res.updated} updated.`, "success");
      // New students get unique one-time passwords — show them once, like Generate Login.
      if (res.credentials.length) setCreds(res.credentials);
      if (res.errors.length) {
        toast(`Skipped ${res.errors.length} invalid row(s).`, "error");
        console.warn("Import row errors:", res.errors);
      }
      fetchStudents({ page: 1 });
    } catch {
      toast("Could not read the file. Use the Excel/CSV template.", "error");
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  // ---- bulk actions ----

  const handleBulkAssign = async () => {
    if (!assignField || !assignValue) return;
    setAssigning(true);
    const res = await bulkAssignStudents({ ids: [...selected], field: assignField, value: assignValue });
    setAssigning(false);
    toast(res.message ?? (res.ok ? "Updated." : "Failed."), res.ok ? "success" : "error");
    if (res.ok) {
      setAssignField(null);
      setAssignValue("");
      fetchStudents();
    }
  };

  const handleGenerateLogins = async () => {
    setGenLoading(true);
    const res = await bulkGenerateLogins({ ids: [...selected] });
    setGenLoading(false);
    if (res.ok && res.credentials) {
      setCreds(res.credentials);
      toast(`Generated logins for ${res.credentials.length} student(s).`);
    } else {
      toast(res.message ?? "Failed.", "error");
    }
  };

  const handleSendCredentials = async () => {
    const res = await bulkSendCredentials({ ids: [...selected] });
    toast(res.message ?? (res.ok ? "Sent." : "Failed."), res.ok ? "success" : "error");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteStudent(deleteTarget.id);
    toast(res.message ?? (res.ok ? "Deleted." : "Failed."), res.ok ? "success" : "error");
    if (res.ok) {
      setDeleteTarget(null);
      fetchStudents();
    } else {
      setDeleteTarget(null);
    }
  };

  const stats = data.stats;

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" /> Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage student records, imports, exports, and profile insights.</p>
          <BranchChip className="mt-2" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div ref={exportMenuRef} className="flex items-center bg-slate-900/50 rounded-lg border border-white/10 p-1 relative">
            <button
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors cursor-default"
              title="Showing the current filtered view"
            >
              {loading ? "Loading…" : `${data.total} student(s)`}
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"
            >
              Excel <ChevronDown size={14} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => handleExport("filtered")}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"
            >
              <Download size={14} /> Export
            </button>

            {openMenu === "export" && (
              <div className="absolute right-0 top-full mt-1 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                <button
                  onClick={() => handleExport("filtered")}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Download size={14} className="text-emerald-400" /> Current view (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("all")}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <Download size={14} className="text-blue-400" /> All students (.xlsx)
                </button>
              </div>
            )}
          </div>

          <div ref={templateMenuRef} className="flex items-center bg-slate-900/50 rounded-lg border border-white/10 p-1 relative">
            <button
              onClick={() => setOpenMenu(openMenu === "template" ? null : "template")}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet size={14} /> Excel Template <ChevronDown size={14} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              onClick={handleDownloadCsvTemplate}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet size={14} /> CSV Template
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button
              onClick={() => importInputRef.current?.click()}
              disabled={importing}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {importing ? "Importing…" : "Import"}
            </button>

            {openMenu === "template" && (
              <div className="absolute right-0 top-full mt-1 w-60 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                <button
                  onClick={handleDownloadExcelTemplate}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} className="text-emerald-400" /> .xlsx (2 sheets: data + instructions)
                </button>
                <button
                  onClick={handleDownloadCsvTemplate}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} className="text-blue-400" /> .csv (single data sheet)
                </button>
              </div>
            )}
          </div>

          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
            }}
          />

          <button
            onClick={() => {
              setEditStudent(null);
              setAddOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-emerald-600/20 ml-auto xl:ml-2"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-white/5">
          <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5"><Users size={13} className="text-blue-400" /> Total Students</p>
          <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs font-medium text-emerald-400/80 mb-1 flex items-center gap-1.5"><CheckCircle2 size={13} /> Active</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-red-500/20 bg-red-500/5">
          <p className="text-xs font-medium text-red-400/80 mb-1 flex items-center gap-1.5"><XCircle size={13} /> Inactive</p>
          <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
          <p className="text-xs font-medium text-purple-400/80 mb-1 flex items-center gap-1.5"><ChevronRight size={13} /> Batches</p>
          <p className="text-2xl font-bold text-purple-400">{stats.batchCount}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl border border-white/10 overflow-hidden"
      >
        {/* Bulk Actions */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 justify-between items-center bg-white/[0.02]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={toggleAll}
              className="w-4 h-4 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-300">
              Select page{" "}
              <span className="text-xs text-slate-500 ml-1">
                {selected.size > 0 ? `${selected.size} selected — assign branch, course, or batch` : "Select students to assign branch, course, or batch"}
              </span>
            </span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {(
              [
                { label: "Assign Branch", field: "branch" as const },
                { label: "Assign Course", field: "course" as const },
                { label: "Assign Batch", field: "batch" as const },
              ]
            ).map(({ label, field }) => (
              <button
                key={field}
                disabled={selected.size === 0}
                onClick={() => {
                  setAssignField(field);
                  setAssignValue("");
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/5 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {label}
              </button>
            ))}
            {isAdmin && (
              <>
                <button
                  disabled={selected.size === 0 || genLoading}
                  onClick={handleGenerateLogins}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/5 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {genLoading ? "Generating…" : "Generate Login"}
                </button>
                <button
                  disabled={selected.size === 0}
                  onClick={handleSendCredentials}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/5 transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Send Credentials
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.01]">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, phone, admission, roll..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto bg-slate-900/50 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Batches</option>
              {stats.batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto bg-slate-900/50 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div ref={pageExportRef} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === "pageExport" ? null : "pageExport")}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Current Page - Excel <ChevronDown size={14} />
              </button>
              {openMenu === "pageExport" && (
                <div className="absolute right-0 top-full mt-1 w-56 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden z-30">
                  <button
                    onClick={() => handleExport("filtered")}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} className="text-emerald-400" /> Current filtered view
                  </button>
                  <button
                    onClick={() => handleExport("all")}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Download size={14} className="text-blue-400" /> All students
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => handleExport("filtered")}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm"
            >
              <Download size={14} /> Export
            </button>
            <div ref={colsRef} className="relative">
              <button
                onClick={() => setColsOpen((o) => !o)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg transition-colors text-sm"
              >
                <Filter size={14} /> Columns
              </button>
              {colsOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 glass-panel border border-white/10 rounded-xl shadow-2xl p-2 z-30">
                  {COLUMN_ORDER.map((col) => (
                    <label key={col} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleCols.has(col)}
                        onChange={() => toggleCol(col)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300">{COLUMN_LABELS[col]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-white/10 text-xs font-semibold tracking-wider">
              <tr>
                {visibleCols.has("sr") && (
                  <th className="px-4 py-4 w-12 text-center">
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500" />
                  </th>
                )}
                {visibleCols.has("sr") && <th className="px-4 py-4 text-center">SR NO</th>}
                {visibleCols.has("student") && (
                  <th className="px-4 py-4 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                    STUDENT {sortCol === "name" && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}{" "}
                  </th>
                )}
                {visibleCols.has("admission") && (
                  <th className="px-4 py-4 cursor-pointer select-none" onClick={() => toggleSort("admissionNo")}>
                    ADMISSION <span>{sortCol === "admissionNo" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </th>
                )}
                {visibleCols.has("batch") && (
                  <th className="px-4 py-4 cursor-pointer select-none" onClick={() => toggleSort("batch")}>
                    BATCH <span>{sortCol === "batch" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </th>
                )}
                {visibleCols.has("phone") && (
                  <th className="px-4 py-4 cursor-pointer select-none" onClick={() => toggleSort("phone")}>
                    PHONE <span>{sortCol === "phone" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </th>
                )}
                {visibleCols.has("status") && <th className="px-4 py-4 text-center">STATUS</th>}
                {visibleCols.has("admStatus") && <th className="px-4 py-4 text-center">ADMISSION STATUS</th>}
                {visibleCols.has("actions") && <th className="px-4 py-4 text-center">ACTIONS</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                      <Loader2 size={18} className="animate-spin" /> Loading students…
                    </div>
                  </td>
                </tr>
              ) : data.students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={40} className="text-slate-600" />
                      <p className="text-slate-400 text-sm">No students match your filters.</p>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg text-xs transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student, i) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    {visibleCols.has("sr") && (
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(student.id)}
                          onChange={() => toggleSelected(student.id)}
                          className="rounded bg-slate-900 border-white/20 text-emerald-500 focus:ring-emerald-500"
                        />
                      </td>
                    )}
                    {visibleCols.has("sr") && (
                      <td className="px-4 py-4 text-slate-400 text-center">{(page - 1) * 20 + i + 1}</td>
                    )}
                    {visibleCols.has("student") && (
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300 shrink-0">
                            <User size={14} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-slate-200 font-medium truncate">{student.name}</span>
                            <span className="text-[10px] text-slate-500 truncate">{student.email}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.has("admission") && (
                      <td className="px-4 py-4">
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-200 font-mono text-xs">{student.admissionNo}</span>
                          <span className="text-[10px] text-slate-500">Roll: {student.rollNo}</span>
                        </div>
                      </td>
                    )}
                    {visibleCols.has("batch") && <td className="px-4 py-4 text-slate-300">{student.batch}</td>}
                    {visibleCols.has("phone") && <td className="px-4 py-4 text-slate-300 font-mono text-xs">{student.phone}</td>}
                    {visibleCols.has("status") && (
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${STATUS_STYLE[student.status] ?? STATUS_STYLE.Active}`}>
                          {student.status}
                        </span>
                      </td>
                    )}
                    {visibleCols.has("admStatus") && (
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${STATUS_STYLE[student.admissionStatus] ?? STATUS_STYLE.Active}`}>
                          {student.admissionStatus}
                        </span>
                      </td>
                    )}
                    {visibleCols.has("actions") && (
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewId(student.id)}
                            title="View details"
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditStudent(student);
                              setAddOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5"
                          >
                            <Edit2 size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(student)}
                              title="Delete"
                              disabled={student.isDemo}
                              className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-slate-300 px-3 py-1.5 border border-white/10 rounded-lg transition-colors"
          >
            Clear Filters
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-slate-400 px-2">
              Page {data.currentPage} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages || loading}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AddStudentModal
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditStudent(null);
        }}
        student={editStudent}
        onSaved={fetchStudents}
      />
      <StudentDetailModal open={viewId !== null} studentId={viewId} onClose={() => setViewId(null)} onChanged={() => fetchStudents()} />

      {/* Delete confirm */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete student"
        description={deleteTarget ? `Remove ${deleteTarget.name} (${deleteTarget.email}) and all their test records?` : ""}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-400">
          Demo accounts are protected from deletion. This action cannot be undone.
        </p>
      </Modal>

      {/* Bulk assign */}
      <Modal
        open={assignField !== null}
        onClose={() => {
          if (!assigning) setAssignField(null);
        }}
        title={`Assign ${assignField === "branch" ? "Branch" : assignField === "course" ? "Course" : "Batch"}`}
        description={`Applying to ${selected.size} selected student(s).`}
        size="sm"
        footer={
          <>
            <button
              onClick={() => setAssignField(null)}
              disabled={assigning}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkAssign}
              disabled={!assignValue || assigning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {assigning ? "Assigning…" : "Assign"}
            </button>
          </>
        }
      >
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Value</label>
        <select
          value={assignValue}
          onChange={(e) => setAssignValue(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select a value</option>
          {(assignField === "branch"
            ? branchOptions
            : assignField === "course"
              ? COURSE_OPTIONS
              : stats.batches
          ).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Modal>

      {/* Generated credentials */}
      <Modal
        open={creds.length > 0}
        onClose={() => setCreds([])}
        title="Generated Login Credentials"
        description="Share these one-time passwords with the students."
        size="lg"
        footer={
          <button
            onClick={() => setCreds([])}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        }
      >
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {creds.map((c) => (
            <div key={c.email} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-900/50 border border-white/10">
              <span className="text-sm text-slate-300 font-mono truncate">{c.email}</span>
              <code className="text-sm text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{c.password}</code>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Passwords are hashed in the database and shown here once. Students must set a new password at first sign-in.
        </p>
      </Modal>
    </div>
  );
}
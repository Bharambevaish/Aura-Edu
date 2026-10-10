"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  User,
  Users,
  GraduationCap,
  CreditCard,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { createStudent, updateStudent, getStudentDetail, type StudentRowDTO } from "@/lib/actions/students";
import { useToast } from "@/components/ui/Toast";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Present -> edit mode (prefills the form); absent -> create mode. */
  student?: StudentRowDTO | null;
  onSaved?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  alternatePhone: string;
  password: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  guardianName: string;
  relationship: string;
  guardianPhone: string;
  guardianEmail: string;
  admissionDate: string;
  branch: string;
  status: string;
  course: string;
  batch: string;
  idProofType: string;
  idProofNumber: string;
  photoName: string;
}

const EMPTY_FORM: FormData = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  alternatePhone: "",
  password: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  guardianName: "",
  relationship: "Father",
  guardianPhone: "",
  guardianEmail: "",
  admissionDate: "",
  branch: "",
  status: "Active",
  course: "",
  batch: "",
  idProofType: "Aadhar",
  idProofNumber: "",
  photoName: "",
};

function randomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const rnd = new Uint8Array(12);
  crypto.getRandomValues(rnd);
  for (const b of rnd) out += chars[b % chars.length];
  return `${out.slice(0, 8)}@${out.slice(8).toUpperCase()}`;
}

const inputCls =
  "w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors";
const labelCls = "block text-sm font-medium text-slate-300 mb-1.5";

/** Select options that always include the stored value, so edit never shows an empty dropdown. */
const withCurrent = (base: readonly string[], current: string) =>
  current && !base.includes(current) ? [...base, current] : [...base];

export default function AddStudentModal({ isOpen, onClose, student, onSaved }: AddStudentModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isEdit = Boolean(student);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Guardian Details", icon: Users },
    { id: 3, title: "Academic Info", icon: GraduationCap },
    { id: 4, title: "Course & Fees", icon: CreditCard },
  ];

  // Reset form each time the modal opens (and load editable profile in edit mode).
  useEffect(() => {
    if (!isOpen) return;

    const t = setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setLoadError(null);
      setCurrentStep(1);

      if (student) {
        let cancelled = false;
        setLoading(true);
        getStudentDetail(student.id)
          .then((detail) => {
            if (cancelled) return;
            if (!detail) {
              setLoadError("Could not load this student's profile. Refresh and try again.");
              setLoading(false);
              return;
            }
            const [firstName = "", lastName = ""] = detail.name.split(/(?<=^[^\s]+)\s/);
            setForm({
              firstName,
              lastName: lastName || "",
              gender: detail.gender === "-" ? "" : detail.gender,
              dateOfBirth: detail.dateOfBirth === "-" ? "" : detail.dateOfBirth,
              email: detail.email,
              phone: detail.phone === "-" ? "" : detail.phone,
              alternatePhone: detail.alternatePhone === "-" ? "" : detail.alternatePhone,
              password: "",
              street: detail.street === "-" ? "" : detail.street,
              city: detail.city === "-" ? "" : detail.city,
              state: detail.state === "-" ? "" : detail.state,
              pincode: detail.pincode === "-" ? "" : detail.pincode,
              country: detail.country === "-" ? "" : detail.country,
              guardianName: detail.guardianName === "-" ? "" : detail.guardianName,
              relationship: "Father",
              guardianPhone: detail.guardianPhone === "-" ? "" : detail.guardianPhone,
              guardianEmail: detail.guardianEmail === "-" ? "" : detail.guardianEmail,
              admissionDate: detail.admissionDate === "-" ? "" : detail.admissionDate,
              branch: detail.branch === "-" ? "" : detail.branch,
              status: detail.status === "-" ? "Active" : detail.status,
              course: detail.course === "-" ? "" : detail.course,
              batch: detail.batch === "-" ? "" : detail.batch,
              idProofType: detail.idProofType === "-" ? "Aadhar" : detail.idProofType,
              idProofNumber: detail.idProofNumber === "-" ? "" : detail.idProofNumber,
              photoName: "",
            });
            setLoading(false);
          })
          .catch((err) => {
            console.error("Failed to load student for edit:", err);
            if (!cancelled) {
              setLoadError("Could not load this student's profile. Refresh and try again.");
              setLoading(false);
            }
          });
        return () => {
          cancelled = true;
        };
      }
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, student]);

  if (!isOpen) return null;

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    // In edit mode every stored value is already present, so a missing value is
    // simply left untouched — only filled values get format-checked.
    const required = (v: string) => (!isEdit ? Boolean(v.trim()) : true);
    if (currentStep === 1) {
      if (!required(form.firstName)) next.firstName = "This field is required";
      if (!required(form.lastName)) next.lastName = "This field is required";
      if (!required(form.gender)) next.gender = "This field is required";
      if (!required(form.dateOfBirth)) next.dateOfBirth = "This field is required";
      if (!required(form.email)) next.email = "This field is required";
      else if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address";
      if (!required(form.phone)) next.phone = "This field is required";
      else if (form.phone.trim() && !/^[0-9+\-\s]{8,15}$/.test(form.phone)) next.phone = "Enter a valid 10-digit mobile";
      if (!isEdit && !form.password) next.password = "Password is required";
    }
    if (currentStep === 2) {
      if (!required(form.guardianName)) next.guardianName = "This field is required";
    }
    if (currentStep === 3) {
      if (!required(form.branch)) next.branch = "This field is required";
    }
    if (currentStep === 4) {
      if (!required(form.course)) next.course = "This field is required";
      if (!required(form.batch)) next.batch = "This field is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps && validateStep()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);

    const payload: Record<string, unknown> = {
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      phone: form.phone.trim(),
      alternatePhone: form.alternatePhone.trim(),
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      guardianEmail: form.guardianEmail.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      country: form.country.trim() || "India",
      admissionDate: form.admissionDate,
      branch: form.branch,
      status: form.status as "Active" | "Inactive",
      course: form.course,
      batch: form.batch,
      idProofType: form.idProofType,
      idProofNumber: form.idProofNumber.trim(),
      admissionStatus: "Active",
    };

    let result;
    try {
      if (isEdit && student) {
        result = await updateStudent(student.id, payload);
      } else {
        payload.password = form.password;
        result = await createStudent(payload);
      }

      if (result.ok) {
        toast(result.message ?? (isEdit ? "Student updated." : "Student added."), "success");
        onSaveDone();
      } else {
        toast(result.message ?? "Something went wrong.", "error");
      }
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onSaveDone = () => {
    onSaved?.();
    onClose();
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const err = (field: keyof FormData) =>
    errors[field] ? (
      <p className="text-xs text-red-400 mt-1.5">{errors[field]}</p>
    ) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#070B14]/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">{isEdit ? "Edit Student" : "Add New Student"}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="px-6 border-b border-white/10 bg-slate-900/50 shrink-0">
            <div className="flex items-center gap-6 overflow-x-auto custom-scrollbar no-scrollbar py-4">
              {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div key={step.id} className="flex items-center gap-4 shrink-0">
                    <button
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      disabled={!isCompleted && !isActive}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-[18px]"
                          : isCompleted
                            ? "text-emerald-500/70 hover:text-emerald-400"
                            : "text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : <step.icon size={16} />}
                      {step.title}
                      {isActive && <ChevronRight size={14} className="ml-1 opacity-50" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="animate-spin mr-2" size={18} /> Loading student…
              </div>
            ) : loadError ? (
              <div className="py-16 text-center">
                <p className="text-red-400 text-sm">{loadError}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-5 py-2 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelCls}>First Name *</label>
                          <input
                            type="text"
                            className={`${inputCls} ${errors.firstName ? "border-red-500/50" : ""}`}
                            placeholder="Enter first name"
                            value={form.firstName}
                            onChange={set("firstName")}
                          />
                          {err("firstName")}
                        </div>
                        <div>
                          <label className={labelCls}>Last Name *</label>
                          <input
                            type="text"
                            className={`${inputCls} ${errors.lastName ? "border-red-500/50" : ""}`}
                            placeholder="Enter last name"
                            value={form.lastName}
                            onChange={set("lastName")}
                          />
                          {err("lastName")}
                        </div>
                        <div>
                          <label className={labelCls}>Gender *</label>
                          <select
                            className={`${inputCls} ${errors.gender ? "border-red-500/50" : ""}`}
                            value={form.gender}
                            onChange={set("gender")}
                          >
                            <option value="">Select Gender</option>
                            {withCurrent(["Male", "Female", "Other"], form.gender).map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          {err("gender")}
                        </div>
                        <div>
                          <label className={labelCls}>Date of Birth *</label>
                          <input
                            type="date"
                            className={`${inputCls} ${errors.dateOfBirth ? "border-red-500/50" : ""}`}
                            value={form.dateOfBirth}
                            onChange={set("dateOfBirth")}
                          />
                          {err("dateOfBirth")}
                        </div>
                        <div>
                          <label className={labelCls}>Email Address *</label>
                          <input
                            type="email"
                            className={`${inputCls} ${errors.email ? "border-red-500/50" : ""}`}
                            placeholder="Enter email address"
                            value={form.email}
                            onChange={set("email")}
                            readOnly={isEdit}
                          />
                          {err("email")}
                        </div>
                        <div>
                          <label className={labelCls}>Phone Number *</label>
                          <input
                            type="tel"
                            className={`${inputCls} ${errors.phone ? "border-red-500/50" : ""}`}
                            placeholder="+91-9876543210"
                            value={form.phone}
                            onChange={set("phone")}
                          />
                          {err("phone")}
                          <p className="text-xs text-slate-500 mt-1">10-digit mobile, starts 6-9.</p>
                        </div>
                        <div>
                          <label className={labelCls}>Alternate Phone</label>
                          <input type="tel" className={inputCls} placeholder="9876543210" value={form.alternatePhone} onChange={set("alternatePhone")} />
                        </div>
                        <div>
                          <label className={labelCls}>
                            Password {!isEdit && <span className="text-red-400">*</span>}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className={`${inputCls} ${errors.password ? "border-red-500/50" : ""}`}
                              placeholder={isEdit ? "Leave blank to keep current" : "Click Generate to create password"}
                              value={form.password}
                              onChange={set("password")}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setForm((f) => ({ ...f, password: randomPassword() }));
                                setErrors((prev) => ({ ...prev, password: undefined }));
                              }}
                              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                            >
                              Generate
                            </button>
                          </div>
                          {err("password")}
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className={labelCls}>Profile Photo</label>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                            <User size={24} />
                          </div>
                          <div>
                            <label className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium rounded-lg transition-colors border border-emerald-500/20 cursor-pointer">
                              Choose File
                              <input
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setForm((f) => ({ ...f, photoName: file.name }));
                                }}
                              />
                            </label>
                            <span className="text-sm text-slate-500 ml-3">{form.photoName || "No file chosen"}</span>
                            <p className="text-xs text-slate-500 mt-2">JPG/PNG/WEBP, max 5 MB. (Stored client-side in the POC.)</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <h3 className="text-sm font-bold text-white mb-4">Address Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className={labelCls}>Street Address</label>
                            <input type="text" className={inputCls} placeholder="Enter street address" value={form.street} onChange={set("street")} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={labelCls}>City</label>
                              <input type="text" className={inputCls} placeholder="Enter city" value={form.city} onChange={set("city")} />
                            </div>
                            <div>
                              <label className={labelCls}>State</label>
                              <input type="text" className={inputCls} placeholder="Enter state" value={form.state} onChange={set("state")} />
                            </div>
                            <div>
                              <label className={labelCls}>Pincode</label>
                              <input type="text" className={inputCls} placeholder="Enter pincode" value={form.pincode} onChange={set("pincode")} />
                            </div>
                            <div>
                              <label className={labelCls}>Country</label>
                              <input type="text" className={inputCls} value={form.country} onChange={set("country")} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Guardian Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelCls}>Guardian Name *</label>
                          <input
                            type="text"
                            className={`${inputCls} ${errors.guardianName ? "border-red-500/50" : ""}`}
                            placeholder="Enter guardian name"
                            value={form.guardianName}
                            onChange={set("guardianName")}
                          />
                          {err("guardianName")}
                        </div>
                        <div>
                          <label className={labelCls}>Relationship *</label>
                          <select className={inputCls} value={form.relationship} onChange={set("relationship")}>
                            <option>Father</option>
                            <option>Mother</option>
                            <option>Local Guardian</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Guardian Phone</label>
                          <input type="tel" className={inputCls} value={form.guardianPhone} onChange={set("guardianPhone")} />
                        </div>
                        <div>
                          <label className={labelCls}>Guardian Email</label>
                          <input type="email" className={inputCls} value={form.guardianEmail} onChange={set("guardianEmail")} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Academic Info */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelCls}>Admission Date *</label>
                          <input type="date" className={`${inputCls} ${errors.admissionDate ? "border-red-500/50" : ""}`} value={form.admissionDate} onChange={set("admissionDate")} />
                          {err("admissionDate")}
                        </div>
                        <div>
                          <label className={labelCls}>Branch *</label>
                          <select className={`${inputCls} ${errors.branch ? "border-red-500/50" : ""}`} value={form.branch} onChange={set("branch")}>
                            <option value="">Select Branch</option>
                            {withCurrent(["Main Branch", "Mumbai Branch"], form.branch).map((b) => (
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                          {err("branch")}
                        </div>
                        <div>
                          <label className={labelCls}>Student Status</label>
                          <select className={inputCls} value={form.status} onChange={set("status")}>
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <h3 className="text-sm font-bold text-white mb-4">Document Information (Optional)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={labelCls}>ID Proof Type</label>
                            <select className={inputCls} value={form.idProofType} onChange={set("idProofType")}>
                              {withCurrent(["Aadhar", "PAN", "Passport"], form.idProofType).map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>ID Proof Number</label>
                            <input type="text" className={inputCls} placeholder="Enter ID proof number" value={form.idProofNumber} onChange={set("idProofNumber")} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Course & Fees */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 mb-2">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0">
                          <CreditCard size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">Course Assignment</h3>
                          <p className="text-sm text-slate-400">Assign a course and batch to complete registration. Fee configuration is handled in the Finance module.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                          <label className={labelCls}>Course *</label>
                          <select className={`${inputCls} ${errors.course ? "border-red-500/50" : ""}`} value={form.course} onChange={set("course")}>
                            <option value="">Select Course</option>
                            {withCurrent(
                              ["NEET Comprehensive 2026", "JEE Main & Advanced 2027", "Python Programming", "MERN Stack Web Development"],
                              form.course,
                            ).map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          {err("course")}
                        </div>
                        <div>
                          <label className={labelCls}>Batch *</label>
                          <select className={`${inputCls} ${errors.batch ? "border-red-500/50" : ""}`} value={form.batch} onChange={set("batch")}>
                            <option value="">Select Batch</option>
                            {withCurrent(["NEET Batch A", "NEET Batch B", "JEE Batch A", "Python Programming"], form.batch).map((b) => (
                              <option key={b}>{b}</option>
                            ))}
                          </select>
                          {err("batch")}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                disabled={saving}
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={currentStep < totalSteps ? handleNext : handleSubmit}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {currentStep < totalSteps ? "Next" : isEdit ? "Save Changes" : "Submit"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
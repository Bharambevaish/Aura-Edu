"use client";

/**
 * Online Admissions — public multi-step application form.
 *
 * Submits to `submitAdmission` (lib/actions/leads.ts): validated, rate-limited
 * per IP and honeypot-protected. It creates a *lead*, never an account — the
 * admissions team reviews it on Admin → Leads and converts it, which issues
 * the student login.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  BookOpen,
  Users,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getAdmissionOptions, submitAdmission } from '@/lib/actions/leads';

type Form = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  course: string;
  preferredBatch: string;
  branch: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  address: string;
  website: string; // honeypot
};

const EMPTY: Form = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  course: '',
  preferredBatch: 'Morning (8 AM - 12 PM)',
  branch: 'Main Branch',
  guardianName: '',
  guardianRelation: 'Father',
  guardianPhone: '',
  address: '',
  website: '',
};

const inputCls =
  'w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all';

/** Minimal per-step checks so users fix mistakes before the final submit. */
function stepError(step: number, f: Form): string | null {
  if (step === 1) {
    if (!f.firstName.trim() || !f.lastName.trim()) return 'Enter your first and last name.';
    if (!f.dateOfBirth) return 'Enter your date of birth.';
    if (!f.gender) return 'Select a gender.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.';
    if (f.phone.replace(/\D/g, '').length < 7) return 'Enter a valid phone number.';
  }
  if (step === 2 && !f.course) return 'Choose a course.';
  if (step === 3) {
    if (f.guardianName.trim().length < 2) return "Enter the guardian's name.";
    if (f.guardianPhone.replace(/\D/g, '').length < 7) return "Enter the guardian's phone number.";
    if (f.address.trim().length < 5) return 'Enter your address.';
  }
  return null;
}

export default function StudentRegistrationPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [courses, setCourses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const totalSteps = 5;

  useEffect(() => {
    let ignore = false;
    getAdmissionOptions()
      .then((o) => {
        if (!ignore) setCourses(o.courses);
      })
      .catch(() => {
        if (!ignore) setError('Could not load courses. Please refresh the page.');
      });
    return () => {
      ignore = true;
    };
  }, []);

  const steps = [
    { id: 1, title: 'Personal Details', icon: User },
    { id: 2, title: 'Academic Selection', icon: BookOpen },
    { id: 3, title: 'Guardian Details', icon: Users },
    { id: 4, title: 'Review', icon: ClipboardCheck },
    { id: 5, title: 'Complete', icon: CheckCircle2 },
  ];

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleNext = async () => {
    const err = stepError(step, form);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    // Step 4 → submit.
    setSubmitting(true);
    try {
      const res = await submitAdmission(form);
      if (!res.ok || !res.reference) {
        setError(res.message);
        return;
      }
      setReference(res.reference);
      setStep(5);
    } catch {
      setError('Could not submit your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const review: [string, string][] = [
    ['Name', `${form.firstName} ${form.lastName}`],
    ['Date of birth', form.dateOfBirth],
    ['Gender', form.gender],
    ['Email', form.email],
    ['Phone', form.phone],
    ['Course', form.course],
    ['Preferred batch', form.preferredBatch],
    ['Branch', form.branch],
    ['Guardian', `${form.guardianName} (${form.guardianRelation})`],
    ['Guardian phone', form.guardianPhone],
    ['Address', form.address],
  ];

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20"
          >
            <span className="text-2xl font-bold text-white">A</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Online Admission</h1>
          <p className="text-slate-400">Apply to AuraEdu Institute. Our admissions team will contact you within one working day.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
          <div
            className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          <div className="relative z-10 flex justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  step >= s.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-800 text-slate-500 border border-white/10'
                }`}>
                  <s.icon size={18} />
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.id ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          {/* Honeypot — hidden from people, filled by bots. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            value={form.website}
            onChange={set('website')}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">1. Personal Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                      <input type="text" className={inputCls} placeholder="Enter first name" value={form.firstName} onChange={set('firstName')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                      <input type="text" className={inputCls} placeholder="Enter last name" value={form.lastName} onChange={set('lastName')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                      <input type="date" className={inputCls} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
                      <select className={inputCls} value={form.gender} onChange={set('gender')}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                      <input type="email" className={inputCls} placeholder="student@example.com" value={form.email} onChange={set('email')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                      <input type="tel" className={inputCls} placeholder="+91" value={form.phone} onChange={set('phone')} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">2. Academic Selection</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Target Course *</label>
                      {courses.length === 0 && <p className="text-sm text-slate-500">Loading courses…</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {courses.map((course) => (
                          <label key={course} className="cursor-pointer group">
                            <input
                              type="radio"
                              name="course"
                              className="peer sr-only"
                              checked={form.course === course}
                              onChange={() => setForm((f) => ({ ...f, course }))}
                            />
                            <div className="h-full p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/50 transition-all text-center">
                              <BookOpen size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                              <span className="text-sm font-medium text-slate-300">{course}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Timing</label>
                        <select className={inputCls} value={form.preferredBatch} onChange={set('preferredBatch')}>
                          <option>Morning (8 AM - 12 PM)</option>
                          <option>Afternoon (1 PM - 5 PM)</option>
                          <option>Weekend Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Branch</label>
                        <select className={inputCls} value={form.branch} onChange={set('branch')}>
                          <option>Main Branch</option>
                          <option>City Centre</option>
                          <option>Online Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">3. Guardian Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian&apos;s Full Name *</label>
                      <input type="text" className={inputCls} value={form.guardianName} onChange={set('guardianName')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Relationship</label>
                      <select className={inputCls} value={form.guardianRelation} onChange={set('guardianRelation')}>
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Local Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian&apos;s Contact Number *</label>
                      <input type="tel" className={inputCls} value={form.guardianPhone} onChange={set('guardianPhone')} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Permanent Address *</label>
                      <textarea rows={3} className={`${inputCls} custom-scrollbar`} value={form.address} onChange={set('address')}></textarea>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">4. Review &amp; Submit</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {review.map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 border-b border-white/5 pb-2 text-sm">
                        <span className="text-slate-400">{label}</span>
                        <span className="text-white text-right">{value || '—'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                    <AlertCircle size={20} className="text-blue-400 shrink-0" />
                    <p className="text-sm text-blue-200">
                      Please bring your photo, ID proof and latest marksheet to the centre — documents are verified in person before admission is confirmed.
                    </p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Application Received!</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Thank you, {form.firstName}. Our admissions team will call you shortly. Your student login is issued once your admission is confirmed.
                  </p>

                  <div className="max-w-sm mx-auto bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden text-left shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4">Application Reference</h3>
                    <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-white/5">
                      <span className="font-mono text-white font-bold tracking-wider">{reference}</span>
                      <button
                        onClick={() => reference && navigator.clipboard?.writeText(reference)}
                        className="text-slate-400 hover:text-white transition-colors"
                        title="Copy reference"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-4">Quote this reference when you contact the admissions office.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-6 text-sm text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center max-w-4xl mx-auto">
          {step > 1 && step < totalSteps ? (
            <button
              onClick={handlePrev}
              disabled={submitting}
              className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Previous
            </button>
          ) : <div></div>}

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={submitting}
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:translate-x-1 ml-auto disabled:opacity-60"
            >
              {step === 4 ? (submitting ? 'Submitting…' : 'Submit Application') : 'Continue'} <ArrowRight size={18} />
            </button>
          ) : (
            <Link
              href="/"
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
            >
              Back to Home <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Online Admissions multi-step festival form (demo).
 *
 * IMPORTANT: this is a UI brochure form — there is intentionally NO server
 * action behind it, so nobody can mass-create accounts from this page. It
 * exists to sell the admissions experience; a real signup action will only be
 * added with the Online Admissions crown-jewel module (Phase 2).
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BookOpen, 
  Users, 
  FileUp, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Copy,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function StudentRegistrationPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    { id: 1, title: 'Personal Details', icon: User },
    { id: 2, title: 'Academic Selection', icon: BookOpen },
    { id: 3, title: 'Guardian Details', icon: Users },
    { id: 4, title: 'Documents', icon: FileUp },
    { id: 5, title: 'Complete', icon: CheckCircle2 },
  ];

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

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
          <h1 className="text-3xl font-bold text-white mb-2">Student Registration</h1>
          <p className="text-slate-400">Join AuraEdu Institute. Complete your profile in a few steps.</p>
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
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
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
                      <input type="text" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="Enter first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                      <input type="text" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="Enter last name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                      <input type="date" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Gender *</label>
                      <select className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                      <input type="email" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="student@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                      <input type="tel" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="+91" />
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['JEE (Main + Adv)', 'NEET (UG)', 'MERN Stack Dev'].map(course => (
                          <label key={course} className="cursor-pointer group">
                            <input type="radio" name="course" className="peer sr-only" />
                            <div className="p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-800 peer-checked:bg-emerald-500/10 peer-checked:border-emerald-500/50 transition-all text-center">
                              <BookOpen size={24} className="mx-auto mb-2 text-slate-400 group-hover:text-emerald-400 peer-checked:text-emerald-400 transition-colors" />
                              <span className="text-sm font-medium text-slate-300 peer-checked:text-emerald-400">{course}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Batch *</label>
                        <select className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                          <option>Morning (8 AM - 12 PM)</option>
                          <option>Afternoon (1 PM - 5 PM)</option>
                          <option>Weekend Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Branch Location *</label>
                        <select className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                          <option>Main Campus, Mumbai</option>
                          <option>Pune Center</option>
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
                      <input type="text" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Relationship *</label>
                      <select className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Local Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian&apos;s Contact Number *</label>
                      <input type="tel" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Emergency Contact *</label>
                      <input type="tel" className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Permanent Address *</label>
                      <textarea rows={3} className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all custom-scrollbar"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-6">4. Documents Upload</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Passport Photo', desc: 'Recent clear photo' },
                      { title: 'ID Proof', desc: 'Aadhar/PAN/Passport' },
                      { title: 'Previous Marksheet', desc: 'Latest academic record' }
                    ].map((doc, i) => (
                      <div key={i} className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-900/30 transition-colors cursor-pointer group h-48">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                          <Upload size={20} />
                        </div>
                        <h4 className="font-medium text-white mb-1">{doc.title}</h4>
                        <p className="text-xs text-slate-400">{doc.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 mt-4">
                    <AlertCircle size={20} className="text-blue-400 shrink-0" />
                    <p className="text-sm text-blue-200">Please ensure all uploaded documents are clear and readable. Max file size: 5MB per document. Formats allowed: PDF, JPG, PNG.</p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-8">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Your application has been received and verified. Welcome to AuraEdu!</p>
                  
                  <div className="max-w-sm mx-auto bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden text-left shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-6">Student Credentials</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Student ID</p>
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-white/5">
                          <span className="font-mono text-white font-bold tracking-wider">MYE-2026-4091</span>
                          <button className="text-slate-400 hover:text-white transition-colors"><Copy size={16} /></button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Temporary Password</p>
                        <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-white/5">
                          <span className="font-mono text-white tracking-wider">Welcome@123!</span>
                          <button className="text-slate-400 hover:text-white transition-colors"><Copy size={16} /></button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 mt-6 italic">* Please change your password upon first login.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between items-center max-w-4xl mx-auto">
          {step > 1 && step < totalSteps ? (
            <button 
              onClick={handlePrev}
              className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Previous
            </button>
          ) : <div></div>}
          
          {step < totalSteps ? (
            <button 
              onClick={handleNext}
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 hover:translate-x-1 ml-auto"
            >
              {step === 4 ? 'Submit Application' : 'Continue'} <ArrowRight size={18} />
            </button>
          ) : (
            <Link 
              href="/login"
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
            >
              Proceed to Login <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  User, 
  Users, 
  GraduationCap, 
  CreditCard,
  ChevronRight,
  Upload
} from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Guardian Details', icon: Users },
    { id: 3, title: 'Academic Info', icon: GraduationCap },
    { id: 4, title: 'Course & Fees', icon: CreditCard },
  ];

  if (!isOpen) return null;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
            <h2 className="text-xl font-bold text-white">Add New Student</h2>
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
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center gap-4 shrink-0">
                    <button 
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      disabled={!isCompleted && !isActive}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive 
                          ? 'text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-[18px]' 
                          : isCompleted
                            ? 'text-emerald-500/70 hover:text-emerald-400'
                            : 'text-slate-500 cursor-not-allowed'
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
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name *</label>
                        <input type="text" className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" placeholder="Enter first name" />
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name *</label>
                        <input type="text" className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" placeholder="Enter last name" />
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender *</label>
                        <select className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth *</label>
                        <input type="date" className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
                        <input type="email" className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" placeholder="Enter email address" />
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number *</label>
                        <input type="tel" className="w-full bg-slate-900/50 border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" placeholder="+91-9876543210" defaultValue="+91-9876543210" />
                        <p className="text-xs text-red-400 mt-1.5">This field is required</p>
                        <p className="text-xs text-slate-500 mt-1">10-digit mobile, starts 6-9.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Alternate Phone</label>
                        <input type="tel" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="9876543210" defaultValue="9876543210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                        <div className="flex gap-2">
                          <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Click Generate to create password" readOnly />
                          <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0 shadow-lg shadow-purple-600/20">
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-3">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400">
                          <User size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium rounded-lg transition-colors border border-emerald-500/20">
                              Choose File
                            </button>
                            <span className="text-sm text-slate-500">No file chosen</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">JPG/PNG/WEBP, max 5 MB. Files are security-scanned before saving.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-sm font-bold text-white mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Street Address</label>
                          <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter street address" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter city" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">State</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter state" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Pincode</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter pincode" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                            <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" defaultValue="India" />
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
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Guardian Name *</label>
                        <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter guardian name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Relationship *</label>
                        <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                          <option>Father</option>
                          <option>Mother</option>
                          <option>Local Guardian</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Guardian Phone *</label>
                        <input type="tel" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" defaultValue="+91-9876543210" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Guardian Email *</label>
                        <input type="email" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" defaultValue="guardian@example.com" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Academic Info */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Roll Number</label>
                        <input type="text" className="w-full bg-slate-800 border border-white/5 rounded-lg px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed" value="1780912252738" readOnly />
                        <p className="text-xs text-slate-500 mt-1">Roll number is auto-generated</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Admission Date *</label>
                        <input type="date" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" defaultValue="2026-07-18" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Branch *</label>
                        <select className="w-full bg-slate-900/50 border border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                          <option>Select Branch</option>
                          <option>Main Branch</option>
                          <option>Mumbai Branch</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Student Status</label>
                        <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-sm font-bold text-white mb-4">Document Information (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">ID Proof Type</label>
                          <select className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
                            <option>Aadhar</option>
                            <option>PAN</option>
                            <option>Passport</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">ID Proof Number</label>
                          <input type="text" className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="Enter ID proof number" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Course & Fees */}
                {currentStep === 4 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                      <CreditCard size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Final Step: Course Assignment</h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">Assign a course, batch, and configure the fee structure for this student to complete registration.</p>
                    <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-white/10">
                      Configure Fees Later
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
            {currentStep > 1 ? (
              <button 
                onClick={prevStep}
                className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Previous
              </button>
            ) : <div></div>}

            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={currentStep < totalSteps ? nextStep : onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
              >
                {currentStep < totalSteps ? 'Next' : 'Submit'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

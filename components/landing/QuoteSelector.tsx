"use client";

import { useState } from "react";
import { Send, CheckSquare, Square, Calculator, Server, Users, Building, Plus, Minus, Sparkles } from "lucide-react";

export default function QuoteSelector() {
  const [selectedProduct, setSelectedProduct] = useState<"Academy" | "ERP" | "HRM">("Academy");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Scale inputs
  const [branches, setBranches] = useState<number>(1);
  const [studentCount, setStudentCount] = useState<string>("Up to 500 students");
  const [serverHosting, setServerHosting] = useState<string>("Shared Server (recommended)");

  // Contact form inputs
  const [org, setOrg] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const academyModuleList = [
    "Student Management",
    "Staff Management",
    "Course Management",
    "Attendance Management",
    "Batch Management",
    "Assignment Management",
    "Certificate Generator",
    "Salary & Payroll",
    "Leave Management",
    "Internal Task Manager",
    "Analytical Reports",
    "Lead Management + Auto Conversion",
    "Self-Purchase Enrolment",
    "Online Admissions",
    "Fees Collection",
    "Accounts Management",
    "Schedule & Timetable",
    "Notice & Communication",
    "Embeddable Form Builder",
    "Test Management",
    "Connect Suite",
    "Multi-Branch Management",
  ];

  const erpModuleList = [
    "Attendance Management",
    "Learning Material",
    "Syllabus Coverage",
    "LMS",
    "Outcome Based Education (OBE)",
    "Online Examination",
    "Examination Management",
    "Result Analysis",
    "Report Card",
    "Entrance Examination",
    "Student Information",
    "Student Portal",
    "ID Card Generator",
    "Document Management",
    "Feedback Management",
    "Fees Collection",
    "Account Management",
    "Faculty Information",
    "Recruitment Management",
    "Leave Management",
    "Payroll Management",
    "Administrative Office",
    "E-Notice System",
    "Store Management",
    "Online Admission",
    "Website Management",
    "Hostel Management",
    "Transport Management",
    "Library Management",
    "Alumni Portal",
    "Training & Placement",
    "Dashboard Analytics",
    "NAAC & NBA Support",
    "AI Reports",
    "API & Data Backup",
  ];

  const hrmModuleList = [
    "Employee Information",
    "Attendance & Shifts",
    "Leave Management",
    "Payroll & Salary",
    "Expense & Reimbursement",
    "Recruitment & Onboarding",
    "Performance Reviews",
    "Compliance & Documents",
  ];

  const currentModuleList =
    selectedProduct === "Academy"
      ? academyModuleList
      : selectedProduct === "ERP"
      ? erpModuleList
      : hrmModuleList;

  const toggleModule = (mod: string) => {
    if (selectedModules.includes(mod)) {
      setSelectedModules(selectedModules.filter((m) => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const handleSelectAll = () => {
    setSelectedModules([...currentModuleList]);
  };

  const handleClear = () => {
    setSelectedModules([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <section id="quote" className="py-24 bg-[#070B14] relative overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E9A2E]/10 border border-[#5E9A2E]/30 text-xs font-bold text-[#74B53C] tracking-wider uppercase">
            <Calculator className="w-3.5 h-3.5" />
            CUSTOM QUOTATION BUILDER
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Tell us what you need, we&apos;ll do the rest
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Pick the product, choose the modules you&apos;re interested in, and share your details. Our team prepares a tailored quote and connects with you — no fixed plans, no fine print.
          </p>
        </div>

        {/* Main Quote Container */}
        <div className="p-6 sm:p-8 lg:p-10 rounded-3xl glass-panel border border-white/15 shadow-2xl">
          
          {/* Top Product Selector Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between pb-8 border-b border-white/10 gap-4">
            <div className="text-sm font-bold text-slate-300">1. Select Product:</div>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct("Academy");
                  setSelectedModules([]);
                }}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedProduct === "Academy"
                    ? "bg-[#5E9A2E] text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AuraEdu Academy
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct("ERP");
                  setSelectedModules([]);
                }}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedProduct === "ERP"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AuraEdu ERP
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedProduct("HRM");
                  setSelectedModules([]);
                }}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                  selectedProduct === "HRM"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AuraEdu HRM
                <span className="text-[9px] bg-purple-400/20 text-purple-300 px-1 rounded uppercase">Soon</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Interactive Checkbox Selector */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">
                    2. Choose Modules for <span className="text-[#74B53C]">AuraEdu {selectedProduct}</span>:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs font-semibold text-[#74B53C] hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Module Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                  {currentModuleList.map((mod) => {
                    const isChecked = selectedModules.includes(mod);
                    return (
                      <div
                        key={mod}
                        onClick={() => toggleModule(mod)}
                        className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-2.5 ${
                          isChecked
                            ? "bg-[#5E9A2E]/15 border-[#5E9A2E] text-white"
                            : "bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/20"
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#74B53C] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 shrink-0" />
                        )}
                        <span className="truncate">{mod}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Scale & Hosting Inputs Box */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Scale & hosting parameters (Optional)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Branches */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#74B53C]" />
                        Campuses / Branches
                      </label>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setBranches(Math.max(1, branches - 1))}
                          className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold hover:bg-white/20"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-white font-mono text-sm">{branches}</span>
                        <button
                          type="button"
                          onClick={() => setBranches(branches + 1)}
                          className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold hover:bg-white/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Student count */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        Student count
                      </label>
                      <select
                        value={studentCount}
                        onChange={(e) => setStudentCount(e.target.value)}
                        className="w-full bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="Up to 500 students" className="bg-slate-900">Up to 500 students</option>
                        <option value="501 – 1,000 students" className="bg-slate-900">501 – 1,000 students</option>
                        <option value="1,001 – 2,000 students" className="bg-slate-900">1,001 – 2,000 students</option>
                        <option value="2,001 – 5,000 students" className="bg-slate-900">2,001 – 5,000 students</option>
                        <option value="5,000+ students" className="bg-slate-900">5,000+ students</option>
                      </select>
                    </div>

                    {/* Server hosting */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Server className="w-3.5 h-3.5 text-purple-400" />
                        Server / Hosting
                      </label>
                      <select
                        value={serverHosting}
                        onChange={(e) => setServerHosting(e.target.value)}
                        className="w-full bg-transparent text-white text-xs font-semibold outline-none cursor-pointer"
                      >
                        <option value="Shared Server (recommended)" className="bg-slate-900">Shared Server</option>
                        <option value="Dedicated Server" className="bg-slate-900">Dedicated Server</option>
                        <option value="On-premise / Self-hosted" className="bg-slate-900">On-premise</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Contact Details Form */}
              <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-4">
                    3. REQUEST A QUOTE — Where can our team reach you?
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Organisation *
                      </label>
                      <input
                        type="text"
                        required
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder="Institution / academy name"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Contact person *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          City / State
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Pune, MH"
                          className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Message (optional)
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Anything else we should know?"
                        className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-[#74B53C] outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action Box */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="text-xs text-slate-400 flex items-center justify-between font-mono">
                    <span>Selected: AuraEdu {selectedProduct}</span>
                    <span className="text-[#74B53C] font-bold">{selectedModules.length} modules chosen</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white text-base font-bold shadow-xl shadow-[#5E9A2E]/30 hover:shadow-[#5E9A2E]/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit enquiry</span>
                  </button>

                  {submitted && (
                    <div className="p-4 rounded-xl bg-[#5E9A2E]/20 border border-[#5E9A2E] text-white text-xs font-semibold animate-in fade-in duration-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#74B53C] shrink-0" />
                      <span>Thank you! Your quotation enquiry has been submitted. Our sales engineering team in Pune will contact you shortly.</span>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </form>
        </div>

      </div>
    </section>
  );
}

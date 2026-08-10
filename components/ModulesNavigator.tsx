"use client";

import { useState } from "react";
import { GraduationCap, Building, Users, CheckCircle2, ArrowRight, Layers, Lock, Sparkles, Filter } from "lucide-react";

export default function ModulesNavigator() {
  const [activeMainTab, setActiveMainTab] = useState<"academy" | "erp" | "hrm">("academy");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Academy Modules Data (22)
  const academyModules = [
    { name: "Student Management", category: "Students", desc: "Complete student lifecycle, profiles, documents & records" },
    { name: "Staff Management", category: "Admin", desc: "Faculty records, roles, access permissions & duty rosters" },
    { name: "Course Management", category: "Academics", desc: "Subjects, syllabi, study materials & batch allocations" },
    { name: "Attendance Management", category: "Academics", desc: "Biometric, manual & QR-code student/staff attendance" },
    { name: "Batch Management", category: "Academics", desc: "Cohort scheduling, student capacity & timing slots" },
    { name: "Assignment Management", category: "Academics", desc: "Homework uploading, online submissions & grading" },
    { name: "Certificate Generator", category: "Academics", desc: "Automated custom course completion certificates" },
    { name: "Salary & Payroll", category: "Accounts", desc: "Staff compensation, monthly pay slips & deductions" },
    { name: "Leave Management", category: "Admin", desc: "Leave requests, approvals & leave balance tracking" },
    { name: "Internal Task Manager", category: "Admin", desc: "Assign staff duties, deadlines & status updates" },
    { name: "Analytical Reports", category: "Admin", desc: "Real-time analytics on attendance, fees & growth" },
    { name: "Lead Management + Auto Conversion", category: "Students", desc: "Enquiry pipeline to active student automated flow" },
    { name: "Self-Purchase Enrolment", category: "Students", desc: "Online checkout for students to buy courses directly" },
    { name: "Online Admissions", category: "Students", desc: "Custom admission forms & document submission" },
    { name: "Fees Collection", category: "Accounts", desc: "Online payments, fee schedules, receipts & dues" },
    { name: "Accounts Management", category: "Accounts", desc: "Income, expenses, ledger accounts & cashflow" },
    { name: "Schedule & Timetable", category: "Academics", desc: "Routine manager with teacher availability checks" },
    { name: "Notice & Communication", category: "Communication", desc: "SMS, Email & Push notification announcements" },
    { name: "Embeddable Form Builder", category: "Communication", desc: "Build Google-Form style surveys on your website" },
    { name: "Test Management (MCQ, Coding, Proctoring)", category: "Academics", desc: "Online exams with proctoring & instant results" },
    { name: "Connect Suite (WhatsApp / Zoom / Live Classes)", category: "Communication", desc: "Live class integrations & WhatsApp notifications" },
    { name: "Multi-Branch Management", category: "Admin", desc: "Centralized dashboard for multi-location operations" },
  ];

  // ERP Modules Data (47)
  const erpModules = [
    { name: "Attendance Management", category: "Academic", desc: "Campus-wide automated attendance tracking" },
    { name: "Learning Material", category: "Academic", desc: "Digital resource repository for lectures & notes" },
    { name: "Syllabus Coverage", category: "Academic", desc: "Track curriculum completion across departments" },
    { name: "Teacher Guardian", category: "Academic", desc: "Mentorship & student guidance system" },
    { name: "Learning Management System (LMS)", category: "Academic", desc: "Full online learning environment & video modules" },
    { name: "Outcome Based Education (OBE)", category: "Academic", desc: "NAAC/NBA compliant learning outcome tracking" },
    
    { name: "Online Examination", category: "Examination", desc: "Secure online testing engine with proctoring" },
    { name: "Examination Management", category: "Examination", desc: "Exam schedules, hall tickets & seating plans" },
    { name: "Result Analysis", category: "Examination", desc: "Grade distributions, rank lists & performance charts" },
    { name: "Report Card", category: "Examination", desc: "Automated transcript & mark sheet generation" },
    { name: "Entrance Examination", category: "Examination", desc: "Candidate screening & merit list calculation" },

    { name: "Student Information", category: "Student", desc: "360-degree student database & academic history" },
    { name: "Student Portal", category: "Student", desc: "Self-service web dashboard for enrolled students" },
    { name: "Student Login Portal", category: "Student", desc: "Secure multi-factor authentication login" },
    { name: "ID Card Generator", category: "Student", desc: "Instant printable smart ID cards with barcode/QR" },
    { name: "Document Management", category: "Student", desc: "Digital verification vault for student records" },
    { name: "Feedback Management", category: "Student", desc: "Course & faculty evaluation surveys" },
    { name: "Grievance Redressal", category: "Student", desc: "Official student complaint resolution portal" },
    { name: "Suggestions Management", category: "Student", desc: "Campus improvement feedback loop" },

    { name: "Fees Collection", category: "Accounts", desc: "Tuition, hostel, transport & exam fee gateway" },
    { name: "Account Management", category: "Accounts", desc: "Financial accounting, balance sheets & audits" },

    { name: "Faculty Information", category: "Human Resource", desc: "Academic staff profiles, research & tenure" },
    { name: "Recruitment Management", category: "Human Resource", desc: "Applicant tracking & faculty hiring flow" },
    { name: "Leave Management", category: "Human Resource", desc: "Faculty vacation & sabbatical workflow" },
    { name: "Payroll Management", category: "Human Resource", desc: "Salary calculation with tax compliance" },
    { name: "Work Compliance", category: "Human Resource", desc: "Regulatory workforce documentation" },

    { name: "Administrative Office", category: "Administration", desc: "General administrative workflow automation" },
    { name: "E-Notice System", category: "Administration", desc: "Digital notice board & campus circulars" },
    { name: "System Administrator", category: "Administration", desc: "Role-based security & audit logs" },
    { name: "Authority Portal", category: "Administration", desc: "Executive dashboard for Deans & Principals" },

    { name: "Store Management", category: "Purchase", desc: "Inventory, stock purchase & requisition control" },
    { name: "Online Admission", category: "Admission", desc: "End-to-end applicant portal & fee payment" },
    { name: "Website Management", category: "Website", desc: "Integrated CMS for institution main site" },

    { name: "Hostel Management", category: "Other", desc: "Room allocation, mess bills & warden logs" },
    { name: "Transport Management", category: "Other", desc: "Fleet routes, vehicle tracking & bus fees" },
    { name: "Library Management", category: "Other", desc: "Book circulation, fines & digital catalog" },
    { name: "Alumni Information", category: "Other", desc: "Graduate network directory & history" },
    { name: "Alumni Portal", category: "Other", desc: "Alumni events, donations & career network" },
    { name: "Training and Placement", category: "Other", desc: "Corporate recruitment drives & interview schedules" },

    { name: "Dashboard Analytics", category: "Smart Add-Ons", desc: "Executive KPI visual widgets" },
    { name: "SMS Integration", category: "Smart Add-Ons", desc: "Automated SMS alerts for attendance/dues" },
    { name: "Email Notifications", category: "Smart Add-Ons", desc: "Transactional & broadcast email alerts" },
    { name: "Mobile App", category: "Smart Add-Ons", desc: "iOS & Android branded campus app" },
    { name: "Role-Based Access", category: "Smart Add-Ons", desc: "Granular permissions for every staff role" },
    { name: "NAAC & NBA Support", category: "Smart Add-Ons", desc: "Accreditation data compilation tools" },
    { name: "AI Reports", category: "Smart Add-Ons", desc: "AI-assisted performance forecasting" },
    { name: "API & Data Backup", category: "Smart Add-Ons", desc: "Automated daily cloud backups & REST APIs" },
  ];

  // HRM Modules Data (8)
  const hrmModules = [
    { name: "Employee Information", category: "Core HR", desc: "Centralized employee database, contracts & files" },
    { name: "Attendance & Shifts", category: "Core HR", desc: "Shift scheduling, biometric clock-in & overtime" },
    { name: "Leave Management", category: "Core HR", desc: "Time-off rules, approvals & holiday calendars" },
    { name: "Payroll & Salary", category: "Payroll", desc: "Automated payslip generation & direct bank transfer" },
    { name: "Expense & Reimbursement", category: "Payroll", desc: "Claim submission, receipt audit & payout" },
    { name: "Recruitment & Onboarding", category: "Talent", desc: "Job requisitions, resume screening & onboarding checklist" },
    { name: "Performance Reviews", category: "Talent", desc: "KPI tracking, appraisal forms & 360 feedback" },
    { name: "Compliance & Documents", category: "Talent", desc: "PF, ESI, tax filings & legal HR compliance" },
  ];

  // Helper getters
  const currentModules =
    activeMainTab === "academy"
      ? academyModules
      : activeMainTab === "erp"
      ? erpModules
      : hrmModules;

  const categories = ["All", ...Array.from(new Set(currentModules.map((m) => m.category)))];

  const filteredModules =
    activeCategory === "All"
      ? currentModules
      : currentModules.filter((m) => m.category === activeCategory);

  return (
    <section id="modules" className="py-24 bg-[#05080E] relative border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            PRODUCT CAPABILITIES
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Everything your institution manages
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Select a product tier to explore all specialized software modules available.
          </p>
        </div>

        {/* Main Product Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="p-1.5 rounded-2xl glass-panel border border-white/10 flex flex-wrap gap-2 max-w-3xl w-full justify-center">
            
            <button
              onClick={() => {
                setActiveMainTab("academy");
                setActiveCategory("All");
              }}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                activeMainTab === "academy"
                  ? "bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white shadow-lg shadow-[#5E9A2E]/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>MyEdou Academy</span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">22</span>
            </button>

            <button
              onClick={() => {
                setActiveMainTab("erp");
                setActiveCategory("All");
              }}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                activeMainTab === "erp"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building className="w-5 h-5" />
              <span>MyEdou ERP</span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">47</span>
            </button>

            <button
              onClick={() => {
                setActiveMainTab("hrm");
                setActiveCategory("All");
              }}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all ${
                activeMainTab === "hrm"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>MyEdou HRM</span>
              <span className="text-xs bg-purple-400/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded uppercase text-[10px]">
                Soon
              </span>
            </button>

          </div>
        </div>

        {/* HRM Preview Banner */}
        {activeMainTab === "hrm" && (
          <div className="mb-8 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-purple-200 text-sm">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>
                <strong>MyEdou HRM is launching soon.</strong> Here&apos;s a preview of what&apos;s coming. Want early access?
              </span>
            </div>
            <a href="#quote" className="font-bold underline hover:text-white text-purple-300">
              Request Early Access &rarr;
            </a>
          </div>
        )}

        {/* Category Sub-Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono uppercase tracking-wider pl-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-white text-slate-900 shadow-md font-bold"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel border border-white/10 hover:border-[#5E9A2E]/40 transition-all duration-200 hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:border-[#5E9A2E]/30 group-hover:text-[#74B53C]">
                  {item.category}
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#74B53C] opacity-70 group-hover:opacity-100" />
              </div>
              <h4 className="font-bold text-white text-base mb-1.5 group-hover:text-[#74B53C] transition-colors">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

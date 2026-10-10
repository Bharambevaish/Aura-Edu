"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is MyEdou and who is it for?",
      a: "MyEdou is a family of education-management products from Codeserve Tech Solutions. MyEdou Academy runs coaching classes, tuition centres and multi-branch academies; MyEdou ERP is a complete institution ERP for schools, colleges and universities; and MyEdou HRM (launching soon) handles HR, payroll and workforce management. Each comes with a web portal and a mobile app.",
    },
    {
      q: "Which MyEdou product is right for me?",
      a: "Choose MyEdou Academy if you run a coaching centre, tuition class or academy and need students, batches, attendance, fees and an app. Choose MyEdou ERP if you run a school, college or university and need admissions, examinations, hostel, transport, library, accounts and HR on one campus-wide platform. MyEdou HRM is launching soon for dedicated HR, payroll and recruitment. Not sure? Use Get Quotation and we'll recommend the right fit.",
    },
    {
      q: "How is MyEdou priced?",
      a: "There are no fixed public plans — pricing is tailored to each institution's size, the product you need and the modules you choose. Pick a product, select the modules you're interested in on the Get Quotation form, share your details, and our team prepares a custom quote and connects with you.",
    },
    {
      q: "Does MyEdou support multiple branches and campuses?",
      a: "Yes. MyEdou is multi-branch and multi-campus from day one — run any number of branches or campuses from one dashboard, keep each unit's students, staff and accounts cleanly separated, and roll figures up to a single head-office view. Branch-level permissions and reports work out of the box.",
    },
    {
      q: "How does MyEdou handle admissions and leads?",
      a: "Captured enquiries can be auto-converted into active students with no manual re-entry or duplicate records. Online admissions, self-purchase enrolment via secure checkout, and embeddable forms on your own domain feed into the same inbox, so the path from enquiry to enrolled student is end-to-end across Academy and ERP.",
    },
    {
      q: "Is there a mobile app for students and parents?",
      a: "Yes. MyEdou ships a mobile app for students (and parents on ERP) so they can view schedule, attendance, fees, assignments, examinations, results, certificates and notifications — the same data as the web portal, on every screen.",
    },
    {
      q: "What does MyEdou ERP manage for schools, colleges and universities?",
      a: "MyEdou ERP covers the whole campus across 40+ modules: academics and LMS, online examinations and result analysis, student information and portals, online admissions, fees and accounts, HR and payroll, administration, hostel, transport, library, alumni and training & placement, plus smart add-ons like dashboard analytics, NAAC & NBA support and AI reports.",
    },
    {
      q: "How quickly can we go live on MyEdou?",
      a: "Most institutions go live quickly. Pick your product and modules, import your existing student or staff list (we offer a Data Migration option if you prefer it done for you), and your branded subdomain (or custom domain) is ready. On-site training is available on request.",
    },
    {
      q: "Is my data secure?",
      a: "MyEdou is cloud-hosted with role-based access, branch-scoped permissions, encrypted PII for finance records and an audit trail of every change. Codeserve Tech Solutions ships tests and monitoring with every feature, plus API access and data backup.",
    },
    {
      q: "Who builds and supports MyEdou?",
      a: "MyEdou is built and operated by Codeserve Tech Solutions, a product engineering team in Pune. You get a named engineering team, ongoing updates and dedicated support across all MyEdou products — not a faceless reseller.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#070B14] relative border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400 tracking-wider uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Questions institutions ask us
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Quick answers on our products, pricing, multi-branch & campus setup, admissions, the mobile app, security and onboarding.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-bold text-white flex items-center gap-3">
                    <span className="text-xs font-mono text-[#74B53C] bg-[#5E9A2E]/20 px-2.5 py-1 rounded-md">
                      0{idx + 1}
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#74B53C] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

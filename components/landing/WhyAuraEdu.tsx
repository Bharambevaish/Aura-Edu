"use client";

import { Building2, UserPlus, ShoppingBag, FormInput, CheckSquare, Calculator, Sparkles, ArrowUpRight } from "lucide-react";

export default function WhyAuraEdu() {
  const features = [
    {
      num: "01",
      title: "Multi-Branch Control",
      desc: "Run unlimited branches from one dashboard. Centralise students, staff, courses and accounts while keeping each branch's data clean and separable.",
      icon: Building2,
      color: "from-emerald-500/20 to-[#5E9A2E]/20 text-[#74B53C]",
    },
    {
      num: "02",
      title: "Automatic Lead Conversion",
      desc: "Capture enquiries and auto-convert a qualified lead into an active student — no manual re-entry, no duplicate records.",
      icon: UserPlus,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-400",
    },
    {
      num: "03",
      title: "Self-Purchase Enrolment",
      desc: "Students browse and buy courses through secure checkout. Seats, batches and receipts are assigned the moment payment clears.",
      icon: ShoppingBag,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400",
    },
    {
      num: "04",
      title: "Embeddable Form System",
      desc: "A Google-Forms-style builder inside the portal. Publish on your own domain and have responses flow straight into AuraEdu.",
      icon: FormInput,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400",
    },
    {
      num: "05",
      title: "Internal Task Manager",
      desc: "Assign, track and close tasks across the team — without spreadsheets, sticky notes, or chat threads.",
      icon: CheckSquare,
      color: "from-indigo-500/20 to-violet-500/20 text-indigo-400",
    },
    {
      num: "06",
      title: "Accounts & Payroll",
      desc: "Fees, salaries, leave and payroll in one place — with reports that turn daily activity into clear decisions.",
      icon: Calculator,
      color: "from-teal-500/20 to-emerald-500/20 text-teal-400",
    },
  ];

  return (
    <section id="why-auraedu" className="py-24 bg-[#070B14] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#5E9A2E]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5E9A2E]/10 border border-[#5E9A2E]/30 text-xs font-bold text-[#74B53C] tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            WHY AURAEDU
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            One platform for everything an academy runs on
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            The capabilities operators tell us pay for the platform on day one.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl glass-panel border border-white/10 hover:border-[#5E9A2E]/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#5E9A2E]/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-2xl font-extrabold font-mono text-slate-600 group-hover:text-[#74B53C] transition-colors">
                      {item.num}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#74B53C] transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-slate-400 group-hover:text-[#74B53C] transition-colors">
                  <span>Explore Workflow</span>
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

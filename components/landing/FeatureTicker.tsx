"use client";

import { Check, Sparkles, Building2, Users, Rocket, Calendar } from "lucide-react";

export default function FeatureTicker() {
  const tickerItems = [
    "Android student app",
    "Admissions",
    "Attendance",
    "Fees Collection",
    "Assessments",
    "Certificates",
    "Live Classes",
    "312 tasks today",
    "24 cohorts live",
    "86% avg attendance",
    "Auto Lead → Student",
    "Forms publish on your domain",
  ];

  const stats = [
    { label: "Products Launched", value: "7", icon: Rocket, detail: "Operating across web & mobile" },
    { label: "Team Members", value: "27+", icon: Users, detail: "Engineers & domain specialists" },
    { label: "Engagements Shipped", value: "40+", icon: Building2, detail: "Deployments nationwide" },
    { label: "Founded in Pune", value: "2025", icon: Calendar, detail: "Codeserve Tech Solutions" },
  ];

  return (
    <section className="relative bg-[#070B14] py-10 overflow-hidden border-y border-white/10">
      {/* Infinite Ticker Marquee */}
      <div className="relative w-full overflow-hidden bg-slate-900/60 backdrop-blur-md py-4 mb-12 border-y border-white/5">
        <div className="flex animate-marquee space-x-8">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-300 whitespace-nowrap bg-white/5 px-4 py-1.5 rounded-full border border-white/10"
            >
              <span className="w-2 h-2 rounded-full bg-[#74B53C]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl glass-panel border border-white/10 hover:border-[#5E9A2E]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#5E9A2E]/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5E9A2E]/10 text-[#74B53C] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Metric</span>
                </div>
                <div className="text-4xl font-extrabold text-white tracking-tight group-hover:text-[#74B53C] transition-colors">
                  {stat.value}
                </div>
                <div className="text-base font-bold text-slate-200 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.detail}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

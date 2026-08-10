"use client";

import { Code2, Cpu, Smartphone, Rocket, Globe, Palette, Cloud, CheckCircle, ExternalLink, Sparkles } from "lucide-react";

export default function CodeserveAbout() {
  const services = [
    { title: "Custom Software Engineering", icon: Code2 },
    { title: "Cloud & DevOps", icon: Cloud },
    { title: "Mobile Apps (React Native)", icon: Smartphone },
    { title: "Product Engineering & MVPs", icon: Rocket },
    { title: "Web Development", icon: Globe },
    { title: "UI/UX & Product Design", icon: Palette },
    { title: "SaaS Development", icon: Cpu },
    { title: "IT Consulting", icon: Sparkles },
  ];

  const values = [
    "A named engineering team behind your product",
    "Cloud-hosted, secure, built to scale",
    "Tests & monitoring shipped with every feature",
    "Transparent scope & dependable delivery",
    "Ongoing updates & dedicated support",
  ];

  return (
    <section id="about" className="py-24 bg-[#05080E] relative border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-[#74B53C] tracking-wider uppercase">
            <Code2 className="w-3.5 h-3.5" />
            ENGINEERING TEAM
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Built by Codeserve Tech Solutions
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            A product engineering team in Pune that ships software end-to-end — from cloud infrastructure to mobile apps. MyEdou is one of seven products we run and operate ourselves.
          </p>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Services Column */}
          <div className="lg:col-span-6 p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-mono font-bold text-[#74B53C] uppercase tracking-widest mb-2">
                WHAT WE DO
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-6">
                End-to-End Product Engineering Services
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-3 text-xs font-semibold text-slate-200 hover:border-[#5E9A2E]/40 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-[#5E9A2E]/15 text-[#74B53C]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">Headquartered in Pune, MH</span>
              <a
                href="https://www.codeservetech.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#74B53C] hover:underline flex items-center gap-1"
              >
                Visit codeservetech.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Long Term Partner Column */}
          <div className="lg:col-span-6 p-8 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-2">
                WHY ACADEMIES CHOOSE US
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-6">
                A Long-Term Engineering Partner
              </h3>

              <div className="space-y-4">
                {values.map((val, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                    <CheckCircle className="w-5 h-5 text-[#74B53C] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200 font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5E9A2E]/20 to-blue-900/20 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Direct Engineering Support</div>
                <div className="text-xs text-slate-400">No faceless call centers or resellers</div>
              </div>
              <a
                href="#contact"
                className="px-4 py-2 rounded-xl bg-[#5E9A2E] text-white text-xs font-bold shadow-md hover:bg-[#74B53C] transition-colors"
              >
                Contact Team
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

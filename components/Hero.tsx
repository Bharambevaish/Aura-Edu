"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Smartphone, Laptop, Users, Award, Sparkles, Activity } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden bg-[#070B14]">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1px]"
        >
          <source src="/videos/laptop-learning.mp4" type="video/mp4" />
        </video>
        {/* Gradients to blend seamless dark look */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#070B14]/80 to-[#070B14]/90" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#070B14]/60 to-[#070B14]" />
        
        {/* Emerald ambient light glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5E9A2E]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-[#74B53C]/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Call to Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
            
            {/* Top Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#5E9A2E]/30 text-xs font-semibold text-[#74B53C] animate-in fade-in slide-in-from-bottom-3 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-[#74B53C]" />
              <span>Academy · ERP · HRM · All-In-One Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Run your entire institution on{" "}
              <span className="bg-gradient-to-r from-[#5E9A2E] via-[#74B53C] to-emerald-300 bg-clip-text text-transparent underline decoration-[#5E9A2E]/40 underline-offset-8">
                one platform.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl">
              From coaching academies to schools, colleges and universities — manage admissions, students, staff, attendance, examinations, fees, accounts and payroll. Three products, MyEdou Academy, ERP and HRM, with web portals and a mobile app.
            </p>

            {/* Quick feature highlights */}
            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#74B53C]" />
                <span>Multi-campus control</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#74B53C]" />
                <span>Web portal + mobile app</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#74B53C]" />
                <span>No per-user lockins</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#quote"
                className="flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white text-base font-bold shadow-xl shadow-[#5E9A2E]/30 hover:shadow-[#5E9A2E]/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Get Quotation</span>
                <ArrowRight className="w-5 h-5" />
              </a>

              <Link
                href="/login-selector"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-base font-semibold backdrop-blur-md transition-all"
              >
                <span>Login</span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300">v2.3</span>
              </Link>
            </div>

            {/* Target Audience Pills */}
            <div className="pt-4 border-t border-white/10 w-full flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Built for:</span>
              <span className="px-3 py-1 rounded-full bg-[#5E9A2E]/10 border border-[#5E9A2E]/20 text-[#74B53C]">
                Coaching & Academies
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                Schools
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                Colleges & Universities
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                Go live within minutes
              </span>
            </div>

          </div>

          {/* Right Column: Dynamic Glassmorphic Graphic Architecture Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-lg">
              
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5E9A2E] to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-100 transition duration-1000"></div>

              {/* Main Container Card */}
              <div className="relative p-6 rounded-3xl glass-panel border border-white/15 shadow-2xl space-y-6">
                
                {/* Header of graphic */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#74B53C] animate-pulse" />
                    myedou.com system portal
                  </div>
                </div>

                {/* Architecture Nodes Grid */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Node 1: Admin Dashboard */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-[#5E9A2E]/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-[#5E9A2E]/20 text-[#74B53C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Admin Dashboard</h4>
                    <p className="text-xs text-slate-400 mt-1">Web portal control center with real-time analytics</p>
                  </div>

                  {/* Node 2: Teacher Workspace */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-blue-500/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Teacher Workspace</h4>
                    <p className="text-xs text-slate-400 mt-1">Exams, tasks, timetable & batch logs</p>
                  </div>

                  {/* Node 3: Student Mobile App */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-500/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Student App</h4>
                    <p className="text-xs text-slate-400 mt-1">Android portal, live classes & fees</p>
                  </div>

                  {/* Node 4: Parent Connect */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-amber-500/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Parent Connect</h4>
                    <p className="text-xs text-slate-400 mt-1">Automated attendance & report cards</p>
                  </div>

                </div>

                {/* Central System Engine bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#5E9A2E]/20 via-slate-800 to-blue-900/20 border border-white/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#5E9A2E] text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Connected Web Platform</div>
                      <div className="text-[11px] text-slate-400">Core Engine · Academy + ERP + HRM</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-[#5E9A2E]/30 text-[#74B53C] px-2.5 py-1 rounded-full font-bold">
                    99.9% UPTIME
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

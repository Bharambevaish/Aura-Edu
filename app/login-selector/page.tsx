"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, UserPlus, ShieldCheck, ArrowLeft, Lock, CheckCircle2, User, KeyRound } from "lucide-react";

export default function LoginSelectorPage() {
  const [activeTab, setActiveTab] = useState<"student" | "register" | "admin" | "staff">("student");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [qualification, setQualification] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(`Successfully authenticated into ${activeTab.toUpperCase()} portal! (Demo Mode)`);
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background radial lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5E9A2E]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Row */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <ArrowLeft className="w-4 h-4 text-[#74B53C]" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5E9A2E] to-[#74B53C] flex items-center justify-center font-extrabold text-white">
            E
          </div>
          <span className="font-bold text-lg text-white">MyEdou Portals</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10 z-10 w-full">
        
        {/* Title */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E9A2E]/10 text-[#74B53C] text-xs font-mono font-bold">
            v2.3 Portal Authentication
          </div>
          <h1 className="text-4xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-sm text-slate-400">Select your portal role to continue to your dashboard</p>
        </div>

        {/* Portal Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Card 1: Student Login */}
          <div
            onClick={() => setActiveTab("student")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === "student"
                ? "bg-[#5E9A2E]/20 border-[#5E9A2E] shadow-xl shadow-[#5E9A2E]/10"
                : "glass-panel border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#5E9A2E]/20 text-[#74B53C] flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Student Sign In</h3>
            <p className="text-xs text-slate-400 mt-1">Access your courses & learning dashboard</p>
          </div>

          {/* Card 2: New Student Registration */}
          <div
            onClick={() => setActiveTab("register")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === "register"
                ? "bg-blue-500/20 border-blue-500 shadow-xl shadow-blue-500/10"
                : "glass-panel border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">New Student?</h3>
            <p className="text-xs text-slate-400 mt-1">Register for temporary password & onboarding</p>
          </div>

          {/* Card 3: Admin / Staff Panel */}
          <div
            onClick={() => setActiveTab("admin")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              activeTab === "admin" || activeTab === "staff"
                ? "bg-purple-500/20 border-purple-500 shadow-xl shadow-purple-500/10"
                : "glass-panel border-white/10 hover:border-white/20"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Admin / Staff Panel</h3>
            <p className="text-xs text-slate-400 mt-1">Manage students, courses & system modules</p>
          </div>

        </div>

        {/* Form Container Card */}
        <div className="p-8 rounded-3xl glass-panel border border-white/15 shadow-2xl max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Student Login Form */}
            {activeTab === "student" && (
              <>
                <div className="text-center pb-2 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#74B53C]" />
                    Student Sign In
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-[#74B53C]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <a href="#" className="text-xs text-[#74B53C] hover:underline">Forgot Password?</a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-[#74B53C]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white font-bold text-sm shadow-lg shadow-[#5E9A2E]/30 hover:scale-[1.01] transition-all"
                >
                  Login as Student
                </button>
              </>
            )}

            {/* Registration Form */}
            {activeTab === "register" && (
              <>
                <div className="text-center pb-2 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    New Student Registration
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="Class 12th / BE / BSc"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:scale-[1.01] transition-all"
                >
                  Register Account
                </button>
              </>
            )}

            {/* Admin / Staff Login Form */}
            {(activeTab === "admin" || activeTab === "staff") && (
              <>
                <div className="text-center pb-2 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    {activeTab === "admin" ? "Admin Panel Login" : "Staff Portal Login"}
                  </h2>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab("admin")}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        activeTab === "admin" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("staff")}
                      className={`px-2.5 py-1 rounded-md font-semibold ${
                        activeTab === "staff" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Staff
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {activeTab === "admin" ? "Admin Email" : "Username or Staff Email"}
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === "admin" ? "admin@myedou.com" : "staff_username"}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <a href="#" className="text-xs text-purple-400 hover:underline">Forgot Password?</a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all ${
                    activeTab === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-500/30"
                  }`}
                >
                  {activeTab === "admin" ? "Login as System Admin" : "Login as Staff Member"}
                </button>
              </>
            )}

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        © 2026 Codeserve Tech Solutions · Secured by MyEdou Identity Auth Engine
      </footer>
    </div>
  );
}

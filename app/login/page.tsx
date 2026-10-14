"use client";

/**
 * Login screen — the only gate into the portals.
 *
 * Submits to the `login` server action (Auth.js Credentials underneath), which
 * revalidates + rate-limits every attempt. The one-click demo buttons below
 * simply pre-fill the exact same form → same server action (kept public for
 * demo-day wow; note: that inherently means these demo credentials are public
 * by design).
 */
import { Suspense, useState, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, ShieldCheck, ArrowLeft, AlertCircle, LogIn } from "lucide-react";
import { login } from "@/lib/actions/auth";

const DEMO_LOGINS = {
  student: { email: "student@demo.auraedu.com", password: "Student@123", label: "Explore as Student" },
  admin: { email: "admin@demo.auraedu.com", password: "Admin@123", label: "Explore as Admin" },
  staff: { email: "staff@demo.auraedu.com", password: "Staff@123", label: "Explore as Staff" },
} as const;

// useSearchParams() needs a Suspense boundary on a statically rendered page.
export default function LoginSelectorPage() {
  return (
    <Suspense>
      <LoginSelector />
    </Suspense>
  );
}

function LoginSelector() {
  const [activeTab, setActiveTab] = useState<"student" | "admin" | "staff">("student");
  const [state, formAction, pending] = useActionState(login, null);
  // Set by /session-ended after a block, force logout or expiry.
  const searchParams = useSearchParams();
  const sessionEnded = searchParams.get("reason") === "session-ended";
  // Where the proxy was sending the user; validated server-side in `login`.
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

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
          <span className="font-bold text-lg text-white">AuraEdu Portals</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-10 z-10 w-full">

        {/* Title */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5E9A2E]/10 text-[#74B53C] text-xs font-mono font-bold">
            v1.0 Demo Preview
          </div>
          <h1 className="text-4xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-sm text-slate-400">Select your portal role to continue to your dashboard</p>
        </div>

        {/* Portal Selector Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

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

          {/* Card 2: Admin / Staff Panel */}
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
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

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
                    name="email"
                    required
                    placeholder="student@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-[#74B53C]"
                  />
                  {state?.errors?.email && (
                    <p className="text-xs text-red-400 mt-1">{state.errors.email.join(", ")}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-500" title="Your institute can issue a new one-time password from Student Corner.">Forgot it? Ask your institute.</span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-[#74B53C]"
                  />
                  {state?.errors?.password && (
                    <p className="text-xs text-red-400 mt-1">{state.errors.password.join(", ")}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5E9A2E] to-[#74B53C] text-white font-bold text-sm shadow-lg shadow-[#5E9A2E]/30 hover:scale-[1.01] transition-all disabled:opacity-60"
                >
                  {pending ? "Signing in..." : "Login as Student"}
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
                    name="email"
                    required
                    placeholder={activeTab === "admin" ? "admin@demo.auraedu.com" : "staff@demo.auraedu.com"}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-400"
                  />
                  {state?.errors?.email && (
                    <p className="text-xs text-red-400 mt-1">{state.errors.email.join(", ")}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-500">Forgot it? Ask your system administrator.</span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-400"
                  />
                  {state?.errors?.password && (
                    <p className="text-xs text-red-400 mt-1">{state.errors.password.join(", ")}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-60 ${
                    activeTab === "admin"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30"
                      : "bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-500/30"
                  }`}
                >
                  {pending ? "Signing in..." : activeTab === "admin" ? "Login as System Admin" : "Login as Staff Member"}
                </button>
              </>
            )}

            {sessionEnded && !state?.message && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Your session has ended. Please sign in again.</span>
              </div>
            )}

            {state?.message && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{state.message}</span>
              </div>
            )}
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            New student?{" "}
            <Link href="/register" className="text-[#74B53C] font-semibold hover:underline">
              Apply for admission online
            </Link>
          </p>

          {/* One-click demo logins */}
          <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-mono text-center">One-click demo access</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(["student", "admin", "staff"] as const).map((role) => (
                <form key={role} action={formAction}>
                  <input type="hidden" name="callbackUrl" value={callbackUrl} />
                  <input type="hidden" name="email" value={DEMO_LOGINS[role].email} />
                  <input type="hidden" name="password" value={DEMO_LOGINS[role].password} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#74B53C]" />
                    {DEMO_LOGINS[role].label}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 z-10 border-t border-white/5">
        © 2026 AuraEdu · Demo Preview
      </footer>
    </div>
  );
}
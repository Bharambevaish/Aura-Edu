"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { logoutAction } from "@/lib/actions/auth";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export default function TopHeader({ onToggleSidebar }: TopHeaderProps) {
  const pathname = usePathname();
  const { profile, notifications, pendingFee } = useStudent();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifQuick, setShowNotifQuick] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBreadcrumbTitle = (path: string) => {
    if (path === "/student-portal") return "Dashboard Overview";
    if (path.includes("/notifications")) return "Notifications Hub";
    if (path.includes("/my-courses") && path.includes("/learn")) return "Course Video Player";
    if (path.includes("/my-courses")) return "My Enrolled Courses";
    if (path.includes("/course-store")) return "Course Center & Store";
    if (path.includes("/schedule")) return "Class Schedule & Timetable";
    if (path.includes("/attendance")) return "Attendance Center";
    if (path.includes("/assignments")) return "Assignments & Homework";
    if (path.includes("/tests")) return "Tests & Quizzes";
    if (path.includes("/test-card")) return "Academic Test Card";
    if (path.includes("/certificates")) return "Course Completion Certificates";
    if (path.includes("/fees")) return "Fees & Payment Receipts";
    if (path.includes("/profile")) return "Profile & Security";
    return "Student Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-800/80 bg-[#070B14]/90 px-4 md:px-8 backdrop-blur-xl">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-400 font-mono tracking-wider uppercase">
              STUDENT PORTAL
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-slate-400">{profile.batch}</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {getBreadcrumbTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Right side: Quick Search, Notifications, Version Badge, Profile */}
      <div className="flex items-center gap-3">
        {/* Version Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>v1.0 Demo</span>
        </div>

        {/* Fee Alert Quick Indicator */}
        {pendingFee > 0 && (
          <Link
            href="/student-portal/fees"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            <AlertCircle className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>Pending Fee: ₹{pendingFee.toLocaleString()}</span>
          </Link>
        )}

        {/* Notifications Quick Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifQuick(!showNotifQuick)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 ring-2 ring-[#070B14]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Quick Popup */}
          {showNotifQuick && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-400" /> Notifications ({unreadCount} unread)
                </h3>
                <Link
                  href="/student-portal/notifications"
                  onClick={() => setShowNotifQuick(false)}
                  className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  View All <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      item.read
                        ? "bg-slate-900/50 border-slate-800 text-slate-400"
                        : "bg-cyan-950/20 border-cyan-500/30 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-white mb-1">
                      <span className="truncate max-w-[200px]">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    </div>
                    <p className="line-clamp-2 text-slate-300">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm">
              {profile.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-white line-clamp-1">{profile.name}</p>
              <p className="text-[10px] text-cyan-400 font-mono">{profile.admissionNo}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
              <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                <p className="text-sm font-bold text-white">{profile.name}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{profile.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono">
                  <CheckCircle2 className="h-3 w-3" /> Course: {profile.course.split(" ")[0]}
                </div>
              </div>

              <Link
                href="/student-portal/profile/manage"
                onClick={() => setShowProfileDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="h-4 w-4 text-cyan-400" /> Manage Profile & Password
              </Link>
              <Link
                href="/student-portal/fees"
                onClick={() => setShowProfileDropdown(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <AlertCircle className="h-4 w-4 text-amber-400" /> Fee Allocation & Receipts
              </Link>

              <div className="my-1 border-t border-slate-800" />

              <form action={logoutAction}>
                <button type="submit" className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

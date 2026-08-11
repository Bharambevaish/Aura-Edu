"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import {
  LayoutDashboard,
  Bell,
  BookOpen,
  ShoppingBag,
  Calendar,
  Clock,
  FileCheck,
  GraduationCap,
  Award,
  FileText,
  CreditCard,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  alert?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, notifications } = useStudent();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navigationGroup: NavGroup[] = [
    {
      title: "CORE PORTAL",
      items: [
        { name: "Overview", href: "/student-dashboard", icon: LayoutDashboard },
        { name: "Notifications", href: "/student-dashboard/notifications", icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined },
      ],
    },
    {
      title: "ACADEMIC HUB",
      items: [
        { name: "My Courses", href: "/student-dashboard/my-courses", icon: BookOpen },
        { name: "Course Store", href: "/student-dashboard/course-store", icon: ShoppingBag },
        { name: "Class Schedule", href: "/student-dashboard/schedule", icon: Calendar },
        { name: "Attendance", href: "/student-dashboard/attendance", icon: Clock },
      ],
    },
    {
      title: "ASSESSMENTS & MARKS",
      items: [
        { name: "Assignments", href: "/student-dashboard/assignments", icon: FileCheck },
        { name: "Tests & Quizzes", href: "/student-dashboard/tests", icon: GraduationCap },
        { name: "Academic Test Card", href: "/student-dashboard/test-card", icon: FileText },
        { name: "Certificates", href: "/student-dashboard/certificates", icon: Award },
      ],
    },
    {
      title: "ACCOUNT & FINANCE",
      items: [
        { name: "Fees & Payments", href: "/student-dashboard/fees", icon: CreditCard, alert: true },
        { name: "Profile & Security", href: "/student-dashboard/profile/manage", icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-[#0B132B] border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between px-6 border-b border-slate-800/60">
          <Link href="/student-dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
                MyEdou<span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono">STUDENT</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Empowering Excellence</p>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Student Avatar Summary */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-inner">
              {profile.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#0B132B]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">{profile.name}</h4>
            <p className="text-xs text-cyan-400 font-mono truncate">{profile.admissionNo}</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navigationGroup.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <h5 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h5>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/student-dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-cyan-400 border border-cyan-500/30 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4.5 w-4.5 transition-colors ${
                            isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950 px-1.5">
                          {item.badge}
                        </span>
                      )}

                      {item.alert && (
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      )}

                      {isActive && item.badge === undefined && !item.alert && (
                        <ChevronRight className="h-4 w-4 text-cyan-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout CTA */}
        <div className="p-4 border-t border-slate-800/80">
          <Link
            href="/login-selector"
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4.5 w-4.5 text-rose-400" />
              <span>Log Out Portal</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 font-mono">EXIT</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

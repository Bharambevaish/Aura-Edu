"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutAction } from "@/lib/actions/auth";
import { canAccessPath } from "@/lib/permissions";
import type { Role } from "@/lib/models/User";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Target,
  FileText,
  CheckSquare,
  Receipt,
  Wallet,
  Users,
  Building2,
  PieChart,
  MessageSquare,
  Calendar,
  Megaphone,
  Settings,
  Shield,
  UserCircle,
  Menu,
  ChevronDown,
  LogOut,
  FolderKanban,
  Monitor,
  BarChart3,
  CreditCard,
  RotateCcw,
  Plus
} from 'lucide-react';

type NavItem = {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  {
    label: 'Overview',
    href: '/admin-dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'LMS Operations',
    icon: GraduationCap,
    children: [
      { label: 'Student Corner', href: '/admin-dashboard/lms/students', icon: Users },
      { label: 'Student Logins', href: '/admin-dashboard/lms/students/logins', icon: Monitor },
      { label: 'Test Management', href: '/admin-dashboard/lms/students/tests', icon: FileText },
      { label: 'Test Cards', href: '/admin-dashboard/lms/students/test-cards', icon: FileText },
      { label: 'Assignments', href: '/admin-dashboard/lms/students/assignments', icon: FileText },
      { label: 'Batches', href: '/admin-dashboard/lms/students/batches', icon: Users },
      { label: 'Attendance', href: '/admin-dashboard/lms/students/attendance', icon: CheckSquare },
      { label: 'Certificates', href: '/admin-dashboard/lms/students/certificates', icon: FileText },
      { label: 'Courses', href: '/admin-dashboard/lms/courses', icon: BookOpen },
      { label: 'Doubts Inbox', href: '/admin-dashboard/lms/doubts', icon: MessageSquare },
      { label: 'Datewise Schedule', href: '/admin-dashboard/lms/schedules/date-wise', icon: CalendarDays },
      { label: 'Batch Schedule', href: '/admin-dashboard/lms/schedules/batch', icon: Users },
      { label: 'All Leads', href: '/admin-dashboard/lms/leads', icon: Target },
      { label: 'All Forms', href: '/admin-dashboard/lms/forms', icon: FileText },
      { label: 'Create Form', href: '/admin-dashboard/lms/forms/create', icon: Plus },
      { label: 'Task Manager', href: '/admin-dashboard/lms/tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'Finance Operations',
    icon: Wallet,
    children: [
      { label: 'Expense Tracker', href: '/admin-dashboard/finance/expenses', icon: Receipt },
      { label: 'Approval Queue', href: '/admin-dashboard/finance/expense-approvals', icon: CheckSquare },
      { label: 'Vendors', href: '/admin-dashboard/finance/vendors', icon: Building2 },
      { label: 'Expense Categories', href: '/admin-dashboard/finance/expense-categories', icon: FileText },
      { label: 'Finance Overview', href: '/admin-dashboard/finance/overview', icon: BarChart3 },
      { label: 'Payments', href: '/admin-dashboard/finance/payments', icon: CreditCard },
      { label: 'Invoices', href: '/admin-dashboard/finance/invoices', icon: FileText },
      { label: 'Refunds', href: '/admin-dashboard/finance/refunds', icon: RotateCcw },
      { label: 'Waivers', href: '/admin-dashboard/finance/waivers', icon: FileText },
      { label: 'Audit Trail', href: '/admin-dashboard/finance/audit-trail', icon: Shield },
    ],
  },
  {
    label: 'Communications',
    icon: MessageSquare,
    children: [
      { label: 'Dashboard', href: '/admin-dashboard/connect', icon: LayoutDashboard },
      { label: 'Broadcasts', href: '/admin-dashboard/connect/notices', icon: Megaphone },
      { label: 'Groups', href: '/admin-dashboard/connect/groups', icon: Users },
      { label: 'Meetings', href: '/admin-dashboard/connect/meetings', icon: Target },
      { label: 'Calendar', href: '/admin-dashboard/connect/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: PieChart,
    children: [
      { label: 'Reports Hub', href: '/admin-dashboard/reports', icon: FolderKanban },
    ],
  },
  {
    label: 'My Workspace',
    icon: UserCircle,
    children: [
      { label: 'My Account', href: '/admin-dashboard/account', icon: UserCircle },
      { label: 'Leave', href: '/admin-dashboard/leave', icon: CalendarDays },
    ],
  },
  {
    label: 'Administration',
    icon: Building2,
    children: [
      { label: 'Staff Corner', href: '/admin-dashboard/administration/staff', icon: Users },
      { label: 'Payroll', href: '/admin-dashboard/administration/payroll', icon: Wallet },
      { label: 'Master Data Center', href: '/admin-dashboard/administration/master', icon: Target },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Security Settings', href: '/admin-dashboard/settings', icon: Shield },
      { label: 'Invoice Config', href: '/admin-dashboard/settings/config/invoice', icon: Receipt },
      { label: 'Tax Config', href: '/admin-dashboard/settings/config/tax', icon: Wallet },
      { label: 'Permissions', href: '/admin-dashboard/settings/config/staff-permission', icon: Shield },
      { label: 'Branch', href: '/admin-dashboard/settings/config/branch', icon: Building2 },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  role: Role;
  /** Below the lg breakpoint the sidebar is an off-canvas drawer. */
  mobileOpen: boolean;
}

/** Only the links this role may open (lib/permissions.ts); empty groups are dropped. */
function navigationFor(role: Role): NavItem[] {
  return navigation
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => !c.href || canAccessPath(role, c.href)) }
        : item,
    )
    .filter((item) => (item.children ? item.children.length > 0 : !item.href || canAccessPath(role, item.href)));
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed, role, mobileOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleNavigation = navigationFor(role);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href?: string) => pathname === href;
  const isChildActive = (children?: NavItem[]): boolean => {
    return children ? children.some((child) => pathname === child.href || (child.children && isChildActive(child.children))) : false;
  };

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: isCollapsed && !mobileOpen ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`h-screen glass-nav border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0 bg-[#070B14]!' : '-translate-x-full'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 font-bold text-xl text-white tracking-tight"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <span className="text-white text-sm">A</span>
              </div>
              AuraEdu
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {visibleNavigation.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                    isChildActive(item.children)
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                      : 'hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      className={isChildActive(item.children) ? 'text-green-400' : 'text-slate-400 group-hover:text-slate-300'}
                    />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        expandedGroups[item.label] || isChildActive(item.children) ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {(!isCollapsed && (expandedGroups[item.label] || isChildActive(item.children))) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 pl-4 border-l border-white/10 my-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href!}
                            className={`flex items-center gap-3 p-2.5 rounded-lg text-sm transition-all duration-200 group ${
                              isActive(child.href)
                                ? 'bg-green-500/20 text-green-400 font-medium'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                          >
                            <child.icon
                              size={16}
                              className={isActive(child.href) ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}
                            />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={item.href!}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-green-600/20 to-transparent text-green-400 border-l-2 border-green-500'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon
                  size={20}
                  className={isActive(item.href) ? 'text-green-400' : 'text-slate-400 group-hover:text-slate-300'}
                />
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </form>
      </div>
    </motion.aside>
  );
}

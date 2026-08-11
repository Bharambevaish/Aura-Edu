"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Shield,
  UserCircle,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  FolderKanban,
  Monitor
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
      { label: 'Student Corner', href: '/admin-dashboard/students', icon: Users },
      { label: 'Student Logins', href: '/admin-dashboard/students/logins', icon: Monitor },
      { label: 'Courses', href: '/admin-dashboard/courses', icon: BookOpen },
      { label: 'Schedule', href: '/admin-dashboard/schedule', icon: CalendarDays },
      { label: 'Leads', href: '/admin-dashboard/leads', icon: Target },
      { label: 'Forms', href: '/admin-dashboard/forms', icon: FileText },
      { label: 'Task Manager', href: '/admin-dashboard/tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'Finance Operations',
    icon: Wallet,
    children: [
      { label: 'Accounts', href: '/admin-dashboard/finance/accounts', icon: Building2 },
      { label: 'Audit Trail', href: '/admin-dashboard/finance/audit-trail', icon: Receipt },
    ],
  },
  {
    label: 'Communications',
    icon: MessageSquare,
    children: [
      { label: 'Dashboard', href: '/admin-dashboard/connect', icon: LayoutDashboard },
      { label: 'Groups', href: '/admin-dashboard/connect/groups', icon: Users },
      { label: 'Meetings', href: '/admin-dashboard/connect/meetings/schedule', icon: Target },
      { label: 'Calendar', href: '/admin-dashboard/connect/calendar', icon: Calendar },
    ],
  },
  {
    label: 'Reports & Analytics',
    icon: PieChart,
    children: [
      { label: 'Reports Hub', href: '/admin-dashboard/reports', icon: FolderKanban },
      { label: 'Legacy Reports', href: '/admin-dashboard/reports/legacy', icon: FileText },
    ],
  },
  {
    label: 'Administration',
    icon: Building2,
    children: [
      { label: 'Staff Corner', href: '/admin-dashboard/staff', icon: Users },
      { label: 'Master Data Center', href: '/admin-dashboard/master', icon: Target },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Security Settings', href: '/admin-dashboard/settings', icon: Shield },
      { label: 'Profile', href: '/admin-dashboard/profile', icon: UserCircle },
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
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
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
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen glass-nav border-r border-white/10 flex flex-col fixed left-0 top-0 z-40 text-slate-300"
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
                <span className="text-white text-sm">M</span>
              </div>
              MyEdou
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
        {navigation.map((item) => (
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
        <button className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
          <LogOut size={18} />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}

"use client";

/**
 * Visual wrapper for the admin/staff portal. Rendered only after the parent
 * layout's `requireRole(["admin", "staff"])` passes and the DB's role is
 * passed down as `user` (name/email/role come from the signed JWT via the
 * layout). The same role chip drives what the sidebar/header may show.
 */
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider } from '@/components/ui';
import type { SessionUser } from '@/lib/dal';

export default function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div
          className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
          style={{ paddingLeft: isCollapsed ? '80px' : '260px' }}
        >
          <AdminHeader user={user} />
          <DemoBanner tone="emerald" canReset={user.role === "admin"} />
          <main className="flex-1 p-6 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
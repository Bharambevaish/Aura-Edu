"use client";

/**
 * Visual wrapper for the admin/staff portal. Rendered only after the parent
 * layout's `requireRole(["admin", "staff"])` passes; `user` carries the
 * current name/email/role read from the DB by that check. The role drives the
 * sidebar links and is exposed to pages via AdminUserContext.
 */
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider } from '@/components/ui';
import type { SessionUser } from '@/lib/dal';
import { AdminUserProvider } from './AdminUserContext';

export default function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Set by requireAdminPage() when staff open an admin-only section.
  const denied = useSearchParams().get('denied') === '1';

  return (
    <AdminUserProvider value={user}>
    <ToastProvider>
      <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} role={user.role} />

        <div
          className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
          style={{ paddingLeft: isCollapsed ? '80px' : '260px' }}
        >
          <AdminHeader user={user} />
          <DemoBanner tone="emerald" canReset={user.role === "admin"} />
          {denied && (
            <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium">
              That section is restricted to administrators.
            </div>
          )}
          <main className="flex-1 p-6 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
    </AdminUserProvider>
  );
}
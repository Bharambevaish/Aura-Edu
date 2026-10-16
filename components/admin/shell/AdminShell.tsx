"use client";

/**
 * Visual wrapper for the admin/staff portal. Rendered only after the parent
 * layout's `requireRole(["admin", "staff"])` passes; `user` carries the
 * current name/email/role read from the DB by that check. The role drives the
 * sidebar links and is exposed to pages via AdminUserContext.
 */
import React, { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DemoBanner from '@/components/DemoBanner';
import { ToastProvider } from '@/components/ui';
import type { SessionUser } from '@/lib/dal';
import { AdminUserProvider } from './AdminUserContext';
import { BranchProvider, type BranchState } from './BranchContext';

export default function AdminShell({
  user,
  branch,
  demoMode,
  children,
}: {
  user: SessionUser;
  branch: BranchState;
  /** DEMO_MODE, read server-side by the layout. */
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Phone/tablet drawer: open for the page it was opened on, so following a
  // link closes it without an effect.
  const pathname = usePathname();
  const [drawerFor, setDrawerFor] = useState<string | null>(null);
  const mobileOpen = drawerFor === pathname;
  // Set by requireAdminPage() when staff open an admin-only section.
  const denied = useSearchParams().get('denied') === '1';

  return (
    <AdminUserProvider value={user}>
    <BranchProvider value={branch}>
    <ToastProvider>
      <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} role={user.role} mobileOpen={mobileOpen} />
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setDrawerFor(null)} aria-hidden="true" />
        )}

        <div
          className={`flex flex-col min-h-screen min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]'}`}
        >
          <AdminHeader user={user} onMenu={() => setDrawerFor(mobileOpen ? null : pathname)} />
          {demoMode && <DemoBanner tone="emerald" canReset={user.role === "admin"} />}
          {denied && (
            <div className="mx-4 sm:mx-6 mt-4 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium">
              That section is restricted to administrators.
            </div>
          )}
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
            {/* Keyed by branch so client screens remount and refetch on a switch. */}
            <div key={branch.current ?? '*'} className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
    </BranchProvider>
    </AdminUserProvider>
  );
}
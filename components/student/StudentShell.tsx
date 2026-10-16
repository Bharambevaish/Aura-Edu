"use client";

/**
 * Visual wrapper for the whole student portal. Rendered only after the parent
 * layout's `requireRole(["student"])` passes, so simply viewing any page here
 * guarantees a valid student session (see app/student-portal/layout.tsx).
 */
import React, { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import TopHeader from "@/components/student/TopHeader";
import DemoBanner from "@/components/DemoBanner";

export default function StudentShell({
  demoMode,
  children,
}: {
  /** DEMO_MODE, read server-side by the layout. */
  demoMode: boolean;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <TopHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Demo banner (DEMO_MODE only) */}
        {demoMode && <DemoBanner tone="cyan" />}

        {/* Dynamic Page View */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
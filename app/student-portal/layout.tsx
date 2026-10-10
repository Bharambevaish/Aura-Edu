"use client";

import React, { useState } from "react";
import { StudentProvider } from "@/context/StudentContext";
import Sidebar from "@/components/student/Sidebar";
import TopHeader from "@/components/student/TopHeader";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <StudentProvider>
      <div className="flex min-h-screen bg-[#070B14] text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top Header */}
          <TopHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          {/* Dynamic Page View */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </StudentProvider>
  );
}

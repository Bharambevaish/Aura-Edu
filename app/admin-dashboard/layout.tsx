"use client";

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div 
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isCollapsed ? '80px' : '260px' }}
      >
        <AdminHeader />
        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

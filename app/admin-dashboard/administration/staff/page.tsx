"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, ShieldCheck, Clock } from "lucide-react";
import { getStaffUsers, type StaffUserDTO } from "@/lib/actions/staff";
import {
  PageHeader,
  DataTable,
  Skeleton,
  EmptyState,
  Button,
  StatCard,
} from "@/components/ui";

export default function StaffCornerPage() {
  const [staff, setStaff] = useState<StaffUserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => getStaffUsers(), []);

  useEffect(() => {
    let ignore = false;
    fetchData()
      .then((rows) => {
        if (!ignore) setStaff(rows);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [fetchData]);

  const refresh = () => {
    void fetchData().then(setStaff);
  };

  const signedIn = staff.filter((s) => s.lastLoginAt).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Staff Corner"
          subtitle="Directory of staff accounts created by the seed (admin view)."
          icon={<Users className="text-emerald-400" />}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Corner"
        subtitle="Directory of staff accounts created by the seed (admin view)."
        icon={<Users className="text-emerald-400" />}
      >
        <Button variant="secondary" onClick={() => refresh()}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Staff"
          value={staff.length}
          icon={<ShieldCheck size={18} />}
          accent="emerald"
        />
        <StatCard
          label="Signed In"
          value={signedIn}
          icon={<Clock size={18} />}
          accent="blue"
        />
        <StatCard
          label="Demo Accounts"
          value={staff.filter((s) => s.isDemo).length}
          icon={<Users size={18} />}
          accent="purple"
        />
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Staff Member",
            cell: (s) => (
              <div>
                <p className="font-medium text-white">{s.name}</p>
                <p className="text-xs text-slate-500">{s.email}</p>
              </div>
            ),
          },
          { key: "employeeId", header: "Employee ID", cell: (s) => <span className="text-slate-400">{s.employeeId}</span> },
          { key: "batch", header: "Batch", cell: (s) => <span className="text-slate-400">{s.batch ?? "—"}</span> },
          {
            key: "isDemo",
            header: "Type",
            cell: (s) =>
              s.isDemo ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#74B53C]/15 text-[#74B53C] border border-[#74B53C]/25">
                  Demo
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                  Live
                </span>
              ),
          },
          {
            key: "lastLoginAt",
            header: "Last Login",
            cell: (s) =>
              s.lastLoginAt ? (
                <span className="text-slate-300">
                  {new Date(s.lastLoginAt).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              ) : (
                <span className="text-slate-500">Never</span>
              ),
          },
        ]}
        rows={staff}
        keyField={(s) => s.id}
        emptySlot={
          <EmptyState
            title="No staff found"
            message="Seed the demo database to create staff accounts (npm run seed)."
          />
        }
      />
    </div>
  );
}
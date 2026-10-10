import React from "react";
import { cn } from "./cn";

const accents = {
  emerald: "text-emerald-400",
  blue: "text-blue-400",
  red: "text-red-400",
  purple: "text-purple-400",
  amber: "text-amber-400",
  slate: "text-slate-300",
} as const;

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: string;
  accent?: keyof typeof accents;
  className?: string;
}

export function StatCard({ label, value, icon, delta, accent = "slate", className }: StatCardProps) {
  return (
    <div className={cn("glass-panel rounded-xl p-4 border border-white/5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        {icon && <span className={accents[accent]}>{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      {delta && <p className="text-xs text-slate-400 mt-1">{delta}</p>}
    </div>
  );
}
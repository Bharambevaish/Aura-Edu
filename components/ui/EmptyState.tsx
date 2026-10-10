import React from "react";
import { Inbox } from "lucide-react";
import { cn } from "./cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl py-14 px-6 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mb-3">
        {icon ?? <Inbox size={22} />}
      </div>
      <p className="text-base font-semibold text-white">{title}</p>
      {message && <p className="text-sm text-slate-400 mt-1 max-w-md">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
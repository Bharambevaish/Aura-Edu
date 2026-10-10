import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** Title row at the top of every admin page; actions slot on the right. */
export function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap">{children}</div>
      )}
    </div>
  );
}
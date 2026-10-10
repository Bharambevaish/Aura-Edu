import React from "react";
import { cn } from "./cn";

interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Wraps a form control with label + optional hint/error message. */
export function FormField({ label, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
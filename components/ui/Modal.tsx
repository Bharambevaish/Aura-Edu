"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

const sizeMap = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Accessible dialog modal matching the admin dark glass theme. Closes on
 * backdrop click and Escape key.
 */
export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
          sizeMap[size]
        )}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/5">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {description && (
              <p className="text-sm text-slate-400 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
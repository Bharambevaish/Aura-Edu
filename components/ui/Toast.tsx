"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type Tone = "success" | "error" | "info";
interface ToastItem { id: number; tone: Tone; message: string }
interface ToastCtx { toast: (message: string, tone?: Tone) => void }

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

let nextId = 1;

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
  error: <AlertTriangle size={18} className="text-red-400 shrink-0" />,
  info: <Info size={18} className="text-blue-400 shrink-0" />,
};

/**
 * Mount once (at page root or AdminShell level) and call `toast(msg)` from
 * any descendant. Auto-dismisses after ~3.5 s.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = nextId++;
      setToasts((t) => [...t, { id, tone, message }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-panel border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-3 pointer-events-auto"
          >
            {icons[t.tone]}
            <span className="text-sm text-slate-200">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-500 hover:text-white ml-2 shrink-0"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
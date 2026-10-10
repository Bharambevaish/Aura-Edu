"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label?: string;
  hint?: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  allowCustom?: boolean;
  emptyMessage?: string;
  className?: string;
}

/**
 * Text input with an autocomplete dropdown. Lets the user either pick an
 * existing option or (when allowCustom) type their own value — used for
 * batch/course/subject on Create Test so fields offer the live dataset.
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  allowCustom = true,
  emptyMessage = "No matching options",
  className = "",
}: ComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const filtered = options.filter(
    (o) =>
      o.value.toLowerCase().includes(q) ||
      (o.label ?? o.value).toLowerCase().includes(q),
  );

  const close = () => {
    setOpen(false);
    setQuery(value);
  };

  const select = (opt: ComboboxOption) => {
    onChange(opt.value);
    setQuery(opt.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        const opt = filtered[Math.max(highlight, 0)];
        if (opt) {
          e.preventDefault();
          select(opt);
        }
      }
    };
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlight, filtered]);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={open ? query : value}
          onFocus={() => {
            setQuery(value);
            setOpen(true);
          }}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            setOpen(true);
            if (allowCustom) onChange(v);
          }}
          placeholder={placeholder}
          className={`${className} pr-9`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => (open ? close() : (setQuery(value), setOpen(true)))}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5"
          aria-label="Toggle dropdown"
        >
          <ChevronDown size={15} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">{emptyMessage}</p>
          ) : (
            filtered.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={`${opt.value}-${i}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(opt)}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors ${
                    i === highlight ? "bg-emerald-500/10 text-emerald-300" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{opt.label ?? opt.value}</span>
                    {opt.hint && <span className="block text-[10px] text-slate-500 mt-0.5 truncate">{opt.hint}</span>}
                  </span>
                  {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-[#5E9A2E] text-white hover:bg-[#4A7E24] shadow-sm shadow-black/20",
  secondary: "glass-panel border border-white/10 text-slate-200 hover:bg-white/5",
  danger: "bg-red-500/90 text-white hover:bg-red-600",
  ghost: "text-slate-300 hover:bg-white/5",
  outline: "border border-white/10 text-slate-200 hover:border-white/25",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-sm gap-2",
  icon: "p-2",
};

/**
 * Primary action button for the admin/student portals. `primary` uses the
 * platform brand green; `secondary` is a bordered glass chip used for
 * toolbar actions (Refresh, Cancel, etc.).
 */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
import { cn } from "./cn";

/** Animated loading placeholder for skeleton states. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/5", className)} />;
}
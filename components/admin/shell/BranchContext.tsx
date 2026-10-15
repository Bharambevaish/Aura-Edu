"use client";

/**
 * The branch the admin header's switcher is scoped to (null = all branches)
 * plus the active branch names, from the server layout. Data actions read the
 * same choice from the cookie themselves; this is only for UI (the switcher,
 * "Branch: X" chips and branch pickers).
 */
import { createContext, useContext } from "react";
import { MapPin } from "lucide-react";

export type BranchState = { current: string | null; branches: string[] };

const BranchContext = createContext<BranchState>({ current: null, branches: [] });

export const BranchProvider = BranchContext.Provider;

export function useBranch(): BranchState {
  return useContext(BranchContext);
}

/** Small "Branch: X" chip for pages whose numbers follow the switcher. */
export function BranchChip({ className = "" }: { className?: string }) {
  const { current } = useBranch();
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
        current ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-white/5 text-slate-400 border-white/10"
      } ${className}`}
      title="Change the branch from the switcher in the header"
    >
      <MapPin size={11} /> Branch: {current ?? "All branches"}
    </span>
  );
}

"use client";

import { useState, useActionState } from "react";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import { resetDemoData } from "@/lib/actions/demo";

type Tone = "emerald" | "cyan";

export default function DemoBanner({ tone = "emerald" }: { tone?: Tone }) {
  const [dismissed, setDismissed] = useState(false);
  const [, formAction, pending] = useActionState(resetDemoData, null);

  if (dismissed) return null;

  const accent =
    tone === "emerald"
      ? "border-[#74B53C]/25 bg-[#5E9A2E]/10 text-emerald-300"
      : "border-cyan-500/25 bg-cyan-500/10 text-cyan-300";

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2.5 border-b text-xs font-medium ${accent}`}>
      <span className="flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5" />
        Demo preview — sample accounts are seeded, not real billing data.
      </span>
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-60"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${pending ? "animate-spin" : ""}`} />
          {pending ? "Resetting…" : "Reset demo data"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss demo banner"
        className="p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
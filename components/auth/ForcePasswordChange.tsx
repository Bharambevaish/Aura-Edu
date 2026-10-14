"use client";

/**
 * Shown instead of the student portal or admin dashboard while
 * `mustChangePassword` is set (password issued by an admin: created, imported,
 * converted from a lead or reset). `changeOwnPassword` clears the flag;
 * `router.refresh()` then re-runs the layout and the portal appears.
 */
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import { changeOwnPassword } from "@/lib/actions/account";
import { logoutAction } from "@/lib/actions/auth";

export default function ForcePasswordChange({ name }: { name: string }) {
  const router = useRouter();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPass !== confirmPass) {
      setError("New password and confirmation do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await changeOwnPassword({ currentPassword: currentPass, newPassword: newPass });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update your password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none";

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 border border-slate-800 p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Set a new password</h1>
          <p className="text-sm text-slate-400">
            Welcome, {name}. Your password was issued by the institute — choose your own before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Current (temporary) password</label>
            <input type="password" required value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className={input} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">New password</label>
            <input type="password" required minLength={8} placeholder="At least 8 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={input} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Confirm new password</label>
            <input type="password" required value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={input} />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save and continue"}
          </button>
        </form>

        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

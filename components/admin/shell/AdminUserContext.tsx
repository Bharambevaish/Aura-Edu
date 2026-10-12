"use client";

/**
 * The signed-in admin/staff user (from the server layout) for client screens
 * that need to adapt to the role — e.g. hiding admin-only actions from staff.
 * UI convenience only: every server action re-checks the role itself.
 */
import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/dal";

const AdminUserContext = createContext<SessionUser | null>(null);

export const AdminUserProvider = AdminUserContext.Provider;

export function useAdminUser(): SessionUser {
  const user = useContext(AdminUserContext);
  if (!user) throw new Error("useAdminUser must be used inside AdminShell");
  return user;
}

export function useIsAdmin(): boolean {
  return useAdminUser().role === "admin";
}

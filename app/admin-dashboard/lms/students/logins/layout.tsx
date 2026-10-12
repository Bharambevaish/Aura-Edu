import React from "react";
import { requireAdminPage } from "@/lib/dal";

/** Admin-only section (lib/permissions.ts): staff are redirected server-side. */
export default async function AdminOnlyLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}

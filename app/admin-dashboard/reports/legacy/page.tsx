import { redirect } from "next/navigation";

/** The old static "Legacy Analytics" mock-up is retired; its links land on the live Reports Hub. */
export default function LegacyReportsPage() {
  redirect("/admin-dashboard/reports");
}

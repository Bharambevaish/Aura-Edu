import { redirect } from "next/navigation";

/** Personal profile lives on My Account (admins and staff). */
export default function SettingsProfilePage() {
  redirect("/admin-dashboard/account");
}

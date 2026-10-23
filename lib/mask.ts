/**
 * Masking for identity numbers shown in admin screens (pure, unit-tested).
 * Admins see enough to recognise a document ("•••• •••• 8896") but the full
 * Aadhaar/PAN/passport number never reaches the browser after it is saved.
 * The privacy export (lib/actions/privacy.ts) still returns the full value.
 */
export function maskIdNumber(value: string | null | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw || raw === "-") return "-";
  const chars = raw.replace(/[^A-Za-z0-9]/g, "");
  if (chars.length <= 4) return "••••";
  return `•••• •••• ${chars.slice(-4)}`;
}

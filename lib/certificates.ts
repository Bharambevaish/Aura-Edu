/**
 * Certificates — stateless PDF generator constants.
 *
 * Shared between the server action module (student/course lookups), the
 * client-side center + generate pages and the `/certificates/render` print
 * route. Deliberately kept out of the "use server" file because that file may
 * only export async functions — these are plain consts/helpers.
 */
export type CertificateTemplate = "premium_classic" | "modern_clean" | "elegant_gold";

export const CERTIFICATE_TEMPLATES: {
  key: CertificateTemplate;
  label: string;
  description: string;
}[] = [
  { key: "premium_classic", label: "Premium Classic", description: "Amber double-border, serif headline — a formal institutional look." },
  { key: "modern_clean", label: "Modern Clean", description: "Minimal slate border, sans-serif — crisp and contemporary." },
  { key: "elegant_gold", label: "Elegant Gold", description: "Gold trim with an italic serif name — classic award styling." },
];

/** Validate an incoming template value (defensive — pages only offer these). */
export function isCertificateTemplate(value: string | null | undefined): value is CertificateTemplate {
  return value === "premium_classic" || value === "modern_clean" || value === "elegant_gold";
}

export const CERTIFICATE_TEMPLATE_LABEL: Record<CertificateTemplate, string> = {
  premium_classic: "Premium Classic",
  modern_clean: "Modern Clean",
  elegant_gold: "Elegant Gold",
};
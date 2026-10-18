/**
 * Keeps the demo seed off a real institute's database (pure, unit-tested).
 *
 * The demo seed upserts the public demo accounts (admin@demo.auraedu.com /
 * Admin@123 …). A database that holds anyone else belongs to a real institute
 * (or was set up with `npm run setup:institute`), so `npm run seed` refuses it.
 * Accounts on the demo domain that aren't in DEMO_ACCOUNTS (leads converted or
 * staff added during a demo) still count as demo: the seed removes them.
 */

export const DEMO_EMAIL_DOMAIN = "demo.auraedu.com";

/** True for any address on the demo domain, e.g. "x@demo.auraedu.com". */
export function isDemoAccountDomain(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${DEMO_EMAIL_DOMAIN}`);
}

/** The stored emails that are not demo accounts, in the order given. */
export function nonDemoEmails(emails: string[], demoEmails: string[]): string[] {
  const demo = new Set(demoEmails.map((e) => e.toLowerCase()));
  return emails.filter((e) => !demo.has(e.toLowerCase()) && !isDemoAccountDomain(e));
}

/** Refusal message for `npm run seed`, or null when the database is demo-only. */
export function demoSeedRefusal(emails: string[], demoEmails: string[]): string | null {
  const real = nonDemoEmails(emails, demoEmails);
  if (real.length === 0) return null;
  const shown = real.slice(0, 3).join(", ") + (real.length > 3 ? ` and ${real.length - 3} more` : "");
  return (
    `this database has ${real.length === 1 ? "1 account that is not a demo account" : `${real.length} accounts that are not demo accounts`} ` +
    `(${shown}), so it looks like a real institute's database. The demo seed would add the public demo ` +
    `logins (admin@demo.auraedu.com / Admin@123 …) and replace its data. Point MONGODB_URI at the demo database instead.`
  );
}

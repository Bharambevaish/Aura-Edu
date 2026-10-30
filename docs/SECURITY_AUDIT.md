# AuraEdu — OWASP Top 10 (2021) review

Date: 2026-10-30. Method: code review of every server action, route handler
and export, `npm audit`, and automated tests on a local production build
against a throwaway database. The live site was only checked read-only.

## Summary

| # | Category | Finding | Status |
|---|---|---|---|
| A01 | Broken Access Control | Every non-public server action checks the role; student actions check enrollment/batch/ownership against the signed-in user; admin-only routes gated server-side; export route checks the session. No IDOR found. | ✅ OK (no change) |
| A02 | Cryptographic Failures | bcrypt cost 12, HMAC-signed certificates, secrets only in env, HTTPS + HSTS on Vercel, secure session cookie. | ✅ OK |
| A03 | Injection | **(1) NoSQL operator injection:** server actions accept any JSON, so `{"$ne": null}` sent where an id string is expected became a query operator. **(2) CSV/formula injection:** exported cells starting with `= + - @` ran as formulas in Excel (names come from the public admission form). **(3) Link schemes:** lesson and receipt URLs accepted `javascript:`/`data:` (React 19 + CSP already blocked execution). | 🔧 Fixed |
| A04 | Insecure Design | Rate limits on login and public forms, honeypots, capped refunds/waivers, DEMO_MODE gates demo-only features. | ✅ OK |
| A05 | Security Misconfiguration | Nonce CSP, X-Frame-Options, nosniff, no X-Powered-By, generic errors, health check leaks nothing. | ✅ OK |
| A06 | Vulnerable Components | **Critical:** Next.js 16.3.5 (RCE in `next/og`, cache leak). **High:** zod, sharp, playwright, source-map-js. **High:** xlsx 0.18.5 (prototype pollution, ReDoS) — no fix on npm. | 🔧 Fixed except xlsx (see below) |
| A07 | Identification & Authentication | Lockout after 5 failures, current password required to change it, forced change of one-time passwords. **Gap:** changing a password left other sessions signed in. | 🔧 Fixed |
| A08 | Software & Data Integrity | Lockfile + `npm ci`, CI on every push, signed certificate links. | ✅ OK |
| A09 | Logging & Monitoring | Audit log for money/accounts/grading. **Gap:** account lockouts were not logged. No external monitoring yet (Stage G2: Sentry). | 🔧 Fixed (lockouts); monitoring pending |
| A10 | SSRF | The server never fetches user-supplied URLs. | ✅ Not applicable |

## Fixes

- **`lib/guards.ts` → `assertStrings()`** at the top of 90 server actions that take string arguments: anything that is not a string (or omitted) is rejected before any query.
- **`lib/csv.ts`** (`toCsv`, `sanitizeRecords`): every CSV and spreadsheet export (leads, form responses, tasks, attendance ×2, reports, students, logins, audit trail) quotes cells and prefixes formula-like text with `'`.
- **`isSafeLink` in `lib/validation.ts`**: lesson URLs and expense receipt URLs accept only `http(s)://` links or site paths.
- **`endOtherSessions()`**: changing your password (admin, staff, student) signs out every other device.
- **Lockout audit**: the failure that triggers a lockout writes "sign-in locked after repeated failures".
- **Dependencies**: next 16.4.3, eslint-config-next 16.4.3, zod 4.6.7, @playwright/test 1.64.1, sharp 0.35.5 (via next), `npm audit fix`.
- Tests: `tests/unit/guards.test.ts`, `csv.test.ts`, `safe-link.test.ts`.

## Open item: `xlsx` (SheetJS)

npm only has 0.18.5, which is vulnerable; SheetJS publishes fixed versions
(0.20.3+) on its own CDN. It runs only in the admin's browser (student
import/export), so the risk is a crafted spreadsheet opened by an admin.
Options: install `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, or
replace it with `exceljs` (on npm). Needs the owner's decision.

# AuraEdu — Master Task List

> **Mission:** a coaching/institution management platform, currently a
> **sales-demo POC**: ~25 demonstrable modules so prospects can pick which ones
> get built for real. A demo that works end-to-end beats 25 half-built screens.

This is the **single task list** for the project: every completed and pending
task, the recommended order to finish, and the rules for working on it.
History of *how* things were built lives in `WORKLOG.md`; the original audit
lives in `PROJECT_STATUS.md`.

**Legend:** `- [x] ~~struck through~~` = done · `- [ ]` = to do ·
**(you)** = needs an account, a decision or an action from the project owner ·
effort is a rough single-developer estimate.

---

## 1. Snapshot (2026-10-23, live)

| Area | Status |
|---|---|
| Foundation (auth, DB, seed, UI kit, security headers) | ✅ Done |
| Live-DB modules | ✅ Students, Student Logins, Batches, Courses, Attendance, Tests, Assignments, Certificates, Finance (10 screens), Communications (5 screens) |
| Student portal | ✅ Fully live: profile, fees + pay, courses + lesson progress, store, tests, assignments, attendance, schedule, earned certificates, notifications |
| Phase 1 security & core fixes | ✅ Done on branch `phase1-security` |
| Stage A close-out | ✅ Code done · ✅ new remote (GitHub `Nikhil270703/AuraEdu`, private) · ✅ all stages on `main` · ⏳ owner items: old-history purge, branch protection |
| Demo story | ✅ Online admission → leads → follow-up → convert → student → test → grading → certificate → reset (branch `stage-c-demo-story`, script in `docs/DEMO_SCRIPT.md`) |
| Breadth modules | ✅ Timetable, Reports Hub, Task Manager, Form Builder, Settings, Master Data, Multi-branch, Payroll simulator, Leave, staff self-service, group chat, lesson doubts (branch `stage-d-breadth`) |
| Real-institute readiness | ✅ First-admin setup, backups/restore/export, shared rate limit, privacy consent, DEMO_MODE switch (Stage F part 1) |
| Quality gates | ✅ CI: typecheck, lint, 113 unit tests, build, 24 Playwright e2e (demo story, grading access, privacy, export, CSP, phone layout, time-zone hydration) · ✅ live smoke tests (`npm run test:live`) |
| Deployment | ✅ **Live demo:** https://aura-edu-eight.vercel.app (Vercel Hobby, `main`; MongoDB Atlas Cluster2, database `auraedu`; DEMO_MODE=true; seeded 2026-10-23) |

---

## 2. Recommendation — the flow to finish the project

The product's job is to **win demos**, so the order is: close the security
loose ends → get a live link → finish the one demo story end-to-end → widen to
every sidebar module → harden and polish. Production-grade integrations
(payments, email, uploads) wait until a client picks modules, so effort is not
spent on modules nobody buys.

| Stage | Goal | Exit criteria | Effort |
|---|---|---|---|
| **A. Close out Phase 1** | Safe, clean base on `main` | Git history purged, branch merged, known money/credential bugs fixed, CI green on every push | 1–2 days |
| **B. Go live early** | Every demo runs from a link | Atlas + Vercel live, demo path works on the live link, rate limiter works on serverless | 1–2 days **(you: accounts)** |
| **C. Complete the demo story** | The Definition of Done (§6) works start to finish | Lead → student → test → grading → certificate → reset, with no demo-only data on the way | ~1 week |
| **D. Breadth sweep** | Every sidebar module *does something* visible | No dead buttons or static-only pages left in the sidebar | 1–2 weeks |
| **E. Harden & polish** | Confidence on demo day | e2e test of the demo path, mobile pass, demo scripts written | ~1 week |
| **F. Productionize, part 1** | Safe for a real institute without accounts | First-admin setup, backups, shared rate limit, consent ✅ | done |
| **G. Pilot readiness** | One real institute runs on it | Integrations live, client infra, a 2–4 week pilot | ~3–4 weeks + your accounts |
| **H. Scale** | Many institutes on one platform | Multi-tenant, super-admin, billing | after 3–5 clients |

**Why this order**
- **A before anything else:** a payment can currently land on the wrong
  student's invoice, and imported students share one password. Fix the base
  before building on it.
- **B early, not last:** the app has only ever run locally. Serverless changes
  behaviour (the in-memory rate limiter stops working, cold starts, env
  secrets). Finding that on demo day is the expensive way. If accounts aren't
  ready, start C in parallel and come back.
- **C before D:** one flawless story sells better than breadth. Leads →
  conversion is the advertised "wow" and is still missing.
- **D after C:** most remaining modules are display-only. Real data behind
  them is quick once the core flows exist.
- **F last:** building payment gateways or SMS for modules nobody buys is waste.

**If time is tight**, do A → C → B and demo from a laptop. Skip D/E items that
aren't on the demo path.

---

## 3. Task list

### ✅ Done — Foundation
- [x] ~~Next.js 16 + React 19 + TypeScript + Tailwind v4 scaffold; landing page with marketing sections~~
- [x] ~~MongoDB + Mongoose connection singleton; local Mongo runner (`npm run mongo`)~~
- [x] ~~Auth.js v5 Credentials login, JWT cookie (httpOnly, SameSite=Lax, 7-day), typed session~~
- [x] ~~bcrypt cost 12; timing-safe dummy hash against user enumeration; generic error messages~~
- [x] ~~Login rate limiting + lockout (5 fails / 10 min → 15 min lock); failure counters on the user~~
- [x] ~~Central DAL `requireRole()`; layout gates; edge `proxy.ts` redirect gate~~
- [x] ~~Zod validation on server-action inputs~~
- [x] ~~Security headers: CSP, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS~~
- [x] ~~One-click role logins (Admin / Staff / Student), demo banner, "Reset demo data"~~
- [x] ~~Realistic seed dataset (13 users, 4 batches, 3 courses, tests, assignments, attendance, finance, communications)~~
- [x] ~~Shared UI kit (`components/ui`), glass-panel dark theme, admin URLs reorganized to mirror the sidebar~~

### ✅ Done — Modules on the live database
- [x] ~~**Student Corner:** CRUD, 4-step wizard, search/filter/sort/pagination, Excel/CSV import + export, bulk assign, bulk Generate Login, simulated Send Credentials~~
- [x] ~~**Student Logins:** session list, devices, Block/Unblock, sign out one or all devices, export~~
- [x] ~~**Batches:** create/edit/delete (guarded), assign/move/remove students, derived status, over-capacity flags~~
- [x] ~~**Courses:** curriculum tree (modules → lessons CRUD + reorder) and storefront settings (price, badge, publish, enrolled, revenue)~~
- [x] ~~**Attendance:** per-batch daily register, Mark-All, month strip, CSV; student live %~~
- [x] ~~**Test Management:** create wizard (MCQ single/multi + written), fullscreen exam with auto-submit after 3 tab switches, MCQ auto-grade, staff written grading, per-test reports, test cards with printable report card~~
- [x] ~~**Assignments:** create worksheet → reminder notifications → student solves and submits → review with marks, verdict and note~~
- [x] ~~**Certificates:** stateless generator (3 templates, live preview, A4 print-to-PDF), shared by admin and student~~
- [x] ~~**Finance:** overview, invoices, payments, expenses + create, approval queue, categories, vendors, refunds, waivers, audit trail~~
- [x] ~~**Communications:** dashboard, targeted broadcasts with read stats, batch groups, meetings + scheduler, calendar (Month/Week/Day/Agenda)~~
- [x] ~~**Staff Corner:** read-only staff roster~~
- [x] ~~**Student Notifications hub** on real data~~

### ✅ Done — Phase 1: security & core fixes (branch `phase1-security`)
- [x] ~~Demo reset restricted to admins (it was callable by anyone, even logged out)~~
- [x] ~~Student portal loads the **signed-in** student's profile, fees and courses (was hard-coded to one demo student)~~
- [x] ~~Students pay their own invoice from the portal (audit-logged, overpayment-guarded)~~
- [x] ~~My Courses, Learn player, Course Store and enrollment read the real course catalog; non-enrolled courses refused~~
- [x] ~~Student profile edit (contact fields) and password change persist~~
- [x] ~~Rebrand MyEdou → AuraEdu (copy, domains, certificate IDs, DB name, logo)~~
- [x] ~~Previous developers' personal data removed from files; authors anonymized in rewritten history~~
- [x] ~~Block / force logout / account deletion take effect on the next request (DB-checked sessions)~~
- [x] ~~Login gate: the Auth.js callback can no longer be used to skip the rate limiter~~
- [x] ~~Student Logins shows real sign-in history (no fabricated sessions)~~
- [x] ~~Staff vs admin permissions: role-filtered sidebar, server-gated admin-only sections, admin-only destructive actions~~
- [x] ~~Reset keeps the clicking admin signed in~~
- [x] ~~Docs brought in line with the code (`WORKLOG.md`, `README.md`, `PROJECT_STATUS.md`, this file)~~

### Stage A — Close out Phase 1 ✅ (except two owner items)
- [ ] **(you)** Purge the old git history locally: delete `refs/original/*`, remove the old `origin` remote (CoachingPOC), expire the reflog, `git gc`
- [x] ~~New git remote: private GitHub repo `Nikhil270703/AuraEdu`; all stage branches pushed~~
- [x] ~~All stages on `main` (fast-forwarded, 2026-10-16 → 2026-10-22)~~
- [ ] **(you)** GitHub → Settings → Branches: protect `main`, require the CI check to pass
- [x] ~~**Bug:** admin "Record Payment" could apply a payment to another student's invoice. Now ownership-checked and overpayment-guarded~~
- [x] ~~**Bug:** imported students all got `Student@123`. Now each gets a unique one-time password, and every admin-issued password forces a change at first sign-in~~
- [x] ~~**Bug (found):** Generate Login / Send Credentials never worked (wrong argument shape from the page)~~
- [x] ~~**Bug (found):** import could overwrite an admin/staff account sharing an email; edit-student email clash checked only after writing~~
- [x] ~~**Bug (found):** students could list and sit other batches' tests by URL. Now limited to their own batch (plus tests already attempted)~~
- [x] ~~DTO audit: no action returns `passwordHash` or lockout counters; exam answer keys are stripped server-side. Note: the admin student-detail view intentionally shows the full ID-proof number (the edit form round-trips it)~~
- [x] ~~CI: GitHub Actions workflow running `tsc`, `lint` and `build` on every push/PR (`.github/workflows/ci.yml`)~~
- [x] ~~`poweredByHeader: false` (no `X-Powered-By` header)~~
- [x] ~~Honour `callbackUrl` after login, only for local paths inside the user's own portal (no open redirect)~~
- [x] ~~"Reset demo data" now also clears batches, courses, attendance and assignments created during a demo~~

### Stage B — Go live ✅ (2026-10-23)
- [x] ~~Atlas cluster (Cluster2), app DB user `nikhil_raghu` (read/write), network access 0.0.0.0/0; database `auraedu`~~
- [x] ~~Vercel project `aura-edu` from `main`; MONGODB_URI, AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST, DEMO_MODE~~
- [x] ~~Shared login rate limiter (MongoDB TTL collection)~~
- [x] ~~Live DB seeded (`npm run seed:remote`); /api/health reports `db: up, demoData: ready`; one-click logins work~~
- [x] ~~Read-only live smoke tests pass (`npm run test:live`)~~
- [x] ~~Demo delivery: the live link~~
- [ ] **(you)** Run the live sign-in checks: `$env:LIVE_URL="https://aura-edu-eight.vercel.app"; $env:LIVE_LOGINS="1"; npm run test:live`
- [ ] **(you)** Atlas backups: the free M0 tier has none. Run `npm run backup` weekly until you move to a paid tier (Stage G)
- [ ] **(you)** Vercel → Settings → Functions → region: the same region as the Atlas cluster (builds run in Washington, iad1). A mismatch adds latency to every page
- [ ] **(you)** Keep `nraghuvanshi100_db_user` (atlasAdmin) for the Atlas console only; the app uses `nikhil_raghu`
- [x] ~~**Go-live fixes found on the way:** database name taken from the URI (Atlas case conflict `auraedu`/`AuraEdu`), placeholder-credential message, unseeded-demo warning + `demoData` in /api/health, login says "temporarily unavailable" instead of crashing when the DB is down, 10s connect timeout, time-zone hydration errors on 3 pages, Vercel "Blocked" deploys (commits now authored as the repo owner)~~

### Stage C — Complete the demo story (done on branch `stage-c-demo-story`)
- [x] ~~**Leads:** `Lead` model (stage pipeline, priority, source, owner, follow-ups, notes); live Leads page with stats, filters, Add Lead, Follow-up history, CSV export~~
- [x] ~~**Lead → student conversion:** creates the account (one-time password + forced change), batch + course enrollment, fee invoice; links the lead; double-click safe; audit-logged~~
- [x] ~~**Online Admissions:** `/register` submits a rate-limited, Zod-validated, honeypot-protected application that creates a lead; reachable from the landing header and login page~~
- [x] ~~**Live admin dashboard home:** real students, courses, collections (6-month chart), outstanding/overdue, attendance %, pass rate, reviews/approvals, lead conversion, activity feed~~
- [x] ~~**Student portal leftovers:** notification bell, dashboard tests/scores/certificate count, Certificates (earned from progress/results), Schedule (live classes, events, batch tests), attendance empty states~~
- [x] ~~**Lesson progress:** `LessonProgress` model, working Mark Complete, real % on My Courses and dashboard~~
- [x] ~~Dead links: "Forgot Password?" now explains who resets passwords; `/privacy-policy` page added~~
- [x] ~~Demo script for the full story: `docs/DEMO_SCRIPT.md`~~
- [x] ~~**Decided:** admins and staff both grade written answers; an admin switch (Settings → Permissions, default on) can limit grading to admins~~

### Stage D — Breadth sweep ✅ (branch `stage-d-breadth`, 2026-10-15)
- [x] ~~**Timetable / schedules:** weekly `TimetableSlot` per batch with batch and teacher clash checks; date-wise schedule; student Schedule includes recurring classes~~
- [x] ~~**Reports:** Reports Hub with 19 live reports (revenue, receivables, expenses & payroll, students & courses, leads) and CSV export; "Legacy Reports" redirects to the hub~~
- [x] ~~**Staff experience:**~~
  - [x] ~~Staff CRUD in Staff Corner (one-time password, deactivate, reset)~~
  - [x] ~~Assign staff to batches/courses: through the timetable (teaching load comes from it)~~
  - [x] ~~Staff see "my batches" first: dashboard shows the teacher's classes today; Doubts Inbox is scoped to their batches~~
  - [x] ~~Staff profile and password change (My Account)~~
- [x] ~~**Settings that matter:** institute profile + GST rules feed invoices; printable tax invoice; Security page; Permissions page renders the enforced role matrix~~
- [x] ~~**Internal Task Manager:** `Task` model + Kanban CRUD~~
- [x] ~~**Salary & Payroll simulator:** computed, printable payslips (labelled a simulator)~~
- [x] ~~**Leave Management:** staff request → admin approve~~
- [x] ~~**Multi-branch:** `Branch` model, Settings → Branches, header switcher (cookie) scoping Student Corner, Finance overview/invoices/payments and the dashboard~~
- [x] ~~**Embeddable Form Builder:** persisted schema, two-pane builder with live preview, public `/f/<slug>` (+ `?embed=1` iframe), responses + CSV, each response becomes a "Web Form" lead~~
- [x] ~~**Master Data Center:** editable lookup lists (departments, designations, ID proofs, lost reasons) feeding real pickers, rename cascades, live reference tab~~
- [x] ~~Audit log for non-finance admin actions~~
- [x] ~~Connect scripted chat / WhatsApp simulation: saved batch group chat, scripted student replies, simulated WhatsApp ticks~~
- [x] ~~Reports Hub links no longer `#`~~
- [x] ~~Learn player "Doubt discussion": students ask on a lesson; LMS → Doubts Inbox for replies, with a notification back~~
- [ ] Learn player: lesson material opens only when a lesson has a URL (needs file uploads, Stage F)
- [x] ~~**Certificate verification:** HMAC-signed certificate links and a public `/verify` page~~
- [ ] Multi-branch follow-ups: expenses are institute-wide; reports, attendance and leads are not branch-scoped yet

### Stage E — Harden & polish ✅ (branch `stage-e-hardening`, 2026-10-15)
- [x] ~~Playwright e2e test of the full demo story (§6) running in CI~~ (`tests/e2e`, `npm run test:e2e`; also CSP and phone-width checks)
- [x] ~~Unit tests for MCQ grading, finance math (balances, refunds, waivers) and the session/permission gates~~ (Vitest, 42 tests, `npm test`)
- [x] ~~Tighten CSP (nonces; drop `unsafe-eval` in production)~~
- [x] ~~Mobile responsiveness pass (admin and student)~~: admin sidebar becomes a drawer; no page scrolls sideways at 375px
- [x] ~~Performance pass (slow pages, indexes, N+1 queries)~~: batched test ranks, compound indexes
- [x] ~~Richer seed data (20+ students, more history) for fuller charts~~: 24 students, six months of fees relative to today
- [x] ~~Demo-day checklist: one-click login, reset, tour path through the wow modules~~ (`docs/DEMO_DAY_CHECKLIST.md`)
- [x] ~~Bugs found on the way~~: written answers counted as graded on submit; refunds/waivers could exceed what was paid/owed; marks not capped; duplicate document numbers after deletions; production over http couldn't keep a login; missed tests shown as upcoming

### Stage F — Productionize, part 1 ✅ (account-free items, 2026-10-18)
- [x] ~~First-admin setup for a real institute without demo data~~ (`npm run setup:institute`); the demo seed refuses a real institute's database
- [x] ~~Login/form rate limit shared across Vercel instances~~ (MongoDB `ratelimits` with a TTL)
- [x] ~~Students can't self-record fee payments, paid course enrollments or receive scripted chat replies outside DEMO_MODE~~
- [x] ~~Backup restore drill before any real data~~: `npm run backup` / `npm run restore`, a restore-drill test and admin "Download all institute data" (`docs/BACKUPS.md`)
- [x] ~~Data retention / privacy policy page; DPDP-style consent for student data~~: consent (with guardian consent for minors) on admission and public forms, a privacy notice, admin export/erase per student. **(you)** Fill in the retention years and data region in the notice.


### Stage G — Pilot readiness (next; ~3–4 weeks, mostly gated on your accounts)
Goal: one real institute uses AuraEdu daily for a month without data loss,
fee errors or support fires. Each step unblocks the next.

**G1. Housekeeping (code, no accounts; ~2 days)**
- [ ] Separate local and live databases: local `.env` back to local Mongo; the live DB only via Vercel
- [ ] Pin Node 22 in `engines` (removes Vercel's "will upgrade automatically" warning)
- [ ] Vercel Preview environment variables (Preview deploys currently have none and can't reach a DB)
- [ ] Multi-branch follow-ups: branch-scope expenses, reports, attendance and leads
- [ ] Mask ID-proof numbers in admin views
- [ ] Confirm the GitHub CI run is green on `main`; add its badge to README

**G2. Accounts → integrations (~1–2 weeks of code once each account exists)**
- [ ] **(you: Sentry)** Error monitoring with alerts for server errors and failed-login spikes
- [ ] **(you: Resend or SES + a domain)** Email: password reset, credential delivery, fee reminders
- [ ] **(you: Razorpay)** Online fees and paid course checkout with webhook-verified receipts (then student self-payment can be enabled outside DEMO_MODE safely)
- [ ] **(you: Cloudflare R2)** File uploads: assignment attachments, lesson material, avatars (size/type limits, signed URLs)
- [ ] Learn player opens uploaded lesson material (closes the Stage D leftover)

**G3. Client infrastructure (per institute; ~1 day each)**
- [ ] **(you)** Atlas Flex or M10+ in Mumbai with automated backups; one database per institute
- [ ] **(you)** Vercel Pro project per institute (DEMO_MODE unset), custom domain, AUTH_URL
- [ ] `npm run setup:institute -- --confirm-remote --name … --email …` → the first admin signs in and changes the password
- [ ] Institute profile, GST, branches, batches and courses entered; staff and students imported
- [ ] Privacy notice placeholders filled; weekly `npm run backup` until Atlas backups are on

**G4. Pilot (2–4 weeks)**
- [ ] One institute; fees recorded by staff (gateway optional at first)
- [ ] Weekly check-in: bugs, missing workflows, speed; ship small fixes
- [ ] One restore drill during the pilot (`npm run restore` into a scratch database)
- [ ] Choose what to productionise next from real usage

### Stage H — Scale to many institutes (after 3–5 paying clients)
- [ ] One deployment for many institutes: tenant from the subdomain, one database per institute
- [ ] Super-admin console: create institutes, plans/limits, billing, usage
- [ ] Parent access (login or WhatsApp updates); SMS/WhatsApp provider with DLT registration
- [ ] Installable student app (PWA first)
- [ ] Hindi/regional-language labels on the student side

---

## 4. Module status map

| Module | Status |
|---|---|
| Student Management | **Working** (live DB) |
| Student Logins / sessions | **Working** (real sign-ins, immediate revocation) |
| Batches | **Working** |
| Courses (content + storefront) | **Working** |
| Attendance | **Working** |
| Test Management | **Working** (crown jewel) |
| Assignments + notifications | **Working** |
| Certificates | **Working** (stateless generator) |
| Finance (10 screens) | **Working** (student self-payment only in DEMO_MODE until a gateway exists) |
| Communications (5 screens) | **Working** (group chat saved; student replies and WhatsApp simulated) |
| Student Portal | **Working** (all widgets on live data) |
| Staff permissions + self-service | **Working** (CRUD, My Account, leave, payslips) |
| Leads + conversion | **Working** (live DB) |
| Online Admissions | **Working** (creates leads) |
| Admin dashboard home | **Working** (live aggregates) |
| Timetable / schedules | **Working** |
| Reports Hub | **Working** (19 live reports) |
| Task Manager · Form Builder · Master Data · Settings | **Working** |
| Multi-branch | **Working** (students, finance, dashboard scoped) |
| Payroll · Leave Management | **Working** (payroll is a simulator) |

---

## 5. Security baseline

- [x] ~~Passwords hashed with bcrypt (cost 12)~~
- [x] ~~JWT cookie httpOnly + SameSite=Lax, secure over HTTPS, 7-day expiry~~
- [x] ~~`requireRole()` on every server action and layout; `proxy.ts` is redirect UX only~~
- [x] ~~Every request re-checks session + user in the DB (Block / Force logout apply immediately)~~
- [x] ~~Login gate: only the rate-limited login action can authenticate~~
- [x] ~~Admin-only routes and actions separated from staff~~
- [x] ~~Zod validation on server inputs~~
- [x] ~~Login rate limit + lockout; anti user-enumeration~~
- [x] ~~Secrets only in env; `.env` gitignored; `.env.example` committed~~
- [x] ~~Security headers (CSP, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)~~
- [x] ~~Per-student credentials on import + forced first-login change~~
- [x] ~~DTO projection audit (no password hashes / lockout data / answer keys to the client)~~
- [x] ~~Students restricted to their own batch's tests~~
- [x] ~~Post-login redirect limited to the user's own portal (no open redirect)~~
- [ ] Mask ID-proof numbers in admin views (needs an "unchanged" edit flow first)
- [x] ~~Distributed rate limiting~~ (MongoDB TTL collection)
- [x] ~~Audit log for admin actions~~ (money, accounts, students, tests, grading, settings, data export/erase)
- [x] ~~Strict CSP~~ (per-request nonce; no `unsafe-inline`/`unsafe-eval` for scripts in production)
- [x] ~~Backups + restore drill~~ (`npm run backup` / `restore`, tested); Atlas automated backups need a paid tier **(you)**
- [x] ~~Demo features (one-click logins, Reset, self-payment, scripted chat) off unless DEMO_MODE=true~~
- [ ] Uploads: limits, object storage, signed URLs (Stage G)
- [ ] Error monitoring and alerting (Stage G)

---

## 6. Definition of done (demo day)

One-click Admin login → every sidebar module does something visible → a
**lead converts to a student** → the student takes an MCQ test and is
auto-scored → a written answer is graded → a certificate is generated →
**Reset demo data** → clean state for the next client. Build green, live link up.

✅ **Met (2026-10-23).** The story runs end to end, is checked by the e2e suite
on every push, and the live link is up: https://aura-edu-eight.vercel.app
(`docs/DEMO_SCRIPT.md`, `docs/DEMO_DAY_CHECKLIST.md`, `docs/DEPLOYMENT.md`).

---

## 7. Working rules & critical context

- **Next.js 16 is not the Next.js from training data.** Read
  `node_modules/next/dist/docs/` before writing code. Confirmed gotchas:
  `middleware.ts` is `proxy.ts`; `cookies()` / `headers()` are async; server
  actions are public endpoints and must call `requireRole()` themselves; a
  `route.ts` can't share a path with a `page.tsx`; forms use `useActionState`.
- **Auth:** `requireRole()` / `requireAdminPage()` in `lib/dal.ts` are the
  only gates. Admin-only routes live in `lib/permissions.ts`. Take the user id
  from the session, never from the client.
- **Data:** schema first, then screens. A new module gets a new collection,
  never a rewrite. Every money or account mutation writes an `AuditLog` row.
- **Gate:** `npx tsc --noEmit` + `npm run lint` + `npm run build` must pass
  before any merge.
- **Git:** one branch per feature, PR into `main`, one commit per logical change.
- **Local dev:** `npm run mongo` → `npm run seed` → `npm run dev`. The DB name
  is `auraedu`. **Careful:** the local `.env` currently points at the live Atlas
  database; switch `MONGODB_URI` back to the commented local line before
  developing, or local changes edit the live demo.
- **Commits:** authored as the repo owner (Nikhil Raghuwanshi, GitHub no-reply
  email). Vercel Hobby blocks deploys whose author it can't match.
- Demo from the live link once it exists; every module gets a 5-minute demo script.

---

## 8. Decisions needed from you

1. ~~Hosting accounts~~: done (Atlas + Vercel + GitHub).
2. ~~Grading~~: admins and staff; an admin can lock staff out.
3. **First pilot institute:** who, and which modules they actually use. This
   decides what Stage G builds first.
4. **Vercel plan:** Hobby is for personal, non-commercial use. Before a paying
   client, run their deployment on Vercel **Pro**.
5. **Atlas tier and region** for real data: Flex or M10+ (automated backups),
   in Mumbai (Indian student data stays in India).
6. **Providers when Stage G starts:** payments (Razorpay), email (Resend or
   SES), error monitoring (Sentry), file storage (Cloudflare R2), a domain.
7. **Privacy notice:** fill in the retention years and data region.
8. **Pricing model** (per student / per branch / yearly licence); it decides
   whether usage needs metering.

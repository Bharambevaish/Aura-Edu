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

## 1. Snapshot (2026-10-13, after Stage A code work)

| Area | Status |
|---|---|
| Foundation (auth, DB, seed, UI kit, security headers) | ✅ Done |
| Live-DB modules | ✅ Students, Student Logins, Batches, Courses, Attendance, Tests, Assignments, Certificates, Finance (10 screens), Communications (5 screens) |
| Student portal | ✅ Own profile, fees + pay, courses, store, tests, assignments, attendance · ⚠️ a few widgets still on demo data |
| Phase 1 security & core fixes | ✅ Done on branch `phase1-security` |
| Stage A close-out | ✅ Code items done on branch `stage-a-closeout` · ⏳ owner items: history purge, new remote, PR merge, branch protection |
| Demo-story gaps | ❌ Leads + lead→student conversion, Online Admissions backend, live admin dashboard |
| Static-UI modules | ❌ Timetable, Reports, Task Manager, Form Builder, Settings, Master Data, Multi-branch |
| Not built at all | ❌ Payroll, Leave Management, staff self-service |
| Deployment | ❌ No Atlas, no Vercel link · ✅ CI workflow written (runs once a GitHub remote exists) |

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
| **F. Productionize (per client)** | Turn chosen modules into a real product | Only for modules a client signs for | per module |

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

### Stage A — Close out Phase 1 (code done on branch `stage-a-closeout`)
- [ ] **(you)** Purge the old git history locally: delete `refs/original/*`, remove the `origin` remote, expire the reflog, `git gc` (exact commands in the Phase 1 report)
- [ ] **(you)** Choose the new git remote (your own GitHub repo) and push `main`, `phase1-security`, `stage-a-closeout`
- [ ] **(you)** Merge `phase1-security` then `stage-a-closeout` → `main` through PRs; turn on branch protection requiring the CI check
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

### Stage B — Go live early (1–2 days)
- [ ] **(you)** MongoDB Atlas cluster, DB user, network access; enable backups
- [ ] **(you)** Vercel project; set `MONGODB_URI`, `AUTH_SECRET` (fresh), `AUTH_URL`
- [ ] Replace the in-memory login rate limiter with a shared store (Upstash Redis or a Mongo TTL collection). It doesn't work across serverless instances
- [ ] Seed the live DB; smoke-test the one-click logins, a student payment, Block, and Reset on the live link
- [ ] Decide demo delivery: live link (recommended) vs laptop **(you)**

### Stage C — Complete the demo story (~1 week)
- [ ] **Leads:** `Lead` model (source, status pipeline, notes), list/filter/create/update actions, wire `lms/leads`
- [ ] **Lead → student conversion:** one action creates the student user, invoice and batch assignment, then marks the lead converted (the headline "wow")
- [ ] **Online Admissions:** wire the `/register` wizard to a rate-limited, Zod-validated action that creates a lead (status `applied`)
- [ ] **Live admin dashboard home:** real counts (students, collections, outstanding, attendance %, pass rate, pending approvals) instead of static numbers
- [ ] **Student portal leftovers on demo data:** notification bell feed, dashboard "Recent Test Score" / "Upcoming Tests" / certificate count, Certificates list, Schedule page
- [ ] **Lesson progress:** progress model + working "Mark Complete" + real % on My Courses
- [ ] **Decide (you):** who grades written answers. The Definition of Done says "admin grades", but the code allows staff only
- [ ] Remove dead links: "Forgot Password?" (`#`) and footer Privacy Policy (`/privacy-policy` has no page)
- [ ] Write the 5-minute demo script for the full story

### Stage D — Breadth sweep (1–2 weeks)
- [ ] **Timetable / schedules:** per-batch slots model → admin date-wise, batch and meeting schedules → student Schedule page
- [ ] **Reports:** Reports Hub charts from real aggregates (fees, attendance, results, enrollments); retire "Legacy Reports" or wire it
- [ ] **Staff experience:**
  - [ ] Staff CRUD in Staff Corner
  - [ ] Assign staff to batches/courses
  - [ ] Staff see "my batches" first
  - [ ] Staff profile and password change
- [ ] **Settings that matter:** institute profile and invoice/tax config that actually feed invoices; Permissions page reflecting `lib/permissions.ts`
- [ ] **Internal Task Manager:** `Task` model + Kanban CRUD
- [ ] **Salary & Payroll simulator:** inputs → computed payslip, printable
- [ ] **Leave Management:** staff request → admin approve
- [ ] **Multi-branch:** branch switcher that scopes students, finance and dashboards
- [ ] **Embeddable Form Builder:** persisted form schema + live preview (+ submissions feeding leads)
- [ ] **Master Data Center** wired to real lookups (courses, categories, branches)
- [ ] Audit log for non-finance admin actions (student CRUD, block/logout, batch moves, test publish)
- [ ] Connect scripted chat / WhatsApp simulation

### Stage E — Harden & polish (~1 week)
- [ ] Playwright e2e test of the full demo story (§6) running in CI
- [ ] Unit tests for MCQ grading, finance math (balances, refunds, waivers) and the session/permission gates
- [ ] Tighten CSP (nonces; drop `unsafe-eval` in production)
- [ ] Mobile responsiveness pass (admin and student)
- [ ] Performance pass (slow pages, indexes, N+1 queries)
- [ ] Richer seed data (20+ students, more history) for fuller charts
- [ ] Demo-day checklist: one-click login, reset, tour path through the wow modules

### Stage F — Productionize (only for modules a client buys)
- [ ] File uploads to object storage (assignment attachments, avatars) with size/type limits and signed URLs
- [ ] Real credential/notification delivery (email provider; SMS/WhatsApp later)
- [ ] Payment gateway for student fees and course store (currently simulated checkout)
- [ ] Password reset by email
- [ ] Backup restore drill before any real data
- [ ] Data retention / privacy policy page; DPDP-style consent for student data

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
| Finance (10 screens) | **Working** (one admin payment bug, Stage A) |
| Communications (5 screens) | **Working** (chat simulated) |
| Student Portal | **Working** (some widgets on demo data, Stage C) |
| Staff permissions | **Working** · staff CRUD/self-service pending (Stage D) |
| Leads + conversion | Pending (Stage C) |
| Online Admissions | UI only (Stage C) |
| Admin dashboard home | Static (Stage C) |
| Timetable / schedules | Static (Stage D) |
| Reports | Static (Stage D) |
| Task Manager · Form Builder · Master Data · Settings | Static (Stage D) |
| Multi-branch | Not built (Stage D) |
| Payroll · Leave Management | Not built (Stage D) |

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
- [ ] Distributed rate limiting (Stage B)
- [ ] Audit log for all admin actions (Stage D)
- [ ] Strict CSP without `unsafe-eval` (Stage E)
- [ ] Uploads: limits, object storage, signed URLs (Stage F)
- [ ] Atlas backups + restore drill (Stage B / F)

---

## 6. Definition of done (demo day)

One-click Admin login → every sidebar module does something visible → a
**lead converts to a student** → the student takes an MCQ test and is
auto-scored → a written answer is graded → a certificate is generated →
**Reset demo data** → clean state for the next client. Build green, live link up.

Blocked today by: Leads + conversion (Stage C), the live link (Stage B), the
grading-role decision (Stage C), static modules (Stage D).

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
  is `auraedu`.
- Demo from the live link once it exists; every module gets a 5-minute demo script.

---

## 8. Decisions needed from you

1. **Hosting accounts:** Atlas + Vercel (Stage B), and the new git remote (Stage A).
2. **Target:** stay a sales-demo POC, or is there a client who has picked
   modules? A real client moves their modules to Stage F and skips most of D.
3. **Grading:** may admins grade written answers, or staff only?
4. **Email/SMS provider** (only when Stage F starts).

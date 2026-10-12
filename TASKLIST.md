# AuraEdu — POC Demo Platform (Sales Demo)

> **Mission:** A proof-of-concept web app for a coaching/institution management
> platform. Its only job is to impress potential clients with ~25 demonstrable
> modules so they choose which ones they want built for real. Speed to a
> demoable state matters more than production depth.

---

## 1. Critical context (read first, every session)

- **Framework: Next.js 16.3.5 + React 19 + TypeScript + Tailwind v4** (workspace root).
- **This is NOT the Next.js from training data.** APIs, conventions and file
  structure differ. Read the relevant guide in `node_modules/next/dist/docs/`
  **before writing any code**. Key gotchas already confirmed:
  - `middleware.ts` is now **`proxy.ts`** (project root).
  - `cookies()` / `headers()` are **async** (`await cookies()`).
  - Server Actions (`"use server"`) must be treated like public endpoints and do
    their own auth check.
  - A `route.ts` cannot exist at the same path as a `page.tsx` — API endpoints
    live under `app/api/*`.
  - Forms: React 19 `useActionState` + `<form action={...}>`.
- **Existing scaffold:** the repo already contains a large, polished admin
  dashboard UI (layouts, sidebar, branch switcher, dozens of admin screens) plus
  student portal, student registration and login pages — currently
  mock/UI-only. **Reusing this is the biggest speed lever. Verify with an
  inventory before rebuilding anything.**
- Scripts: `npm run dev` (local), `npm run build` (must stay green), `npm run
  lint`, `npm run start`.

## 2. Locked decisions

- **Stack:** full-stack Next.js (no separate Express server). MongoDB Atlas +
  Mongoose. TypeScript everywhere.
- **Auth:** use a battle-tested library (Auth.js / Better Auth), **never hand-roll
  crypto**. Password hashing: argon2id or bcrypt.
- **Sessions:** signed/encrypted cookie (jose), `httpOnly` + `Secure` +
  `SameSite=Lax`, short expiry, verified in a single Data Access Layer (DAL) on
  every action. `proxy.ts` used only for redirect UX, never as the only check.
- **Validation:** Zod on the server for every form/mutation.
- **Demo mode:** seeded fake data (20+ realistic students/staff), **one-click role
  login** ("Explore as Admin" / "Explore as Student"), and a **"Reset demo data"**
  button so every sales call starts clean.
- **Deployment:** live preview link on Vercel (free tier) so demos work anywhere.
- **Files/uploads:** object storage (S3/Blob) with provider-side encryption, not
  MongoDB.

## 3. Decisions (resolved)

- [x] Reuse the existing admin-dashboard scaffold — yes.
- [ ] Demo delivery: online/live link (recommended) vs offline laptop — still
      open (no Vercel deployment yet).
- [x] Auth library: **Auth.js v5** (Credentials + JWT) with a server-side
      session registry for revocation (`lib/session-registry.ts`).
- [x] `npm run build` + `npm run lint` + `npx tsc --noEmit` must pass before
      any merge.

## 4. Demo strategy — every module mapped to build depth

| Module | How we demo it | Depth |
|---|---|---|
| Student / Staff Management | Admin CRUD tables, search/filter, seeded data; staff vs admin permissions (`lib/permissions.ts`) | Students: **Working** (import/export + bulk). Staff: read-only roster |
| Course / Batch / Timetable | DB Course model behind ONE "Courses" admin page with two internal tabs: Content = curriculum tree (modules→lessons CRUD + reorder); Center = live storefront (published/paid/price/badge, enrolled count + revenue). 3 courses seeded w/ full curriculum. Timetable not built yet | **Working** (Course part) — Timetable pending |
| Attendance | Per-batch daily register: pick batch+date, mark P/A/Late grid, Mark-All + save, month strip, CSV, student-side live % | **Working** |
| Assignments | Online worksheet: student solves in-app, faculty marks + verdict + note, reminder notifications | **Working** |
| Batches | Cohorts with course/capacity/timeline; assign/move students (batch + course synced), delete refused while enrolled | **Working** |
| Online Admissions | Real multi-step form → creates record | Pending — `/register` is UI only |
| Lead Mgmt + Auto-Conversion | Leads table; "Convert" turns lead into student | Pending — static table, no Lead model |
| Certificate Generator | Stateless PDF generator: pick student (from live record), choose template, live preview, print-to-PDF A4 via `/certificates/render`; student portal downloads same route — nothing stored | **Working** |
| Salary & Payroll | Payslip simulator (inputs → computed) | Not built |
| Leave Management | Request from one demo account, approve from another | Not built |
| Fees Collection / Accounts | Full DB-backed Finance module (10 tabs): Expenses (create/approve/reject/void/delete), Expense Approvals queue, Vendors + Expense Categories CRUD, Overview (collected/outstanding/overdue/monthly bars/expense split), Payments (record w/ invoice picker, cancel reverts invoice), Invoices (auto-sync from active students + seed), Refunds (request→approve→process→complete, adjusts invoice), Waivers (request→approve/reject, adjusts invoice), Audit Trail (append-only log of every finance action). Financing law: admin+staff create/pay/waive/refund; admin-only approve/reject/void/delete/process. Seeded consistently with student-portal fee story (Aarav ₹10,001/<₹5,000 paid). | **Working — live DB** |
| Internal Task Manager | Kanban board, demo tasks | Static UI |
| Analytical Reports | Real charts from seed data | Static UI |
| Test Management (MCQ/written/proctoring) | Timer, MCQ auto-graded, admin grades written, proctoring tile | **Working (crown jewel)** |
| Notice & Communication | Admin authors broadcasts (targeted batch/staff) → one Notification row per student, live in the portal hub; notice board with category/audience filters, pin/important, deliver+read stats; groups page = broadcast-to-batch composer; calendar center (Month/Week/Day/Agenda, create/delete events); meetings scheduler + live list (join link, start/mark complete/cancel/delete); fan-out reads derived via aggregation; deliver/read derived from Notification rows; audit-logged | **Working — live DB** |
| Embeddable Form Builder | Drag-drop builder + live form preview | Static UI |
| Connect Suite (WhatsApp/Zoom/Live) | Meeting scheduler ✓, calendar events ✓, "Open Zoom" link ✓ (scripted chat still simulated) | Working core, chat simulated |
| Multi-Branch Management | Branch switcher that rescopes on-screen data | Not built (settings page static) |
| Student Portal | Signed-in student's profile, fees (pay own invoice), courses, store, tests, assignments, attendance | **Working — live DB** (some widgets still simulated) |

~7 working modules carry the demo; everything else is polished simulation on seed
data. That is a better demo than 25 half-broken modules.

## 5. Architecture

```
Browser → Vercel (Next.js 16 / Node)
  ├─ app/(marketing)         → Server Components, static/ISR (SEO)
  ├─ app/login, register     → Server Actions + session cookies
  ├─ app/student-portal      → auth-checked (tests, results)
  ├─ app/admin-dashboard     → admin RBAC (tests, blogs, students, grading)
  └─ app/api/*               → Route Handlers (client-fetch cases)
        → MongoDB Atlas (mongoose models + seed data)
        → Object storage (uploads, encrypted, private + signed URLs)
```

Organize code as: `lib/` (db, session, dal, validation), `actions/` (server
actions), `components/`, `app/` routes. Keep the DAL as the single place that
both fetches data **and** checks permissions.

## 6. Data model (collections)

**Built (23):** `users` (role admin|staff|student; student profile embedded) ·
`sessions` (sign-in registry, revocation) · `courses` (embedded modules →
lessons, `enrolledStudents`) · `batches` · `attendance` · `tests` ·
`questions` · `attempts` · `results` · `assignments` · `submissions` ·
`notifications` · `invoices` · `payments` · `refunds` · `waivers` ·
`expenses` · `expensecategories` · `vendors` · `auditlogs` · `notices` ·
`meetings` · `calendarevents`

**Planned, not built:** `leads` (status → auto-conversion) · `tasks` ·
`payroll` · `blogPosts` · `contentBlocks` · `timetable`

Rule: schema first, then screens. New module = new collection, never a rewrite.

## 7. Security baseline (do not skip for the POC)

- [x] Passwords hashed (bcrypt cost 12), never stored/transmitted in plain
- [x] Auth.js JWT session cookie: httpOnly + SameSite=Lax, secure over HTTPS,
  7-day expiry (no Session table needed for the POC)
- [x] Auth check via DAL (`requireRole`) on every Server Action / layout gate +
  edge `proxy.ts` (redirect UX only — never the sole check)
- [x] Session revocation: every request re-checks the session row + user
  (blocked / deleted / current role) in the DB, so Block and Force logout
  apply immediately
- [x] Login gate: Auth.js credentials callback only accepts attempts coming
  through the rate-limited `login` action
- [x] Role separation: admin-only routes + actions (`lib/permissions.ts`,
  `requireAdminPage()`); demo reset admin-only
- [x] Zod validation server-side on all input
- [x] Rate limiting + lockout on login (in-memory, 5/10 min → 15 min lock) +
  timing-safe anti user-enumeration (dummy bcrypt hash)
- [ ] DTO projection: never send passwordHash/PII/private URLs to the client
- [ ] Uploads: size/type limits → object storage, private + signed URLs
- [x] Secrets only in env vars; `.env` gitignored; `.env.example` committed
- [x] HTTPS everywhere (Vercel default) + security headers (CSP/nosniff/
  X-Frame-Options DENY/Referrer-Policy/Permissions-Policy/HSTS)
- [ ] Audit log for admin actions  (finance + connect + student-portal
  payments are audit-logged; student CRUD / block / batch moves are not yet)
- [ ] Distributed rate limiting (current limiter is in-memory, per instance)
- [ ] Imported students get a shared default password — generate per-student
  credentials + force change on first login
- [ ] Backups enabled (Atlas) — restore drill before any real data

## 8. Build phases (tasklist)

### Phase 0 — Setup & decisions
- [x] Resolve the open decisions above (except demo delivery / deployment)
- [x] Inventory existing scaffold (what to reuse vs rebuild)
- [ ] MongoDB Atlas cluster + connection string in `.env`  (local Mongo seeded; Atlas = config swap later)
- [x] Create seed-data strategy + realistic sample dataset
- [ ] Task board split of modules across the team

### Phase 1 — The shell
- [x] One-click role login (Admin / Student) + real auth wiring
- [x] Admin dashboard shell + student dashboard shell wired to auth
- [x] Demo banner + "Reset demo data" button
- [x] Auth hardening: bcrypt 12, rate-limit + lockout on login, anti user-
  enumeration, light login audit (lastLoginAt/failedAttempts/lockoutUntil),
  typed next-auth session, CSP/security headers, edge `proxy.ts` gate via
  `next-auth/jwt` (deployed checks done; see WORKLOG "Security Hardening")
- [ ] Deploy preview link live on Vercel  (blocked: need Vercel account/CLI)

### Phase 1b — Security & core fixes (2026-10-12, branch `phase1-security`)
- [x] Demo reset restricted to admins
- [x] Student portal loads the signed-in student's profile, fees, courses
- [x] Rebrand to AuraEdu; previous contributors anonymized in history
- [x] Immediate revocation on Block / Force logout / deletion; login gate
- [x] Student Logins shows real sign-in history (no seeded sessions)
- [x] Staff vs admin permissions (sidebar, route layouts, server actions)
- [x] Docs refreshed (`WORKLOG.md`, `TASKLIST.md`, `README.md`, `PROJECT_STATUS.md`)

### Phase 2 — Crown jewels (the wow)
- [x] Test Management: create tests (admin+staff; MCQ single/multi-correct +
  written), student takes exam under fullscreen lock with 3 tab-switch auto-
  submit, MCQ auto-grade, staff-only written grading, admin reports/test-cards
  (rebuilt end-to-end after the "Create Test was a dead stub / nothing to
  grade" feedback; lint + build + seed green; UX pass in progress)
- [x] Test Management dark-theme pass: all 5 admin test pages converted from
  the stale light theme to the glass-panel dark system — tests list, create
  wizard, per-test report, written grading, and test-cards (real View modal +
  grid/list toggle; wired the previously dead Course/Batch filter selects).
  Back-end untouched; `npx tsc`, `npm run lint`, `npm run build` green (66/66).
- [x] Create Test form UX: Subject/Course/Batch are now live autocompletes
  (`components/ui/Combobox.tsx`) populated from real students + past tests via
  new `getTestFormContext()` action — course-scoped batch filtering, student
  counts, custom batches allowed, duration presets, 40% pass-marks quick-fill,
  past-start guard. Server schema unchanged; tsc/lint/build green (66/66).
- [x] Test cards tab: accurate from seeded `results` — new
  `getAdminTestCardDetail(studentId)` per-student transcript (batch rank,
  %, PASSED/AT RISK, grade, percentile, grading-pending count); working Filter
  panel (name/email search + live batch select with counts), real pagination
  (9/page), full report-card View modal, and Download PDF now actually prints
  a light report card (`#print-card` + `@media print` CSS). No seed changes;
  tsc/lint/build green (66/66).
- [x] Assignments module (online worksheet + reminder notifications): 3 new
  collections (`Assignment` with embedded questions, `Submission` 1-per-student,
  `Notification` per-user feed) + `lib/validation.ts` schemas +
  `lib/actions/assignments.ts` (admin overview/detail/review; student
  list/solve/submit; notifications list/read). Seeds: 6 worksheets across
  NEET/JEE batches at varying statuses, mixed pending_review/reviewed
  submissions, and the legacy hub notifications re-seeded as real docs +
  genuine assignment reminders. Admin: dark-glass list with real stats, detail
  modal with in-drawer grading (marks + verdict + short note). Create page:
  real one-screen form reusing Combobox + `getTestFormContext`, total = sum of
  question marks, publish pushes a reminder Notification to every student in
  the batch. Student: DB-backed list with Pending/Overdue/Submitted/Reviewed
  states, new solve route `student-portal/assignments/[assignmentId]` (answer
  all → submit → pending_review → reviewed feedback), Notifications Hub +
  dashboard pending count now read the DB. tsc/lint/build green (66/66).
- [x] Batches module: new `Batch` model (name unique, course, capacity, dates,
  description — status derives from dates at read time) + `CreateBatchSchema`
  (`end > start`) + `lib/actions/batches.ts` (role-gated: list with real stats
  incl. unassigned/orphan, detail with roster + assignable pool, create/update,
  assign — sets batch AND course on students — remove, delete refused while
  enrolled). `seedDemoBatches()` upserts the 4 batches matching the student
  batch strings (NEET A/B, JEE A, Python). Admin pages: dead static stubs →
  dark-glass list with search + derived Status pills + Overfull flags, real
  StatCard grid, Overview/Students tabs (roster with assign/move/remove),
  working Create form (course Combobox + type=date), Edit modal (rename/
  course-change propagates to enrolled students), guarded Delete confirm.
  Assign modal segmented: Unassigned (default, green) vs "In another batch"
  (collapsed, amber, explicit MOVE copy) to avoid confusion when most students
  are already in a seed batch. `getBatches()` auto-syncs: student batch strings
  without a matching `Batch` doc get one created at read time (derived course/
  dates), so batches the seed assigns are always visible without a re-seed.
  tsc/lint/build green (66/66).
- [x] Student Management (LMS Student Corner): full CRUD on the real `users`
  collection (role: student) — 4-step add/edit wizard, profile view modal,
  delete, search/filters/sort/pagination, Excel/CSV template download, import
  (upsert by email), export (.xlsx), bulk Assign Branch/Course/Batch, bulk
  Generate Login (one-time creds) + simulated Send Credentials, headlime stats.
  Uses `xlsx` (SheetJS) client-side; User model + seed extended with student
  profile fields (see WORKLOG "Student Corner")
- [x] Student Logins (session management): real login/session registry — new
  `sessions` collection, blocked-account support (`isBlocked`), live metrics
  (active/multi-device/blocked/total), grid + list views, Devices modal with
  per-device sign-out, Block/Unblock, force logout, export. Auth kept BASIC for
  the demo (seeded sessions; no device capture/session-doc at login; Block
  grounds signed-out logins only) — see WORKLOG "Demo stabilization"
- [ ] Online Admissions multi-step form (UI exists; no backend)
- [ ] Lead Management + auto-conversion (lead → student) — next up
- [x] Certificate generator: **stateless PDF generator** (rev. 2 — no storage).
  `getCertificateOptions()` feeds the admin Generate page (live student search
  w/ auto-filled course, template picker, issue date, real-time preview); the
  print-to-PDF A4 route at `/certificates/render` is query-param driven
  (`?student&course&batch&template&date&credential`) and renders the sheet on
  demand. Admin Certificate Center is a template showcase (3 designs with
  mockups); student portal list stays context-driven and downloads the same
  render route. Deliberately stateless for the demo — nothing is stored/issued,
  just downloaded. See WORKLOG "Certificates module — stateless PDF generator (rev 2)".

### Phase 3 — The sweep (simulation)
- [x] Admin codebase reorganization: URLs mirror sidebar groups
  (`lms/*`, `finance/*`, `connect`, `reports`, `administration/*`,
  `settings/*`), shared `components/ui/` kit + glass-panel theme on all admin
  pages, `lib/` split by audience (actions/tests/*, services/tests,
  actions/demo, actions/staff), Staff Corner page resurrected (see WORKLOG
  "Admin panel reorganization")
- [x] Students CRUD on seed data (Student Corner — Phase 2). Batches, Assignments and
  Attendance are real DB modules (Phase 2 additions) — only staff/courses CRUD simulation
  remains in this sweep.
- [x] Fees + accounts (Finance module, live DB)
- [ ] Payroll simulator
- [x] Notices / broadcasts (live DB)
- [ ] Task manager, form builder, reports/charts (static UI)
- [x] Connect scheduler, calendar, meeting links (live DB)
- [ ] Connect scripted chat / WhatsApp
- [ ] Multi-branch switcher

### Phase 4 — Demo-day polish
- [ ] Rich realistic seed data
- [ ] Mobile responsiveness pass
- [ ] Performance + build green
- [ ] Demo checklist (login 1-click, reset, tour path through the wow modules)

## 9. Team workflow

- Git: `main` protected (via PRs); one branch per module/feature.
- Gate: `npm run lint` + `npm run build` pass before merge — always.
- Demo everywhere from the live/staging link, never from a laptop only.
- Every module gets a 5-minute demo script once done.

## 10. Definition of done (demo day)

One-click Admin login → navigate any of the 25 modules → each does something
visible → lead converts to student → student takes an MCQ test, gets auto-scored
→ admin grades a written answer → certificate generated → reset button → clean
state for the next client. Build green, live link up.
# Coaching Software - Project Status Report

> **Repo:** AuraEdu codebase as imported from the original upstream repository (branch `main`, 7 commits at time of audit)
> **Audit date:** 2026-10-12
> **Method:** I read the docs (`README.md`, `TASKLIST.md`, `WORKLOG.md`, `AGENTS.md`, `.env.example`), then checked their claims against the source: auth, `proxy.ts`, the DAL, all 23 Mongoose models, every server-action file, and every page route (to tell DB-backed pages from static mock-ups).
> **Not done in this audit:** `npm install` / `npm run build` / `npm run lint` were **not** run, and no live MongoDB was available. The docs say the build is green (66/66 routes), but I have not confirmed that.

---

> **Update 2026-10-12 — Phase 1 (Security & Core Fixes) complete** on branch `phase1-security`:
> demo reset admin-only; student portal shows the signed-in student's own profile, fees and courses;
> rebrand to AuraEdu; Block / Force logout revoke sessions immediately; Student Logins shows real
> sign-ins; staff and admin permissions separated; docs refreshed. Items fixed are ticked below with
> a ✅ note; the original audit text is kept for context. See `WORKLOG.md` → "Phase 1".

## 1. Project Overview & Architecture

### Executive summary
**AuraEdu** is a coaching-institute management platform, built as a **proof-of-concept and sales demo**. In the docs' own words, its job is to "impress potential clients with ~25 demonstrable modules so they choose which ones they want built for real." The strategy is deliberate: about 7 modules get genuine, database-backed depth, and the rest are polished UI on seeded data. The planned demo story is: one-click login → lead converts to student → student takes an MCQ test and is auto-scored → admin grades a written answer → certificate generated → "Reset demo data" → clean state for the next client.

In practice the backend has grown past the original 7. **Tests, Assignments, Attendance, Batches, Students, Student Logins, Courses, Certificates, Finance (10 tabs) and Connect/Communications** all run against the live DB. **Leads, Online Admissions, Forms, Tasks, Schedules, Reports, the Admin Dashboard home, Settings and Master data** are still static mock-ups.

### Tech stack (verified in `package.json`)
| Layer | Technology |
|---|---|
| Framework | **Next.js 16.3.5** (App Router; `middleware.ts` is now `proxy.ts`), **React 19.2**, TypeScript 5 |
| Styling / UI | Tailwind CSS v4, framer-motion, lucide-react, in-house `components/ui/` kit (Button, Modal, Toast, DataTable, Combobox, StatCard…) in a "glass-panel" dark theme |
| Backend | Full-stack Next.js: **Server Actions** (`lib/actions/*`, `"use server"`). There is no separate API server. The only route handler is `app/api/auth/[...nextauth]` |
| Database | **MongoDB + Mongoose 9**. Local dev uses `scripts/dev-mongo.mjs` (`mongodb-memory-server`); MongoDB Atlas is the planned live target (swap `MONGODB_URI` only) |
| Auth | **Auth.js / NextAuth v5 beta** Credentials provider, JWT session (7-day), **bcryptjs (cost 12)** |
| Validation | **Zod 4** (`lib/validation.ts`) on server inputs |
| Other | `xlsx` (SheetJS) for student import/export; print-to-PDF certificates via a print route |
| Deploy target | Vercel (planned; **not yet deployed**) |

### Architecture
```
Browser
  └─ proxy.ts (edge)       → redirects logged-out users away from /admin-dashboard and /student-portal (UX only)
  └─ app/(marketing)       → public landing page (Hero, Modules navigator, FAQ, Contact, Quote selector)
  └─ app/login, /register  → login (Server Action + rate limit) · registration wizard (UI only, no backend)
  └─ app/admin-dashboard   → layout gate requireRole(["admin","staff"])  — ~55 screens
  └─ app/student-portal    → layout gate requireRole(["student"])        — ~16 screens
  └─ app/(print)/certificates/render → A4 print-to-PDF certificate (any signed-in role)
        │
        ▼
  lib/dal.ts  requireRole()  ← single authorization choke point (called by layouts and server actions)
  lib/actions/*  (server actions, Zod-validated, most write AuditLog rows)
  lib/models/*   (23 Mongoose models) ← lib/seed/demo.ts (rich demo dataset, ~2,000 lines)
        │
        ▼
  MongoDB (local now → Atlas later)
```

### Database schema (23 collections that actually exist in `lib/models/`)
| Domain | Collections | Notes |
|---|---|---|
| Identity | `User`, `Session` | One `users` collection for **admin / staff / student** (role enum). Student profile fields are embedded (guardian, address, batch, course, branch, rollNo, admissionStatus…). Security fields: `isBlocked`, `failedAttempts`, `lockoutUntil`, `lastLoginAt`, `lastDevice`, `isDemo`. `Session` = per-device sign-in registry (currently seeded only, see gaps) |
| Academics | `Course` (embedded modules → lessons, storefront fields), `Batch` (name unique, course, capacity, dates; status derived from dates), `Attendance` | Students link to batch/course by **name string**, not ObjectId |
| Assessment | `Test`, `Question` (mcq single/multi + written), `Attempt`, `Result` | MCQ auto-grade; written answers graded by staff |
| Coursework | `Assignment` (embedded questions), `Submission` (1 per student), `Notification` (per-user feed, `sourceId` back-link) | |
| Finance | `Invoice`, `Payment`, `Refund`, `Waiver`, `Expense`, `ExpenseCategory`, `Vendor`, `AuditLog` | Append-only audit trail |
| Communications | `Notice` (audience: all / batches / staff), `Meeting`, `CalendarEvent` | Notices fan out to one `Notification` row per student |

**Collections planned in `TASKLIST.md` §6 but not created:** `leads`, `students`/`staff` (folded into `users`), `blogPosts`, `contentBlocks`, `tasks`, `fees` (became `Invoice`), `payroll`. The `Certificate`, `Enrollment` and `CourseCenter` models described in `WORKLOG.md` **do not exist** in the code either.

### How the roles interact
| Role | Entry point | What they can do (as enforced by server actions) |
|---|---|---|
| **Admin** | `/admin-dashboard` | Everything staff can do, plus **admin-only** actions: approve/reject/void/delete expenses; approve/reject/process refunds and waivers; delete notices/meetings/calendar events; delete courses; view the Staff Corner roster |
| **Staff** | Shares `/admin-dashboard` with Admin. **There is no separate staff portal** | Create/manage students, batches, courses, tests, assignments, attendance; record payments; create expenses, refunds and waivers; send broadcasts; block or force-logout students. **Staff alone can grade written test answers** (`grading.ts` is `requireRole(["staff"])`; admins can view reports but cannot grade) |
| **Student** | `/student-portal` | Take tests (fullscreen lock, auto-submit after 3 tab switches), solve/submit assignments, view live attendance, read the notifications hub, download certificates. Other screens show demo data |

Data flow between roles: admin/staff publish tests, assignments and notices → each generates `Notification` rows → students see them in the hub with deep links → student submissions/attempts → staff grade → students see results and feedback. Finance actions by staff stay pending until an admin approves them, and every step is written to `AuditLog`.

**Demo credentials** (public by design, hard-coded on the login page with one-click buttons): `admin@demo.auraedu.com`, `staff@demo.auraedu.com`, `student@demo.auraedu.com`, plus 10 more seeded students.

---

## 2. Portal-by-Portal Feature Matrix

### Admin Portal
* **Completed (live DB, server-validated, role-gated):**
  * **Auth shell:** Auth.js login with one-click demo buttons, layout gate, demo banner with "Reset demo data", sidebar/header shell
  * **Student Corner (`lms/students`):** full CRUD on student users; 4-step add/edit wizard; profile modal; search/filter/sort/pagination; Excel/CSV template download; import (upsert by email) and `.xlsx` export; bulk assign branch/course/batch; bulk Generate Login (one-time credentials)
  * **Student Logins:** session registry UI; active/multi-device/blocked metrics; devices modal; block/unblock; force logout; export
  * **Batches:** create/edit/delete (delete refused while students are enrolled); assign/move/remove students (keeps batch and course in sync); status derived from dates; over-capacity flags; auto-creates missing batch docs at read time
  * **Courses:** list, create, detail with a **Content** tab (modules → lessons CRUD and reorder) and a **Course Center** tab (published/paid/price/badge, enrolled count, revenue); 3 seeded courses with full curricula
  * **Attendance:** per-batch daily register (P/A/Late), Mark-All, save, month strip, CSV export
  * **Tests ("crown jewel"):** create wizard (MCQ single/multi-correct + written, live comboboxes for subject/course/batch, duration presets, pass-mark quick-fill); tests list; per-test report; attempt view; written-answer grading screen; **Test Cards** (per-student transcript, rank, percentile, grade, filter, pagination, print-to-PDF)
  * **Assignments:** create online worksheet (publishing sends a reminder notification to every student in the batch); list with stats; detail drawer with grading (marks + verdict + note)
  * **Certificates:** stateless generator (live student search, auto-filled course, 3 templates, live preview, A4 print-to-PDF); template showcase
  * **Finance (10 screens):** Overview (collected/outstanding/overdue, monthly bars, expense split), Invoices (auto-synced from active students), Payments (record against an invoice; cancel reverts it), Expenses (+ create), Expense Approvals, Expense Categories, Vendors, Refunds (request → approve → process → complete), Waivers, Audit Trail
  * **Connect / Communications:** dashboard; Broadcasts/Notices (targeted to all students, batches or staff; pin/important; delivered/read stats); Groups (broadcast-to-batch composer); Meetings (tabs, start/complete/cancel/delete, copy join link) + Schedule form; Calendar (Month/Week/Day/Agenda, create/delete events)
  * **Staff Corner:** read-only staff roster from `users` (admin only)
* **Pending / Incomplete:**
  * **Lead Management + auto-conversion** (`lms/leads`): static hard-coded array; no `Lead` model, no "Convert to student" action. This is a headline demo step in the Definition of Done
  * **Online Admissions:** `/register` wizard is UI-only (no server action, no record created)
  * **Admin Dashboard home** (`/admin-dashboard`): static stat array; not wired to the DB
  * **Analytical Reports** (`reports`, `reports/legacy`): static; not built from real data
  * **Internal Task Manager / Kanban** (`lms/tasks`): static UI, no `Task` model
  * **Embeddable Form Builder** (`lms/forms`, `forms/create`): static UI
  * **Schedules / Timetable** (`lms/schedules/batch`, `date-wise`, `meetings`): static; Timetable is explicitly "pending" in `TASKLIST.md`
  * **Master data** (`administration/master`): static
  * **Settings** (profile, branch, invoice, tax, **staff-permission**): all static. The Permissions page has no effect on access
  * **Multi-Branch switcher:** listed as "Working" in the module map but unchecked in Phase 3, and no branch-scoped queries exist
  * **Salary & Payroll simulator, Leave Management:** in the module map, but no pages or models exist
  * **Staff management CRUD:** roster is read-only (no create/edit/delete staff)
  * **Bulk "Send Credentials":** simulated only (no email/SMS)
  * **Connect scripted chat / WhatsApp:** simulated

### Student Portal
* **Completed (live DB):**
  * Auth-gated portal shell (sidebar, top header)
  * **Dashboard home:** pending-assignment counts etc. from server actions
  * **Tests:** list; intro; take the exam under **fullscreen lock with auto-submit after 3 tab switches**, timer, MCQ auto-graded on submit, written answers queued for staff
  * **Test Card:** results view
  * **Assignments:** list with Pending/Overdue/Submitted/Reviewed states; solve-and-submit route; view reviewer feedback
  * **Attendance:** live percentage and recent days via `getStudentAttendance()`
  * **Notifications Hub:** reads real `Notification` rows (assignments, notices) with deep links
  * **Certificate download:** uses the shared `/certificates/render` route
* **Pending / Incomplete:**
  * **Profile identity is hard-coded:** `StudentContext` is locked to the "Aarav Sharma" demo profile. **Any student who logs in sees Aarav's name, batch and profile data** on context-driven screens
  * **Fees:** reads a mock ledger from context, **not** the live Finance module (`Invoice`/`Payment`), so admin-side payments don't show up for students
  * **My Courses / Learn player / Course Store:** context mock data; "enroll" only changes client state. Not wired to the DB `Course` catalog, even though `getCourseCatalog()` exists
  * **Schedule:** context-derived; no timetable data source
  * **Profile → Manage:** edits only change client state, nothing is persisted
  * **Certificates list:** context-driven mock cards, not real issued records
  * No student self-registration (admissions) or password change/reset

### Staff Portal
* **Completed:**
  * The Staff role exists (`role: "staff"`), with a seeded demo account and a one-click "Explore as Staff" login
  * Staff log into the **shared Admin Dashboard** and pass `requireRole(["admin","staff"])` on most modules
  * **Staff-exclusive capability:** grading written test answers
  * Finance separation of duties: staff can create/pay/waive/refund; admin approval is required to finalize
* **Pending / Incomplete:**
  * **No dedicated Staff portal or staff-tailored UI.** The sidebar shows every admin link to staff, including links to admin-only actions that will redirect or fail
  * **No role-aware navigation:** the sidebar has no role filtering
  * **No staff-scoped data:** staff see all students/batches, not only their own
  * **Staff-permission settings page is decorative:** permissions are hard-coded in each action's `requireRole` list
  * **Over-broad staff rights:** staff can **delete students**, block/force-logout students, and bulk-reset student passwords
  * Missing staff self-service: leave requests, payslips, timetable and profile (Payroll and Leave modules were never built)

---

## 3. Completed Work (Global Checklist)

**Foundation & Security**
- [x] Next.js 16 + React 19 + TS + Tailwind v4 app scaffold; landing page with marketing sections
- [x] MongoDB/Mongoose connection singleton (`lib/db.ts`); local Mongo runner script; `.env.example` committed, `.env*` gitignored
- [x] Auth.js v5 Credentials login, JWT session cookie (httpOnly, SameSite=Lax, 7-day), typed session (`types/next-auth.d.ts`)
- [x] bcrypt (cost 12) password hashing; timing-safe dummy-hash check against user enumeration; generic error messages
- [x] Login rate limiting + lockout (5 fails / 10 min → 15 min lock, in-memory) and failure counters on the User doc
- [x] Blocked accounts refused at login (`isBlocked`)
- [x] Central DAL `requireRole()`; layout gates for admin (admin+staff) and student portals; edge `proxy.ts` redirect gate
- [x] Zod validation on server-action inputs
- [x] Security headers: CSP, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS (prod)
- [x] One-click role logins (Admin/Staff/Student), demo banner, "Reset demo data" button
- [x] Rich, consistent seed dataset (13 users, 4 batches, 3 courses, tests/attempts/results, assignments, attendance, finance, connect)
- [x] Finance and Connect `AuditLog` trail
- [x] Admin codebase reorganized: URLs mirror sidebar groups; shared `components/ui` kit; glass-panel theme

**Modules running on the live DB**
- [x] Student Management (CRUD, import/export, bulk actions, generate logins)
- [x] Student Logins / session management UI (block, force logout, devices)
- [x] Batches (CRUD, assign/move/remove, guarded delete)
- [x] Courses: Content (curriculum tree) + Course Center (storefront settings)
- [x] Attendance (admin register + student live view)
- [x] Test Management end-to-end (create → take under proctoring lock → MCQ auto-grade → staff written grading → reports → test cards → printable report card)
- [x] Assignments end-to-end (create → reminder notification → solve → submit → grade → feedback)
- [x] Certificate generator (stateless, print-to-PDF, shared by admin and student)
- [x] Finance: overview, invoices, payments, expenses + approvals, categories, vendors, refunds, waivers, audit trail
- [x] Connect: notices/broadcasts with fan-out and read stats, batch groups, meetings and scheduler, calendar
- [x] Student Notifications Hub on real data
- [x] Staff Corner roster (read-only)

---

## 4. Pending Work & Gaps (Global Checklist)

**🔴 Security / correctness defects (found in code review)**
- [x] **`resetDemoData()` has no auth check** (`lib/actions/demo.ts`). Server actions are public endpoints, so **anyone, including logged-out users, can wipe and re-seed the database.** Already flagged as a TODO in `WORKLOG.md` — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] **Blocking and force-logout don't end existing sessions.** `requireRole()` only decodes the JWT; it never checks `isBlocked` or `Session.active`. A blocked or force-logged-out user keeps access for up to 7 days. The code comments claim otherwise — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] **Login does not create `Session` docs.** The Student Logins screen only shows seeded sessions, and `sessionId` in the JWT type is unused — ✅ *fixed in Phase 1 (2026-10-12)*
- [ ] **Bulk import gives every imported student the same default password** `Student@123` (`students.ts` ~L535)
- [x] Staff have destructive rights over students: delete, block, force logout, mass credential regeneration — ✅ *fixed in Phase 1 (2026-10-12)*
- [ ] Rate limiter is in-memory with a `setInterval`, so it resets per serverless instance on Vercel and gives no real protection there
- [ ] CSP allows `'unsafe-eval'` and `'unsafe-inline'` in production; `X-Powered-By` is overwritten instead of disabled (`poweredByHeader: false`)
- [ ] `resetDemoData()` doesn't clear Batches, Courses, Attendance or Assignments directly (it relies on the seed functions), so data created by users may survive a "reset". Needs verification
- [ ] `TASKLIST.md` security items still open: DTO projection review (no passwordHash/PII to client), upload limits + object storage, admin-action audit log for non-finance modules, Atlas backups
- [ ] Admin `recordPayment` does not check that the chosen invoice belongs to the chosen student (a payment for student A can be applied to student B's invoice) — *found in Phase 1, not yet fixed*
- [ ] Other student-portal widgets still read demo context data: notification bell feed, dashboard "Recent Test Score", certificates list, some test/attendance fallbacks — *found in Phase 1*
- [ ] Lesson progress tracking does not exist (no model); "Mark Complete" in the Learn player is a no-op
- [ ] Login ignores `callbackUrl` (proxy sets it, login always redirects to the role's home)

**🟠 Core demo flow gaps**
- [ ] Lead Management + **auto-conversion lead → student** (needs model, actions, UI wiring)
- [ ] Online Admissions: `/register` wizard has no backend
- [x] Student portal identity is hard-coded to the Aarav demo profile instead of the logged-in user — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] Student Fees not connected to the live Finance module — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] Student My Courses, Course Store, Learn player and Profile edit not connected to the DB — ✅ *fixed in Phase 1 (2026-10-12)*
- [ ] Admin Dashboard home and Reports use static data
- [ ] Deployment: no Vercel preview link yet (blocked on account access); Atlas cluster not provisioned

**🟡 Modules still static or never built**
- [ ] Timetable / Schedules (batch, date-wise, meetings)
- [ ] Internal Task Manager (Kanban)
- [ ] Embeddable Form Builder
- [ ] Multi-branch switcher with branch-scoped data
- [ ] Salary & Payroll simulator, Leave Management (no pages exist)
- [ ] Settings: profile, branch, invoice, tax, staff-permission (all decorative)
- [ ] Master data administration
- [ ] Staff CRUD and a staff-specific experience (role-aware sidebar, own batches/classes)
- [ ] Credential delivery (email/SMS) for Send Credentials; WhatsApp/chat (simulated)
- [ ] File uploads (assignments, profile photos) via object storage

**⚪ Process / documentation**
- [x] Phase 0 open decisions not formally closed (reuse scaffold, delivery mode, auth library, build gate). In practice: scaffold reused, Auth.js chosen — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] `WORKLOG.md` is out of date: it cites paths (`app/admin-dashboard/tests/…`, `fees/…`, `batches/[batchId]`) and models (`Certificate`, `Enrollment`, `CourseCenter`, `lib/pdf/render.ts`) that no longer exist after the reorganization — ✅ *fixed in Phase 1 (2026-10-12)*
- [x] `TASKLIST.md` checkboxes lag behind: Finance and Connect are done but Phase 3 "Fees/Notices/Connect" are still unchecked — ✅ *fixed in Phase 1 (2026-10-12)*
- [ ] No automated tests of any kind (unit, integration or e2e); no CI pipeline; `main` has no PR workflow (single-author direct commits)
- [ ] Phase 4 polish: mobile responsiveness pass, performance pass, demo-day checklist and 5-minute demo scripts per module
- [x] Build and lint status not re-verified in this audit — ✅ *fixed in Phase 1 (2026-10-12)*

---

## 5. Next Task List & Execution Roadmap

### Phase 1: High Priority (Security, broken core features, user login fixes)
> **Status:** steps 1, 2, 3 and 5 done (plus the rebrand, real login history and a login-gate fix).
> Still open from this list: 4 (per-student import passwords), 6 (DTO audit), 7 (production
> readiness — Atlas, Vercel, distributed rate limit) and 8 (CI + branch protection).
1. **Lock down `resetDemoData()`:** add `await requireRole(["admin"])`, and optionally an env flag `DEMO_MODE=true` so it can't run in a real deployment. *(about 15 minutes; do this first)*
2. **Make block/logout take effect immediately:**
   1. Create a `Session` doc at login and put its `sessionId` in the JWT.
   2. Have `requireRole()` reject sessions that are inactive or expired, or whose user is blocked. To keep cost low, use a cached `findOne` per request.
   3. Delete the `Session` doc on logout.
   This makes the Student Logins screen reflect real logins.
3. **Fix student identity in the portal:** load the logged-in student's profile from `users` server-side and pass it into `StudentContext`, replacing the hard-coded Aarav profile. Verify with two different student logins.
4. **Credential hygiene:** generate a random password per imported student (reuse the `bulkGenerateLogins` logic) and require a password change on first login.
5. **Tighten the access model:**
   * Make `deleteStudent` and bulk credential reset admin-only.
   * Add role-aware filtering to `AdminSidebar` so staff don't see admin-only links.
   * Write a single role → permission map in `lib/dal.ts` to replace scattered role arrays (this becomes the backing for the Permissions settings page later).
6. **DTO audit:** grep every action's return shape to confirm no `passwordHash`, `failedAttempts` or similar fields reach the client.
7. **Production readiness:**
   * Provision MongoDB Atlas with backups and do a restore drill.
   * Deploy to Vercel and confirm `AUTH_SECRET`/`AUTH_URL` are set.
   * Move the rate limiter to Upstash Redis or a Mongo TTL collection.
   * Set `poweredByHeader: false`.
8. **Re-establish the quality gate:**
   * Run `npm install && npm run lint && npm run build`.
   * Add GitHub Actions CI running lint, typecheck and build.
   * Protect `main` and require PRs (as `TASKLIST.md` §9 specifies).

### Phase 2: Medium Priority (Portal features enhancement)
9. **Lead Management + auto-conversion** *(the headline "wow" in the Definition of Done)*:
   * Create a `Lead` model (status pipeline).
   * Add actions to list, create and update status, plus `convertLead()` → creates the student user, invoice and batch assignment.
   * Wire up `lms/leads/page.tsx`.
10. **Online Admissions:** wire the `/register` wizard to a rate-limited, Zod-validated action that creates a **Lead** (status `applied`) rather than a user account directly, which feeds step 9.
11. ✅ *(done in Phase 1)* **Student Fees ↔ Finance:** student Fees page reads that student's `Invoice`/`Payment`/`Waiver` rows (read-only DTO).
12. ✅ *(done in Phase 1)* **Student Courses ↔ Course catalog:** My Courses, Course Store and the Learn player read from `Course` via `getCourseCatalog()`/`getCourseDetail()`; store enrollment for real (an enrollment field or collection).
13. **Live Admin Dashboard and Reports:** replace the static stat arrays with aggregation actions (students, collections, attendance %, test pass rates, pending approvals).
14. **Timetable / Schedules:** `TimetableSlot` model per batch → admin schedule pages + student Schedule page.
15. **Staff experience:**
    * Staff CRUD in Staff Corner.
    * Assign staff to batches/courses.
    * Filter the dashboard and grading queue to "my batches".
    * Admins also need some way to grade, or a clear explanation in the UI of why they can't.
16. ✅ *(student side done in Phase 1)* **Profile management:** persist student profile edits (limited to allowed fields); password change for all roles.
17. **Audit logging** for non-finance admin actions (student CRUD, block/logout, batch moves, test publish).

### Phase 3: Low Priority (Nice-to-haves, polish)
18. Internal Task Manager (Kanban) with a `Task` model.
19. Multi-branch switcher with branch-scoped queries.
20. Salary & Payroll payslip simulator; Leave Management (request from one account, approve from another).
21. Embeddable Form Builder (drag-drop + preview, persisted schema).
22. Settings pages (institute profile, invoice/tax config feeding Finance; staff-permission UI backed by the step 5 permission map).
23. File uploads to object storage with signed URLs (assignment attachments, avatars).
24. Real credential delivery (email via Resend/SES; WhatsApp later); Connect chat.
25. Automated tests: unit tests for grading and finance math, and Playwright e2e for the Definition-of-Done demo path.
26. Mobile responsiveness and performance pass; tighten CSP (nonces, drop `unsafe-eval`).
27. Update the docs: refresh `WORKLOG.md` paths, sync the `TASKLIST.md` checkboxes, and write a 5-minute demo script per module plus a demo-day checklist.

---
*Originally generated from a static review of the repository source and documentation at the time of import; updated after Phase 1 (2026-10-12).*

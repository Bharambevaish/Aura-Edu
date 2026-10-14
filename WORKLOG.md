# WORKLOG — AuraEdu POC

Chronological record of material changes to the AuraEdu coaching suite POC.
Paths below are the **current** ones (the admin dashboard was reorganized so
URLs mirror sidebar groups — see "Admin panel reorganization"). For the plan
and open work see `TASKLIST.md`; for the latest audit see `PROJECT_STATUS.md`.

> Doc hygiene (2026-10-12): earlier entries in this file cited pre-
> reorganization paths and several files that never existed (e.g.
> `Certificate`/`Enrollment`/`CourseCenter` models, `lib/pdf/render.ts`,
> admin `fees/` and `timetable/` pages). They were corrected against the code.

---

## Foundation

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Full-stack
  Next.js: server actions in `lib/actions/*`, one route handler for Auth.js
  (`app/api/auth/[...nextauth]`) plus `app/session-ended`.
- `lib/db.ts` — Mongoose connection singleton; `MONGODB_URI` from env, database
  name `auraedu`. Local dev Mongo: `npm run mongo` (`scripts/dev-mongo.mjs`).
- Identity: a single `users` collection (`lib/models/User.ts`) with
  `role: admin | staff | student`; student profile fields embedded.
- Auth (Auth.js v5 Credentials, JWT cookie, bcrypt cost 12, rate limit +
  lockout in `lib/rate-limit.ts`, timing-safe dummy hash) in `auth.ts`,
  `lib/actions/auth.ts`; single gate `requireRole()` in `lib/dal.ts`; edge
  redirect-only gate `proxy.ts`; security headers in `next.config.ts`.
- Seed: `lib/seed/demo.ts` via `npm run seed` (`scripts/seed.ts`) and the
  admin "Reset demo data" button (`lib/actions/demo.ts`). Demo logins:
  `admin@ / staff@ / student@demo.auraedu.com` + 10 seeded students.
- Shared UI kit `components/ui/*`; admin shell `components/admin/shell/*`;
  student shell `components/student/*`; landing `components/landing/*` under
  `app/(marketing)`.

## Test Management (crown jewel)

- Models: `Test`, `Question` (mcq single/multi + written), `Attempt`, `Result`.
- Actions: `lib/actions/tests/admin-tests.ts` (list, test cards, attempts,
  card detail, form context, `createTest`), `lib/actions/tests/grading.ts`
  (written grading — **staff only**), `lib/actions/tests/student-tests.ts`
  (list, intro, start, submit with MCQ auto-grade); helpers in
  `lib/services/tests.ts`.
- Admin pages: `app/admin-dashboard/lms/students/tests/` (list, `create`,
  `[testId]` report, `attempts/[attemptId]` grading) and
  `lms/students/test-cards` (per-student transcript, printable report card).
- Student pages: `app/student-portal/tests/` and `tests/[testId]` (fullscreen
  lock, 3 tab-switch auto-submit, timer), `student-portal/test-card`.

## Assignments + notifications

- Models: `Assignment` (embedded questions), `Submission` (one per student),
  `Notification` (per-user feed, `sourceId` back-link).
- Actions `lib/actions/assignments.ts`: `getAssignmentsOverview`,
  `getAssignmentDetail`, `createAssignment` (fans out reminder notifications to
  the batch), `reviewSubmission`, `getStudentAssignments`,
  `getAssignmentWorksheet`, `submitAssignment`, notification read/list actions.
- Pages: admin `lms/students/assignments` (+ `create`); student
  `student-portal/assignments` (+ `[assignmentId]` solve route) and the
  `student-portal/notifications` hub.

## Batches

- Model `Batch` (name unique, course, capacity, dates; status derived).
- Actions `lib/actions/batches.ts`: `getBatches` (auto-creates docs for batch
  strings found on students), `getBatchDetail`, `createBatch`, `updateBatch`
  (rename/course change propagates to students), `assignStudentsToBatch`,
  `removeStudentFromBatch`, `deleteBatch` (refused while enrolled).
- Pages: `lms/students/batches` (+ `create`).

## Attendance

- Model `Attendance`; actions `lib/actions/attendance.ts`:
  `getAttendanceOverview`, `getAttendanceRegister`, `saveAttendanceRegister`,
  `getStudentAttendance`.
- Pages: admin `lms/students/attendance` (P/A/Late grid, Mark-All, month
  strip, CSV); student `student-portal/attendance` (live %).

## Student Corner + Student Logins

- `lib/actions/students.ts`: CRUD on student users, 4-step wizard, import
  (upsert by email) / export (.xlsx via SheetJS), bulk assign, bulk Generate
  Login (one-time credentials), simulated Send Credentials.
- `lib/actions/logins.ts` + `lms/students/logins`: per-student session list,
  Block / Unblock, sign out one device / all devices, export. (Since
  2026-10-12 backed by real sign-ins — see Phase 1 below.)

## Certificates (stateless generator)

- `lib/actions/certificates.ts` `getCertificateOptions` + `lib/certificates.ts`
  (templates). Admin `lms/students/certificates` (template showcase) and
  `certificates/generate` (live student search, template picker, preview).
- Print route `app/(print)/certificates/render` renders an A4 sheet from query
  params and opens print-to-PDF; shared by admin and student. Nothing stored.

## Courses (Content + Course Center)

- Model `Course` (embedded modules → lessons, storefront fields,
  `enrolledStudents`). Actions `lib/actions/courses.ts` (content CRUD +
  reorder, catalog, roster, store settings).
- Pages: `lms/courses` (list), `lms/courses/create`, `lms/courses/[courseId]`
  with `components/admin/lms/courses/CourseContentTab.tsx` and
  `CourseCenterTab.tsx`.

## Finance (live DB)

- Models: `Invoice`, `Payment`, `Refund`, `Waiver`, `Expense`,
  `ExpenseCategory`, `Vendor`, `AuditLog`. Actions `lib/actions/finance.ts`;
  every mutation writes an `AuditLog` row. Staff create/pay/waive/refund;
  admin approves/rejects/voids/deletes/processes.
- Pages under `app/admin-dashboard/finance/`: `overview`, `expenses`
  (+ `create`), `expense-approvals`, `expense-categories`, `vendors`,
  `payments`, `invoices`, `refunds`, `waivers`, `audit-trail`.
- Seed `seedDemoFinance()`: 8 invoices, 7 payments, refunds, waivers, expenses.

## Communications / Connect (live DB)

- Models `Notice` (audience all / batches / staff), `Meeting`,
  `CalendarEvent`; notices fan out one `Notification` per student.
- Actions `lib/actions/connect.ts`: notices (+ stats, pin, delete), batch
  broadcasts, meetings (create/list/status/delete), calendar events,
  `getConnectOverview`.
- Pages under `app/admin-dashboard/connect/`: dashboard, `notices`, `groups`,
  `meetings` (+ `schedule`), `calendar` (Month/Week/Day/Agenda).

## Admin panel reorganization

- URLs mirror sidebar groups: `lms/*`, `finance/*`, `connect/*`, `reports`,
  `administration/*`, `settings/*`. Glass-panel dark theme across admin pages.

---

## Phase 1 — Security & core fixes (2026-10-12)

Branch `phase1-security`. One commit per item.

1. **Demo reset locked to admins** — `resetDemoData()` had no auth check (a
   public endpoint that wipes the DB). Now `requireRole(["admin"])`; the
   Reset button is shown to admins only (`components/DemoBanner.tsx`).
2. **Student portal shows the signed-in student** — the portal was hard-coded
   to one demo profile. `app/student-portal/layout.tsx` loads the profile and
   fee balance server-side; new `lib/actions/student-portal.ts`
   (`getMyProfile`, `updateMyProfile`, `changeMyPassword`, `getMyCourses`,
   `getMyCourse`, `getCourseStore`, `enrollInCourse`) and
   `getMyFees` / `payMyInvoice` in `lib/actions/finance.ts`. Fees, My Courses,
   Learn player, Course Store, Profile and dashboard rewired. Student id always
   comes from the session.
3. **Rebrand to AuraEdu** (from the previous product name) — copy, landing, seed domains
   (`demo.auraedu.com`), certificate ids, meeting links, DB name `auraedu`,
   `WhyAuraEdu` component, logo monograms. Previous contributors' identities
   were anonymized in git history.
4. **Immediate session revocation** — new `lib/session-registry.ts`: every
   sign-in writes a `sessions` row (device, IP, expiry) and the JWT carries its
   `sessionId`. `requireRole()` re-checks the session and the user (blocked,
   deleted, current role) in the DB on every request (memoized per request,
   throttled `lastSeenAt` heartbeat). Revoked users go to `/session-ended`
   (clears cookie) → `/login?reason=session-ended`. Logout ends the row.
   `authorize()` now requires a secret-derived gate token only the
   rate-limited `login` action supplies (closes a brute-force bypass via
   `POST /api/auth/callback/credentials`). Reset keeps demo user ids stable
   and the caller's own session.
5. **Real login history** — the seed no longer fabricates sessions; it only
   pre-blocks two demo students and resets demo login state.
6. **Staff vs admin permissions** — `lib/permissions.ts` lists admin-only
   routes (Student Logins, Expense Approvals, Audit Trail, Administration,
   Settings). Sidebar filters by role; each section has a server `layout.tsx`
   calling `requireAdminPage()`; the actions behind them plus `deleteStudent`
   and bulk credential actions require admin; Student Corner hides those
   buttons for staff (`components/admin/shell/AdminUserContext.tsx`).
7. **Docs** — this file, `TASKLIST.md`, `README.md`, `PROJECT_STATUS.md`.

**Verification (local, isolated in-memory Mongo):** `tsc`, `eslint`,
`next build` green after each item. Browser + curl checks: two different
students see their own profile/fees/courses; a non-enrolled course URL is
refused; a student payment updates the invoice, receipt and audit log; Block
and "Sign out all devices" cut off a live session on its next request; a
blocked user cannot sign back in; direct Auth.js callback without the gate is
rejected; Student Logins lists only real sign-ins; staff cannot see or open
admin-only sections (direct URL redirects with a notice); Reset keeps the
admin signed in.

## Stage A — Phase 1 close-out (2026-10-13)

Branch `stage-a-closeout` (from `phase1-security`), one commit per item:

- **Record Payment ownership** — `recordPayment` now requires the invoice to
  belong to the selected student, caps the amount at the invoice balance and
  applies it with a conditional `$inc` (no overpay under concurrency).
- **Credentials** — `User.mustChangePassword`. Set by create student, import
  and Generate Login. Import issues a unique random password per new student
  (shown once in the credentials dialog). `app/student-portal/layout.tsx` renders
  `components/student/ForcePasswordChange.tsx` until `changeMyPassword` clears
  the flag. Also fixed: Generate Login / Send Credentials passed the wrong
  argument shape (never worked); import refused for non-student emails;
  edit-student email clash checked before writing.
- **Tests scoped to batch** — `getStudentTests` / `getTestIntro` /
  `startStudentTest` limited to the student's batch or tests already attempted.
- **Login redirect** — `callbackUrl` honoured only for local paths in the
  user's own portal (`safeCallback` in `lib/actions/auth.ts`).
  `poweredByHeader: false`.
- **Reset coverage** — reset clears batches, courses, attendance and
  assignments before re-seeding.
- **CI** — `.github/workflows/ci.yml` (tsc, lint, build).
- **DTO audit** — no password hashes, lockout data or answer keys reach the
  client; admin student detail keeps the full ID-proof number (needed by the
  edit form).

Verified locally (isolated in-memory Mongo, browser + curl): Generate Login
dialog shows a one-time password; old password rejected; temp password lands on
the forced-change screen for every portal URL; after changing, the portal
loads and the flag is cleared; a JEE student sees no NEET tests and a NEET test
URL bounces back; `callbackUrl` to `/admin-dashboard/finance/payments` lands
there, a `//evil.example` callback is ignored; no `X-Powered-By` header; reset
removes a demo-created batch and course and restores 4 batches / 3 courses.

## Stage C — Complete the demo story (2026-10-14)

Branch `stage-c-demo-story` (from `stage-a-closeout`).

- **Shared helpers:** `lib/audit.ts` (writeAudit / writeSystemAudit, moved from
  finance) and `lib/student-accounts.ts` (randomPassword / nextAdmissionNo).
- **Leads + Online Admissions + conversion:** `lib/models/Lead.ts`,
  `lib/leads.ts` (labels), `lib/actions/leads.ts` (getLeads,
  getConversionOptions, createLead, updateLead, convertLead,
  getAdmissionOptions, submitAdmission). `app/admin-dashboard/lms/leads` rebuilt
  on live data; `app/register` submits applications (creates leads, shows the
  reference). Convert claims the lead atomically, creates the student with a
  one-time password + `mustChangePassword`, enrolls batch/course, raises the
  invoice, links the lead, audit-logs. Seed: 11 leads; reset removes accounts
  created by converting demo leads (`@demo.auraedu.com` not in DEMO_ACCOUNTS).
- **Live admin dashboard:** `lib/actions/dashboard.ts` getAdminOverview;
  `app/admin-dashboard/page.tsx` rebuilt (tiles link to their screens; activity
  from domain events, not the admin-only audit log).
- **Lesson progress:** `lib/models/LessonProgress.ts`; `setLessonComplete`,
  progress in `getMyCourses` / `getMyCourse`; Learn player Mark Complete; real
  bars on My Courses and the student dashboard; seed gives the demo student 4/9.
- **Student portal on live data only:** StudentContext now holds just profile,
  pendingFee and notifications (all loaded in the layout). New
  `getMyCertificates` (earned from 100% course progress or passed graded tests)
  and `getMySchedule` (classes, webinars, events, batch tests). Dashboard score
  centre, upcoming tests, certificate count and attendance read live data.
- **Dead links:** Forgot Password explains who resets; `/privacy-policy` added;
  admissions form linked from the header and login page.
- **Demo script:** `docs/DEMO_SCRIPT.md`.

Verified locally (isolated in-memory Mongo, browser + curl): applied through
`/register` (reference LD-2026-0012) → lead appeared as Online Admission →
follow-up note saved → converted into NEET Batch A with invoice INV-2026-00009,
course enrollment, linked lead and three audit entries → the new student's
one-time password led to the forced-change screen. Admin dashboard numbers
matched the seed (11 students, ₹46,006 outstanding, 88% attendance, 67% pass
rate). Demo student: 4/9 lessons, 2 earned certificates, score 335/360,
rank #1 of 2, 3 unread notifications (matches DB); marking all 9 lessons
complete produced a Certificate of Completion; schedule showed today's live
class, doubt hour and batch test. Re-seeding removed the converted account.

## TODO next

See `TASKLIST.md` §2–3 (Stages A–F): Phase 1 close-out, go-live, Leads +
auto-conversion, Online Admissions backend, live admin dashboard/reports,
timetable, remaining simulated student-portal widgets.

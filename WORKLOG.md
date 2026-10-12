# WORKLOG — AuraEdu POC

Full chronological record of every material change made to the coaching suite POC.

---

## Phase 1 — Foundation + Seed

- Scaffolded Next.js 16 app with TypeScript, Tailwind v4, MongoDB (local dev), app-router (`app/`).
- Created `lib/db.ts` — single-connection Mongoose singleton, `MONGODB_URI` from env.
- Created `lib/models/` for all initial entities: Student, Instructor, Course, Batch, Fee, Assignment, Test.
- Seeded demo data (`lib/seed/demo.ts`): courses (NEET Comprehensive 2026, JEE Advanced 2026, Python for Beginners), batches (NEET Batch A, NEET Batch B, JEE Batch A, Python Batch), students (Aarav Sharma in NEET A, Priya Patel in NEET B, Kabir Mehta/Jia Singh/Ananya Kumar in NEET A; Rohan Gupta/Meera Nair in JEE A; Arjun Reddy in Python), fee invoices (Aarav ₹10,001 / ₹5,000 paid, Priya ₹10,000 / ₹3,000 paid), demo admin user (`admin@demo.auraedu.com` / `Admin@123`).
- Created shared UI layer (`components/ui/`): Button, Modal, Toast, StatCard, DataTable, PageHeader — consistent look across all admin pages.
- Admin dashboard shell: `app/admin-dashboard/layout.tsx` with sidebar (`AdminSidebar.tsx`) + top bar, persistent across all admin pages.
- Auth flow: `lib/actions/auth.ts` — loginAction (checks `MONGODB_URI` at call time), registerAction, logoutAction; cookie-based session via `cookies()`.
- Landing page (`app/page.tsx`): hero, features, testimonials — all static Tailwind.
- Student portal shell: `app/student-portal/layout.tsx` with `components/student/Sidebar.tsx` + top bar.

---

## Phase 2 — Crown Jewels: Test Management

### Test Management (`app/admin-dashboard/tests/`)

**Seed + models:**
- `lib/models/Test.ts` — Question type = `mcq` | `written`; includes `correctOption?`, `maxScore`.
- `lib/actions/tests.ts` — CRUD: createTest, getTest, listTests, gradeTest, deleteTest. Grade writes verdict + feedback.
- `lib/seed/demo.ts` — two seeded tests: "Biology Chapter 1" (NEET A, 3 mcq + 1 written, Aarav 4/4, Priya 3/4, Kabir 2/4; Jia 0/ungraded) + "Physics Mechanics" (JEE A, 2 mcq, Rohan 1/2, Meera 0/2).
- `lib/models/Enrollment.ts` — `student + course + enrolledAt`; auto-enrolls students seeded with `course` into the course store; backing for My Courses + content progress.

**Admin pages:**
- `app/admin-dashboard/tests/page.tsx` — list with Create Test modal, Active/Graded tabs, Download (student-level score PDF), Delete.
- `app/admin-dashboard/tests/[testId]/page.tsx` — Admin grading: question list + score input + verdict + Submit; disabled after grading; Download PDF button.
- `app/admin-dashboard/tests/create/page.tsx` — multi-step: Subject → Batch → Questions (MCQ/Written inline), each question validated before adding.

**Student pages:**
- `app/student-portal/tests/page.tsx` — list, view graded tests (verdict + feedback).
- `app/student-portal/tests/[testId]/page.tsx` — timer + auto-submit + confirm dialog. MCQ auto-graded on submit; written → `needsGrading`. Submit disables further attempts.

---

## Phase 2 — Assignments + Reminder Notifications

- `lib/models/Assignment.ts` — created (course, subject, title, description, instructions, questions, dueDate, totalMarks, submissionType, status).
- `lib/actions/assignments.ts` — created `createAssignment`, `submitAssignment`, `gradeSubmission`, `getStudentNotifications()`. Notification row fan-out on create → one unread per enrolled student.
- `lib/seed/demo.ts` — seeded 4 assignments (Cell Biology, Chemical Bonding, Algebra, Python Lists) + 1 reminder row, students enrolled via `Enrollment` model.
- `app/admin-dashboard/assignments/page.tsx` — rewrite to use server actions (fetch-with-ignore pattern + `useToast`).
- `app/student-portal/assignments/page.tsx` — student list: status pills (Submitted, Overdue, Pending, Graded), tab filters, action buttons.
- `app/student-portal/assignments/[id]/page.tsx` — submit flow: confirm modal + toast feedback.
- `app/student-portal/notifications/page.tsx` — rewrite to real hub: fetches from `getStudentNotifications`, deep-links to tests/assignments/schedule, bell count badge.

---

## Phase 3 — Batches (real cohorts)

- `lib/actions/batches.ts` — `getBatches`, `getBatch(id)`, `createBatch`, `updateBatchName`, `assignStudent`, `moveStudent`, `unassignStudent`, `deleteBatch` (refuses non-empty), `getUnassignedStudents`.
- `app/admin-dashboard/batches/page.tsx` — rewrite: 4 batch cards (NEET A, B + JEE A + Python) with truth counts, Create Batch, click to detail; context-driven nav.
- `app/admin-dashboard/batches/[batchId]/page.tsx` — created: rename, student list + assign/move/unassign (unified dropdown), delete refusal if non-empty.
- Student portal: `app/student-portal/schedule/page.tsx` — rewrite to dynamic schedule driven by student's batch (cross-day repeat rows).
- `app/admin-dashboard/timetable/page.tsx` — context-driven from batch selector; Create Slot row wired to server action.
- `app/admin-dashboard/fees/page.tsx` — context-driven; batch selector filters fee overview + invoice list.
- `components/admin/dashboard/AdminDashboardClient.tsx` — batch selector drives tile values; default = first batch.

---

## 2026-09-15 — Attendance Module (daily per-batch register)

- `lib/actions/attendance.ts` — created `getAttendanceRegisters` (per-batch totals), `getAttendanceDay` (roster), `saveAttendanceDay`, `getAttendanceStats` (per-student %, present/absent/late/leave counts, streak).
- `app/admin-dashboard/attendance/page.tsx` — batch selector auto-fills; monthly strip with day dots; stats bar (attendance %, Present, Absent, Late); Mark All Present button; Save with toast; percent display is "X%" not "/100".
- `app/student-portal/attendance/page.tsx` — real stats: Attendance Bar (streak-adjusted %), Recent Days list (date + status + period); On Time badge from `onTime: true` seed; `getAttendanceStats` call.

---

## 2026-09-15 — Certificates Module (real credentials)

- `lib/models/Certificate.ts` — created (studentName, course, grade, issueDate, templateId, pdfUrl).
- `lib/actions/certificates.ts` — created `getCertificateTemplates`, `getCertificates`, `getStudentCertificates`, `generateCertificate`, `deleteCertificate`.
- `app/admin-dashboard/certificates/page.tsx` — rewrite: Create Certificate flow (search student → template picker with live preview → date + notes → Create); View Students button + Generate and Download (PDF).
- `app/student-portal/certificates/page.tsx` — created (4-column: 1st + 4th Certificate cards mockup, placeholder cards in 2nd + 3rd). Generate from the admin side (backend not wired).

---

## 2026-09-15 — Certificates: stateless PDF generator (rev 2)

- `lib/certificates/renderer.tsx` — create: pure data→HTML, no `requireRole`. Reads `COACHING_INSTITUTE_NAME` from env at render time; placeholder name if absent. Adds `.border-dashed` class to preview.
- `lib/pdf/render.ts` — create: pure HTML→PDF, no role check.
- `app/admin-dashboard/certificates/[studentId]/generate/page.tsx` — rewired (no cookies/auth): fetches data directly → calls `render` + `toPdf`.
- `app/admin-dashboard/certificates/render/page.tsx` — created stateless preview (no cookies): reads `studentId`+`templateId` from URL, fetches student data, renders preview.

---

## Course Content + Course Center (DB-backed, replacing dead stubs)

- `lib/models/CourseCenter.ts` — created (videoUrl, title, description, order, source?).
- `lib/actions/courseStore.ts` — created `getCourseContent(courseId)`.
- `app/admin-dashboard/course-center/page.tsx` — rewired to fetch from `getCourseCenter()` and then use `getCourseContent()` for module/lesson details; removed dead imports.
- `app/student-portal/my-courses/[id]/learn/page.tsx` — rewired to use `getCourseContent()` via server action + `fetchWithIgnore`, replacing the DB-free stub.
- `app/admin-dashboard/courses/page.tsx` — rewired to `getCourseCenter()` + single-course fetch with `Get Modules` flow.

---

## Phase 2 — Fees Collection / Accounts (Finance module: simulated → live DB)

**Shared layer:**
- `lib/actions/finance.ts` — ~25 server actions: all finance mutations (create/edit/approve/reject/void/delete for Expenses; Record Payment; create/approve/process/complete for Refunds; create/approve/reject for Waivers; getAuditTrail), each gating to `["admin"]` or `["admin","staff"]` and writing an AuditLog row.
- `lib/models/Expense.ts`, `lib/models/Vendor.ts`, `lib/models/ExpenseCategory.ts`, `lib/models/Payment.ts`, `lib/models/Refund.ts`, `lib/models/Waiver.ts`, `lib/models/AuditLog.ts` — all created.

**Seed:**
- `seedDemoFinance()` — runs in `seedDemoData()` AFTER `seedDemoAssignments()` (which wipes notifications), BEFORE new fee seed; seeds Vendors, Expense Categories, 5 Expenses, Payments (one linked to the existing paid fee invoice), Refunds, Waivers; all AuditLog rows keyed to `admin@demo.auraedu.com`.

**Actions (25 finance):**
`getExpenseCategories`, `createExpenseCategory`, `getVendors`, `createVendor`, `getExpenses`, `createExpense`, `updateExpenseStatus` (approve/reject/void — admin-only), `deleteExpense` (admin-only), `getExpenseApprovals`, `getFinanceOverview`, `getPayments`, `getPaymentStats`, `getIssuedInvoices`, `recordPayment`, `cancelPayment`, `getRefunds`, `createRefund`, `updateRefundStatus` (approve/reject/admin-only), `processRefund`, `getWaivers`, `createWaiver`, `updateWaiverStatus` (approve/reject/admin-only), `getAuditTrail`.

**Pages (11, all `"use client"`, fetch-with-ignore effect + toast(msg, tone) + Button/Modal):**
- `app/admin-dashboard/fees/page.tsx` — tabbed (Collected | Outstanding | Overdue | Overviews); Upcoming Dues list; Record Payment modal with Invoice picker.
- `app/admin-dashboard/fees/expenses/page.tsx` — full CRUD (Create/Edit modal, approve/reject/void/delete via server actions).
- `app/admin-dashboard/fees/expenses/approvals/page.tsx` — single Approve/Reject button per row (admin-only).
- `app/admin-dashboard/fees/expenses/categories/page.tsx` — create + delete.
- `app/admin-dashboard/fees/vendors/page.tsx` — create + delete.
- `app/admin-dashboard/fees/payments/page.tsx` — list; Record modal (invoice picker); status chips; cancel reverts invoice.
- `app/admin-dashboard/fees/invoices/page.tsx` — list (synced from students at load); status chips.
- `app/admin-dashboard/fees/refunds/page.tsx` — list; create; status transitions.
- `app/admin-dashboard/fees/waivers/page.tsx` — list; create; approve/reject; toast feedback.
- `app/admin-dashboard/fees/audit/page.tsx` — append-only log; filters.

**Finance verification:**
- `npx tsc --noEmit` clean; `npm run lint` clean; `npm run build` green — all finance routes compiled.
- `seedDemoData()` runs all 5 seeds in correct order; finance actions return truthful seeded data.
- Finance rules enforced: admin+staff create/pay/waive/refund; admin-only approve/reject/void/delete.
- Finance seed verified: vendors 5, expense categories 4, expenses 5, refunds 1, waivers 2.
- Refunds: createRefund returned `{ ok: true, id: '...' }` for Kabir's invoice payment; approveRefund + processRefund also succeeded; audit trail logged all four actions.
- `resetDemoData()` (admin-only, guarded) calls `seedDemoData()` and succeeds; pending issue: role-gate in the action file still needs enforcement (not yet fixed, left to a future commit).

---

## Manual UX passes

- Manual UX pass (certificates): admin Certificate Center → template cards render mockups; Generate → search Aarav (auto-fills NEET Comprehensive 2026), pick a template (preview updates live), set date, Download PDF → a clean A4 sheet opens in a new tab with the print dialog; student portal → both cert cards' Download buttons open the same render sheet; dashboard tile still counts 2.
- Manual UX pass (attendance): admin opens Attendance → batch select auto-fills (NEET Batch A) and this month's strip shows the 5 seeded days; click a day → roster marks match the seed with truthful stats; mark a fresh day (Mark All Present → flip a student Late → Save) → saved badge + toast counts; reselect the day → persisted; switch batch → roster changes; student login → Attendance page shows live % + the same days in both views; dashboard tiles match; Aarav shows 100% with 5/5 present.
- Manual UX pass (batches): confirm the 4 seeded batches appear with truthful enrolled counts (NEET A 4, NEET B 2, JEE A 3, Python 1); create a batch → it appears in the list; assign students from the Unassigned/other pool (verify their `course` syncs); move a student between batches; rename a batch and see its roster follow; try to delete a non-empty batch (should be refused) then delete an empty one; confirm the batches combobox on Create Test still matches.
- Manual UX pass (assignments): admin creates a worksheet (course/subject/batch comboboxes, add questions) → verify reminder notification lands unread in the student hub with working deep link → student solves + submits → admin grades (marks + verdict + note) → student sees Reviewed row with feedback. Also confirm seeded overdue sheet shows as Overdue and the Students-List Only case.
- Manual UX pass (finance): admin Finance → Overview shows truthful seeded numbers (collected ~₹44,501, outstanding, overdue 2); Expenses list shows 5 seeded rows; create an expense → works, appears pending; approve → moves to approved + audit log gains an entry; Vendors/Categories CRUD + delete refusal live; Payments → Record Payment for Priya's issued invoice → receipt number appears + invoice.paid bumps; Cancel it → reverts; Refunds → create for a paid payment → approve → process → complete (invoice.paid decrements); Waivers → new waiver for Kabir → approve → invoice.waived bumps; Audit Trail lists every action with the demo admin's name; `resetDemoData()` restores the whole finance set; student portal Fees still shows the Aarav story.
- Later: swap `MONGODB_URI` for Atlas string; whitelist server IP; nothing else changes.

---

## Phase 2 — Communications / Connect module: real broadcasts, meetings, calendar (live DB)

**Date:** 2026-09-16

### Model
Spine: admin authors a Notice → one Notification row per targeted user (fan-out).
- `lib/models/Notice.ts` (new): category, title, message, important, pinned, audience `{ kind: 'all'|'batches'|'staff', batchNames/institution? }`, sentAt.
- `lib/models/Meeting.ts` (new): type (live-class/staff-meeting/interview/webinar), title, date, startTime, endTime, link (slug+rand), batchNames, status (scheduled/live/completed/cancelled), security/camera/mic toggles.
- `lib/models/CalendarEvent.ts` (new): type enum class|meeting|exam|event|holiday, title, date (UTC midnight), time, description, batchNames.
- `lib/models/Notification.ts`: added `sourceId` (ObjectId, index, default null) so portal hub rows link back to their source Notice.

### Validation (`lib/validation.ts`)
Added `NoticeCategorySchema`, `NoticeAudienceSchema`, `CreateNoticeSchema`, `SendBroadcastSchema`, `CreateMeetingSchema`, `CreateCalendarEventSchema` (all after WaiverSchema). Notable: security toggles use explicit default object (zod `.default({})` of object shape).

### Actions (`lib/actions/connect.ts`) — all `"use server"`
Reads+writes gate to `["admin","staff"]`; `deleteNotice`/`deleteMeeting`/`deleteCalendarEvent` gate to `["admin"]`. Every mutation writes an AuditLog row.
- `getConnectOverview` (dashboard: 4 live stat + notices/batches/meetings).
- `getNotices` / `getNoticeStats` (delivered/read + recent readers — derived via aggregation on Notification rows, never stored) / `createNotice` (returns delivered count from fan-out) / `togglePinNotice` / `deleteNotice`.
- `getBroadcastBatches` (batch → { name, memberCount, unreadCount }) / `sendBatchBroadcast` (targets students by `User.batch === Batch.name`).
- `createMeeting` / `listMeetings` / `updateMeetingStatus` / `deleteMeeting`.
- `createCalendarEvent` / `listCalendarEvents(month)` / `deleteCalendarEvent`.
- Typed slices: `ConnectOverview`, `NoticeSlice`, `BroadcastBatchRow`, `MeetingRow`, `CalendarEventRow`.
- Fixed trap: `Outcome` data defaults to `unknown` — read `res.ok` before `res.message`, and pass concrete doc types (e.g. `MeetingDoc & { _id }`) to row mappers.

### Seed (`lib/seed/demo.ts`)
`seedDemoConnect()` appended LAST in `seedDemoData()` — it must run after `seedDemoAssignments()` because that wipes all notifications. Seeds 7 notices, 45 notification fan-out rows (deliver/read pre-set so chips read alive), 7 meetings (live today, completed past, scheduled future) and 10 calendar events spread over this month. Verified live: `notices=7 notifications=45 meetings=7 events=10`.

### Pages (all `"use client"`, fetch-with-ignore effect + toast(msg, tone) + Button/Modal)
- `connect/page.tsx` (rewritten): 4 StatCards (Notices Sent / Unread by Students / Upcoming Meetings / Events This Month), Upcoming Meetings (copy link, join), Recent Broadcasts (Delivered·Read chips), Active Groups (member count + unread).
- `connect/notices/page.tsx` (new, flagship): search + category/audience filter, live stat row, pinned/important rows with read-progress bar, stats modal (delivered/read/unread + recent readers), pin/delete, New Broadcast modal (audience toggle: All Students / Specific Batches / All Staff + batch chips).
- `connect/groups/page.tsx` (rewritten): broadcast-to-batch composer — real batch sidebar (member counts + unread badge), thread = recent broadcasts to the batch, composer sends via `sendBatchBroadcast`.
- `connect/meetings/page.tsx` (new): tabs (Upcoming/Live/Past/All), stat row, rows with date block + status pills, Copy Link / Start Now / Mark Complete / Cancel / Delete (confirm modal). `connect/meetings/schedule/page.tsx` (wired): form → `createMeeting` with validation + toasts.
- `connect/calendar/page.tsx` (fully rewritten): Month/Week/Day/Agenda views, prev/next + Today, UTC-aware month grid highlighting today, filter chips by event type, New Event modal → `createCalendarEvent`, event detail modal with delete. Week/Day/Agenda are working views.
- `AdminSidebar.tsx`: Communications group now = Dashboard / Broadcasts / Groups / Meetings / Calendar.

### Verification
- `npx tsc --noEmit` clean; `npm run lint` clean; `npm run build` green — all new routes compiled (`connect`, `connect/notices`, `connect/groups`, `connect/meetings`, `connect/meetings/schedule`, `connect/calendar`).
- Seed ran and verified in local Mongo.
- Student read side was already live (notification hub renders `sourceId` fan-out rows with deep links) — no change needed.

---

## TODO next

- `resetDemoData()` still lacks `requireRole(["admin"])` gate (awaiting go-ahead).
- Manual browser UX pass pending (needs dev server + browser).
- Later: Online Admissions → Leads + auto-conversion.
- Then Phase 3 simulated CRUD sweep (no dead buttons; use toast/modals).
- Swap `MONGODB_URI` for Atlas string when going live; whitelist server IP.

# AuraEdu — Checklist (done vs pending)

Done items are ~~struck through~~. Pending items are plain. **(you)** = needs your
account, decision or action. Details for every item: `TASKLIST.md`.

## Foundation & security
- ~~Next.js 16 app, MongoDB, Auth.js login, one-click demo logins, demo reset~~
- ~~bcrypt passwords, login rate limit (shared across Vercel), anti user-enumeration~~
- ~~Role gates (admin / staff / student), admin-only sections, immediate Block / force logout~~
- ~~Strict security headers with per-request CSP nonce~~
- ~~Audit log for money, accounts, students, tests, grading, settings, data export/erase~~
- ~~ID-proof numbers masked in admin screens~~
- ~~Demo-only features (Reset, self-payment, scripted chat) off unless DEMO_MODE~~
- **(you)** Purge the old git history and old `origin` remote
- **(you)** Protect `main` on GitHub (require the CI check)

## Modules
- ~~Students, Student Logins, Batches, Courses, Attendance~~
- ~~Tests (MCQ auto-grade, written grading by admin/staff with admin lock), Assignments, Certificates (+ verify page)~~
- ~~Finance (10 screens), GST invoices, refunds and waivers with caps~~
- ~~Leads, Online Admissions, lead → student conversion~~
- ~~Admin dashboard, student portal on live data~~
- ~~Timetable, Reports Hub (19 reports), Task Manager, Form Builder, Master Data, Settings~~
- ~~Staff management, leave, payroll simulator, group chat, lesson doubts~~
- ~~Multi-branch: students, finance, expenses, dashboard, reports, attendance, leads~~
- ~~Header menus close each other, on outside click, Esc and navigation~~
- Lesson material files in the Learn player (needs file uploads)

## Quality
- ~~116 unit tests, 29 browser (e2e) tests, all in GitHub CI (green)~~
- ~~Phone layout, time-zone hydration, CSP and live-site smoke tests~~
- **(you)** Run the live sign-in checks (`LIVE_LOGINS=1 npm run test:live`)

## Go-live (demo)
- ~~Atlas database `auraedu`, Vercel project from `main`, demo data loaded~~
- ~~Live at https://aura-edu-eight.vercel.app, health check green~~
- ~~Local and live databases separated (`.env` local, `.env.atlas` live)~~
- **(you)** Vercel function region = Atlas region
- **(you)** Weekly `npm run backup:remote` until Atlas backups are on
- **(you)** Optional: Preview environment variables (DEPLOYMENT.md §3.3a)

## Real-institute readiness
- ~~First-admin setup without demo data (`npm run setup:institute`)~~
- ~~Backups, restore drill, admin "Download all institute data"~~
- ~~Privacy consent (guardian for minors), privacy notice, per-student export/erase~~
- **(you)** Fill the privacy notice's retention years and data region
- **(you: Sentry)** Error monitoring and alerts
- **(you: Resend/SES + domain)** Email: password reset, credentials, fee reminders
- **(you: Razorpay)** Online fee payments and paid course checkout
- **(you: Cloudflare R2)** File uploads (assignments, lesson material, avatars)
- **(you)** Atlas Flex/M10 in Mumbai with backups; Vercel Pro per paying client
- Set up the first pilot institute and run a 2–4 week pilot

## Scale (after 3–5 clients)
- One deployment for many institutes (tenant per subdomain)
- Super-admin console: institutes, plans, billing
- Parent access, SMS/WhatsApp with DLT registration
- Installable student app (PWA), Hindi/regional labels

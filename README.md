# AuraEdu — Institution Management Platform (POC / Sales Demo)

A proof-of-concept web app for a coaching/institution management suite. Its only
job is to impress potential clients with ~25 demonstrable modules so they can
choose which ones get built for real. **Speed to a demoable state matters more
than production depth.**

> Read `TASKLIST.md` before touching anything — it is the single source of truth
> for scope, locked decisions, module map and build phases.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Full-stack Next.js (no separate server): server actions in `lib/actions/*`.
- MongoDB + Mongoose (local via `npm run mongo`; Atlas = swap `MONGODB_URI`).
- Auth.js v5 Credentials (bcrypt, JWT cookie) + server-side session registry:
  every request re-checks the session and user in the DB (`lib/dal.ts`,
  `lib/session-registry.ts`). Zod on every mutation. Never hand-rolled crypto.
- Roles: `admin`, `staff` (shares the admin dashboard minus admin-only routes
  in `lib/permissions.ts`), `student`.

## Project structure

```
app/
  (marketing)/          Landing page (server components, static/ISR)
  login/                Login / portal selector
  register/             Student registration wizard
  admin-dashboard/      Admin + staff dashboard (role-filtered; admin-only
                        sections gated by their own layout.tsx)
  student-portal/       Student portal (signed-in student's live data)
  session-ended/        Clears a revoked session's cookie → /login
  api/auth/             Auth.js route handler
components/
  landing/              Marketing landing components
  admin/                Admin dashboard chrome (sidebar, header, modals)
  student/              Student portal chrome (sidebar, header)
context/                Client state (StudentContext: profile + fee balance from the server)
lib/
  actions/              Server actions (each does its own requireRole check)
  models/               Mongoose models (23 collections)
  seed/                 Demo dataset (npm run seed / Reset demo data)
  dal.ts                requireRole / requireAdminPage — the auth choke point
  session-registry.ts   Sign-in sessions, revocation, login gate
  permissions.ts        Admin-only route map
  validation.ts         Zod schemas
```

Only the 7 "working" modules in `TASKLIST.md` §4 need real depth; everything
else is polished simulation on seeded data.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build (must stay green)
npm run start    # serve production build
npm run lint     # eslint
npm run mongo    # local MongoDB (persists in .data/)
npm run seed     # load the demo dataset
```

Demo logins (seeded, public by design): `admin@demo.auraedu.com` /
`Admin@123`, `staff@demo.auraedu.com` / `Staff@123`,
`student@demo.auraedu.com` / `Student@123` (one-click buttons on `/login`).

## Notes

- `.env*` are gitignored; secrets live in environment variables only.
- Reference screenshots and old planning drafts live in `Not necessary/`
  (gitignored) and are not part of the app.
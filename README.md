# MyEdou — Institution Management Platform (POC / Sales Demo)

A proof-of-concept web app for a coaching/institution management suite. Its only
job is to impress potential clients with ~25 demonstrable modules so they can
choose which ones get built for real. **Speed to a demoable state matters more
than production depth.**

> Read `TASKLIST.md` before touching anything — it is the single source of truth
> for scope, locked decisions, module map and build phases.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- Full-stack Next.js (no separate server). MongoDB Atlas + Mongoose planned.
- Auth/session/validation per `TASKLIST.md` §2 — never hand-rolled crypto.

## Project structure

```
app/
  (marketing)/          Landing page (server components, static/ISR)
  login/                Login / portal selector
  register/             Student registration wizard
  admin-dashboard/      Admin RBAC UI (~50 screens, mock state)
  student-portal/       Student dashboard (mock state)
  api/                  Route handlers (future)
components/
  landing/              Marketing landing components
  admin/                Admin dashboard chrome (sidebar, header, modals)
  student/              Student portal chrome (sidebar, header)
context/                Client state (StudentContext)
lib/                    DB / session / DAL / validation (future)
actions/                Server actions (future)
```

Only the 7 "working" modules in `TASKLIST.md` §4 need real depth; everything
else is polished simulation on seeded data.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build (must stay green)
npm run start    # serve production build
npm run lint     # eslint
```

## Notes

- `.env*` are gitignored; secrets live in environment variables only.
- Reference screenshots and old planning drafts live in `Not necessary/`
  (gitignored) and are not part of the app.
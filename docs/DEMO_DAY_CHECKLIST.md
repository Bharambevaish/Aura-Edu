# AuraEdu — Demo-Day Checklist

Use this with [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md), which has the step-by-step story.

## The day before

- [ ] Open the demo link on the laptop you will present from. Check that it loads in under 3 seconds.
- [ ] Look at the latest CI run on GitHub. It must be green: typecheck, lint, unit tests, build and the e2e demo story.
- [ ] Sign in with each one-click button on `/login` (**Explore as Admin / Staff / Student**). Each one must land on its dashboard.
- [ ] Click **Reset demo data** once (admin banner). It takes about 10–20 seconds.
- [ ] Ask what the prospect cares about most: admissions, fees, exams or staff. Put that module first in the tour.

## 15 minutes before

- [ ] **Reset demo data**. Every other session is signed out, so sign in again afterwards.
- [ ] Open three browser profiles or windows, signed in as **Admin**, **Staff** and the **Student** (Aarav Sharma). Keep one private window free for the new applicant.
- [ ] Turn off notifications, close other tabs, set browser zoom to 100% and keep a charger nearby.
- [ ] Keep a phone handy. The admin dashboard works on phones, which is worth showing ("check fees from anywhere").

## Tour path (≈ 12 minutes)

| # | Screen | What to say | Time |
|---|--------|-------------|------|
| 1 | Admin **Overview** | "Everything live: 24 students, fees collected this month, overdue fees, attendance, pass rate." Switch **branch** in the header. | 1 min |
| 2 | `/register` → **Leads** → **Convert** | "Admissions 24/7. One click turns an applicant into a student with a login and a fee invoice." | 2 min |
| 3 | **Form Builder** → open `/f/free-demo-class` | "Your own enquiry forms, embeddable on your website; every response becomes a lead." | 1 min |
| 4 | Student: **Tests** → sit the active test | "Proctored online tests; MCQs marked instantly." | 2 min |
| 5 | Staff: grade the written answer → Student: **Test Card** | "Faculty grade written answers; the student sees score and rank." | 1.5 min |
| 6 | **Finance → Overview / Invoices / Payments** | "Every rupee: GST invoices, part-payments, refunds and waivers with approvals." | 1.5 min |
| 7 | **Reports Hub** | "19 live reports with CSV export: defaulters, collections, attendance, results." | 1 min |
| 8 | **Timetable**, **Leave**, **Payroll**, **Task Manager** | "Staff side of the institute in the same place." | 1 min |
| 9 | **Student Logins** → Block | "You stay in control: block an account and they're out instantly." | 30 s |
| 10 | Wrap-up | "Pick the modules you want; we set it up on your own domain and data." | 30 s |

## If something goes wrong

| Problem | Fix |
|---|---|
| "Your session has ended" | Expected after Reset or a Block. Sign in again with the one-click button. |
| A number on the dashboard looks wrong | Reset demo data. All figures come from the seed and are consistent after a reset. |
| A page is slow on first open | The first visit warms the server. Open each tour screen once during the 15-minute prep. |
| The live link is down | Run it locally with `npm run build` then `npm run start` (needs `.env`), or show the recorded walkthrough. |
| Applicant form says "Too many applications" | Rate limit: 5 per 10 minutes per network. Use the seeded lead *Ishaan Malhotra* instead. |

## After the call

- [ ] **Reset demo data** so the next prospect starts clean.
- [ ] Note which modules they asked about. Those are the ones to productionise first (TASKLIST Stage F).

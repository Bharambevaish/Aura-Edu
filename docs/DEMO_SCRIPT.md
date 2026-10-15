# AuraEdu — Demo Script (the full story, ~8 minutes)

The story a prospect sees: **an applicant applies online → the admissions team
follows up and converts them → the new student signs in, pays, learns and sits
a test → staff grade the written answer → a certificate is earned → an admin
locks an account → Reset for the next client.**

Every step below runs on live data. Times are rough. Preparation, a shorter
tour path and fallbacks are in [`DEMO_DAY_CHECKLIST.md`](DEMO_DAY_CHECKLIST.md).

---

## 0. Before the call (1 min)

1. Sign in with **Explore as Admin** on `/login`.
2. Click **Reset demo data** in the green banner. Wait ~10 s. You stay signed in;
   everyone else is signed out and all demo data is back to its starting state.
3. Keep a second browser (or a private window) ready for the student — the
   admin and student need separate sessions.

## 1. Online admission (1 min) — *"Your website takes applications 24/7."*

1. Open the landing page `/` → **Login ▾ → Apply for Admission** (or `/register`).
2. Fill the four steps with a made-up applicant. Use an email ending in
   `@demo.auraedu.com`, e.g. `riya.demo@demo.auraedu.com` — Reset will clean it up.
3. **Submit Application** → show the **application reference** (`LD-2026-00xx`).
   Point out: no account is created yet — admissions reviews it first.

## 2. Admissions desk (1.5 min) — *"Nothing falls through the cracks."*

1. Admin → **Overview**: live numbers. "Lead Conversion" and "Recent Activity"
   already show the new application.
2. **LMS Operations → All Leads**. The application is on top, source
   *Online Admission*. Show the stats row (due follow-ups, conversion %) and
   the overdue follow-ups in red.
3. **Follow-up** → stage *Contacted*, a note ("Called parent, campus visit
   booked"), next follow-up date → **Save**. Reopen it to show the history.
4. **Convert** → the matching batch is pre-selected with live seat counts and
   the course fee pre-filled → **Convert to student**.
5. The **one-time password** appears once. Copy it.
6. Optional: **Finance → Invoices** shows the new fee invoice; the lead row
   now shows *Converted → Student*.

## 3. The new student (2 min) — *"Day one for the student."*

In the second browser:

1. `/login` → student email + the one-time password → the portal shows only
   **Set a new password**. Set one.
2. **Dashboard**: their name, batch, fee due, course progress, upcoming test.
3. **Fees & Payments → Pay Pending Due** → pay part of it (UPI). Back in the
   admin browser, **Finance → Payments** shows it, source *Student Portal*.
4. **My Courses → Continue Learning** → **Mark Complete** on a lesson; the
   progress bar moves.
5. **Class Schedule**: today's live class (with **Join**) and the batch test.

## 4. Exam + grading (1.5 min) — *"The crown jewel."*

1. Student → **Tests & Quizzes** → open the *Active Now* test → start. It goes
   fullscreen; switching tabs 3 times auto-submits. Answer and **Submit**:
   MCQs are scored instantly; written answers wait for faculty.
2. Admin browser → sign out → **Explore as Staff** (written answers are graded
   by staff) → **Test Management** → the test → open the attempt → award marks
   for the written answer → save.
3. Student → **Test Card** shows the final score and rank.

## 5. Certificates (30 s)

- Student → **Certificates**: a *Certificate of Achievement* appears for any
  passed, graded test, and a *Certificate of Completion* once every lesson of a
  course is complete. **Download PDF** opens a print-ready A4 sheet.
- Or admin → **Certificates → Generate** for any student and template.

## 6. Security moment (30 s) — *"You stay in control."*

1. Admin → **Student Logins**: the new student is *Active*, with their browser
   and device.
2. **Block** → in the student's browser, click anything → they're signed out
   immediately ("Your session has ended"). Unblock afterwards.
3. Sign in as staff and try `/admin-dashboard/settings` → redirected with
   "restricted to administrators".

## 7. Wrap-up

Admin → **Reset demo data**. The converted applicant's account, their
payments and progress are removed and the original data is back.

---

### If something goes wrong

| Symptom | Fix |
|---|---|
| "Your session has ended" right after Reset | Expected for every session except the admin who clicked Reset — sign in again. |
| Convert says "An account with … already exists" | The email is in use; use a fresh `@demo.auraedu.com` email or Reset. |
| Applicant form says "Too many applications" | 5 per 10 minutes per network; wait or use another network. |
| A student can't see a test | Tests are per batch; the student must be in the test's batch. |
| Written answer can't be graded as admin | By design only staff grade — use **Explore as Staff**. |

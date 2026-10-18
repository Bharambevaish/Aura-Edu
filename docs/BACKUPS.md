# Backups, restore and data export

Each institute runs on its own MongoDB database. **Atlas free clusters (M0)
have no automated backups**, so if someone deletes data by mistake, or the
cluster is lost, the only copy is the one you made. This guide sets up a
daily backup in about 15 minutes and shows how to bring a backup back.

> On a paid Atlas tier (M10 and up, or Flex) Atlas takes automated, point-in-
> time backups for you (Atlas → your cluster → **Backup**). Keep the daily
> `npm run backup` anyway: it is a copy you hold yourself, outside Atlas, and
> it is the copy the quarterly drill below tests.

There are three tools:

| Tool | What it is for | Contains secrets? |
| --- | --- | --- |
| `npm run backup` | Full copy of the database, for disaster recovery | **Yes** — password hashes and sign-in sessions. Store it like a password. |
| `npm run restore` | Puts a backup back, replacing what is in the database | — |
| Settings → Security → **Download all institute data** | Admin download of the institute's data (for records, audits, or moving to another system) | No — password hashes, sign-in sessions and token/secret fields are left out. Cannot be restored. |

## What you need (once)

On the computer that will take the backups (the office PC is fine):

1. **Node.js 20 or newer** — <https://nodejs.org> (the "LTS" installer).
2. **The AuraEdu code** in a folder, e.g. `C:\AuraEdu`, with `npm ci` run once in it.
3. **A `.env` file** in that folder with the institute's `MONGODB_URI` (the same
   Atlas connection string the live site uses). If this PC also runs a local
   copy for testing, use a separate folder for backups so you never mix them up.
4. **A safe place for backup folders** — ideally a folder that syncs off this
   PC (OneDrive, Google Drive, or an external disk), e.g. `D:\AuraEdu-backups`.

Check it works by opening *Command Prompt* in `C:\AuraEdu` and running:

```bat
npm run backup -- --out D:\AuraEdu-backups
```

It prints which database it is reading (`Backing up REMOTE database "AuraEdu"
on cluster0.xxxxx.mongodb.net`), one line per collection with its document
count, and the folder it wrote, e.g. `D:\AuraEdu-backups\AuraEdu-20261018-0200`.
A backup only **reads** the database; it never changes anything.

Inside the folder there is one `<collection>.json` file per collection and a
`manifest.json` listing the database, document counts, app version and time.
A folder **without** `manifest.json` is a backup that did not finish — delete it.

## Daily backup with Windows Task Scheduler

1. Create `C:\AuraEdu\backup-daily.bat` containing:

   ```bat
   @echo off
   cd /d C:\AuraEdu
   call npm run backup -- --out D:\AuraEdu-backups >> D:\AuraEdu-backups\backup-log.txt 2>&1
   rem Keep 30 days of backups: delete backup folders older than 30 days.
   forfiles /p D:\AuraEdu-backups /d -30 /c "cmd /c if @isdir==TRUE rd /s /q @path" 2>nul
   ```

2. Open **Task Scheduler** (Start → type "Task Scheduler") → **Create Basic Task…**
   - Name: `AuraEdu daily backup`
   - Trigger: **Daily**, at a quiet time such as **2:00 AM**
   - Action: **Start a program** → Program: `C:\AuraEdu\backup-daily.bat`
3. Finish, then open the task's **Properties**:
   - **General** → choose *Run whether user is logged on or not*.
   - **Settings** → tick *Run task as soon as possible after a scheduled start is missed*
     (so a PC that was off at 2 AM backs up when it is switched on).
4. Right-click the task → **Run** once, then check that a new folder appeared
   in `D:\AuraEdu-backups` and that `backup-log.txt` ends with `Backed up … collections`.

Once a week, glance at `backup-log.txt`: the newest entry should be from last
night. If it says `Backup failed`, the reason is on the same line (usually the
internet was down, or the Atlas password changed and `.env` needs updating).

On a Mac or Linux server the same thing is a cron line:
`0 2 * * * cd /srv/auraedu && npm run backup -- --out /backups >> /backups/backup-log.txt 2>&1`

**Keep backups private.** They hold every student's details and the password
hashes, so treat the backup folder like a password: do not email it or put it
in a shared folder.

## How to restore

A restore **replaces everything** in the database with the backup: every
collection in the backup is overwritten, and anything added since the backup
(new students, payments, logins) is lost. Everyone is signed out unless their
session was in the backup too. Do it outside teaching hours.

1. Pick the backup folder (usually the newest one from before the problem).
2. Preview — this changes nothing and shows each collection's count *now* and
   *after* the restore:

   ```bat
   npm run restore -- D:\AuraEdu-backups\AuraEdu-20261018-0200
   ```

3. If the numbers look right, run it for real. For the live (Atlas) database
   both flags are required:

   ```bat
   npm run restore -- D:\AuraEdu-backups\AuraEdu-20261018-0200 --confirm-restore --confirm-remote
   ```

   For a database on this computer (`mongodb://localhost…`) `--confirm-restore`
   alone is enough.

4. Sign in to the site and check a few things you know: the student count, a
   recent fee receipt, today's attendance.

The restore rebuilds the database indexes from the app's models afterwards,
so a backup also comes back cleanly into a brand-new empty database or cluster
(set `MONGODB_URI` to the new one first).

**Restoring only a few records** (e.g. one deleted student) is not built in:
restore into a *local* or spare database instead of the live one, find the
record there, and re-enter it in the live site. Ask a developer if needed.

## Quarterly restore drill (every 3 months)

A backup you have never restored is a hope, not a backup. Once a quarter,
prove the latest one works — without touching the live database:

1. In the AuraEdu folder, start a local database: `npm run mongo`
   (leave it running; it listens on `mongodb://127.0.0.1:27017` and keeps its
   files in the `.data` folder on this PC).
2. In a second Command Prompt, point at it **for this window only** and restore
   the newest backup:

   ```bat
   set MONGODB_URI=mongodb://127.0.0.1:27017/drill
   npm run restore -- D:\AuraEdu-backups\AuraEdu-20261018-0200 --confirm-restore
   ```

   (`set` in that window overrides `.env`, so the live database is not used.
   The restore prints the target database name — it must say `"drill"`.)
3. Check the *after* column matches `manifest.json`, then optionally run
   `npm run dev` in that same window and sign in as a real admin to look around.
4. Close both windows, then delete the `.data` folder in the AuraEdu folder —
   it now holds a full copy of the institute's data. Write the date and result
   in your records.

Developers: `npm test` runs the same drill automatically on every change
(`tests/unit/backup-restore.test.ts`: seed → backup → wipe → restore → compare).

## Admin data export

**Settings → Security → Download all institute data** (admins only) downloads
one JSON file, `auraedu-export-<date>.json`, with every collection. Each
download is written to the audit log. Left out on purpose:

- the `sessions` collection (sign-in sessions) and any other session,
  `__Secure` or login rate-limit store;
- `passwordHash` / `password` and any field ending in `token` or `secret`.

Dates and ids appear as `{"$date": …}` / `{"$oid": …}` (MongoDB Extended JSON).
The export is for records and for moving data elsewhere; use `npm run backup`
for disaster recovery — an export cannot be restored, because it has no
passwords and nobody could sign in.

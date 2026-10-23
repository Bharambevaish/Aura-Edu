# Deploying AuraEdu (Vercel + MongoDB Atlas)

This guide takes you from the GitHub repository to a live link. You do it once
per deployment (the sales demo now, then one per client institute). Every value
you need to type is written out below.

**You need:** a MongoDB Atlas account with the cluster `cluster2.1tgshhd.mongodb.net`,
a Vercel account, access to the GitHub repo `Nikhil270703/AuraEdu`, and this
repository on your computer with Node.js 20 or newer (`node -v` to check).

---

## 1. MongoDB Atlas

### 1.1 Create a database user

1. Open [cloud.mongodb.com](https://cloud.mongodb.com) → your project.
2. Left menu: **Security → Database Access** → **Add New Database User**.
3. Authentication Method: **Password**.
4. Username: e.g. `auraedu-app`. Password: click **Autogenerate Secure Password**, then **Copy** it somewhere safe.
5. Database User Privileges: **Built-in Role → Read and write to any database**.
6. Click **Add User**.

### 1.2 Allow Vercel to connect (Network Access)

1. Left menu: **Security → Network Access** → **Add IP Address**.
2. Click **Allow Access from Anywhere**. This fills in `0.0.0.0/0`.
3. Comment: `Vercel`. Click **Confirm**. It takes about a minute to become **Active**.

**Why "anywhere":** Vercel runs the app on shared servers whose IP addresses
change all the time, so there is no fixed address to allow. The database is
still protected by the username and password from 1.1 and by TLS encryption.
Use a long, generated password. If you later move to a Vercel plan with static
IPs, replace `0.0.0.0/0` with those addresses.

### 1.3 Get the connection string

1. Left menu: **Database → Clusters** → on `Cluster2` click **Connect** → **Drivers**.
2. Copy the string. It looks like
   `mongodb+srv://<db_username>:<db_password>@cluster2.1tgshhd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2`
3. Put in your user and password, and add the database name **`AuraEdu`** after
   `.mongodb.net/` (before the `?`). The final string is:

   ```
   mongodb+srv://auraedu-app:YOUR_PASSWORD@cluster2.1tgshhd.mongodb.net/AuraEdu?retryWrites=true&w=majority&appName=Cluster2
   ```

   Keep the capital **A** and **E** in `AuraEdu`, and type it exactly the same
   way everywhere. MongoDB treats `auraedu` and `AuraEdu` as a conflict (see
   Troubleshooting). The app always uses the name in this string.

   For a client institute, use a different database name per client, e.g.
   `.../SunriseAcademy?...`, so their data never mixes with the demo.

### 1.4 Special characters in the password

If the password has any of these characters, replace each one with its code
in the connection string (not in Atlas itself):

| Character | Write it as |
|-----------|-------------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| space | `%20` |

Example: password `ab@c/12` becomes `ab%40c%2F12`. To skip this, regenerate a
password with only letters and digits.

---

## 2. Load the demo data (once)

The database starts empty. Load the demo data from your own computer:

1. In the repository folder, create a file named `.env.atlas` (git-ignored)
   with one line: `MONGODB_URI=` followed by the full string from 1.3. Keep
   `.env` on your local database; `seed:remote` and `backup:remote` read
   `.env.atlas` instead, so ordinary local work never touches the live data.
2. Run:

   ```bash
   npm ci
   ```

   ```bash
   npm run seed:remote
   ```

3. It prints the host and database it is writing to, e.g.
   `Seeding REMOTE database "auraedu" on cluster2.1tgshhd.mongodb.net`, then
   `Done.` Check that the database name is right. Use lowercase `auraedu`:
   Atlas refuses two databases whose names differ only in capitals.

Plain `npm run seed` refuses to touch any database that is not on your own
computer. Seeding **replaces** the demo data, so only use `seed:remote` on the
sales-demo database. **Do not run it on a client institute's database:** it
creates the public demo accounts (`admin@demo.auraedu.com` / `Admin@123` …).
A real institute is set up with `npm run setup:institute` instead (section 6),
and the seed refuses any database that already holds non-demo accounts.

To back up the live demo database to your computer: `npm run backup:remote`
(see `docs/BACKUPS.md`).

---

## 3. Vercel

### 3.1 Import the repository

1. Open [vercel.com/new](https://vercel.com/new).
2. Under **Import Git Repository**, choose GitHub. The repo is private, so the
   first time Vercel asks you to **Install** the Vercel GitHub app. Choose
   **Only select repositories → `Nikhil270703/AuraEdu`** → **Install**. The
   repo owner on GitHub may need to approve this.
3. Click **Import** next to `Nikhil270703/AuraEdu`.

### 3.2 Configure the project

| Setting | Value |
|---------|-------|
| Project Name | `auraedu-demo` (this becomes `auraedu-demo.vercel.app`) |
| Framework Preset | **Next.js** |
| Root Directory | `./` |
| Build Command (Override on) | `npm run build` |
| Install Command (Override on) | `npm ci` |
| Output Directory | leave default |

### 3.3 Environment variables

Still on the import screen, open **Environment Variables** and add each one.
After the project exists, they live under **Settings → Environment Variables**.
Tick **Production** and **Preview** for each.

| Name | Value |
|------|-------|
| `MONGODB_URI` | the full string from 1.3 |
| `AUTH_SECRET` | a new random secret (see below) |
| `AUTH_URL` | `https://auraedu-demo.vercel.app` (your project's URL, no trailing `/`) |
| `AUTH_TRUST_HOST` | `true` |
| `DEMO_MODE` | `true` (sales demo only; **leave it out for client institutes**) |

Generate `AUTH_SECRET` with either command and paste the output:

```bash
openssl rand -base64 32
```

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use a different secret for every deployment. Changing it signs everyone out.

`AUTH_URL`: you don't know the exact URL until the first deploy. Enter your
guess (`https://<project-name>.vercel.app`), and after the deploy check the
**Domains** list in the project. If it differs, fix the variable and redeploy
(3.5).

`MONGODB_DB` is optional and only used when `MONGODB_URI` has no database
name in it. Leave it out.

### 3.3a Preview deployments (pull requests and other branches)

Vercel builds every branch and pull request as a **Preview** with its own
web address. Previews get only the variables ticked for **Preview**. Without a
database variable they load but can't sign anyone in. Two safe options:

- **Recommended:** a separate demo database for previews. In Atlas create
  nothing new: the same cluster can hold another database. Add for **Preview
  only**: `MONGODB_URI` = the same string with `/auraedu_preview` instead of
  `/auraedu`, `DEMO_MODE=true`, `AUTH_SECRET` (a different one from
  Production), `AUTH_TRUST_HOST=true`. **Don't set `AUTH_URL` for Preview**:
  each preview has its own address. Seed it once with `.env.atlas` pointing at
  `/auraedu_preview` and `npm run seed:remote`.
- **Simplest:** leave Preview without variables and only use the Production
  link. Previews then show pages but can't sign in.

Never point Preview at a real institute's database.

### 3.4 Deploy

Click **Deploy**. The build takes a few minutes.

### 3.5 Settings after the first deploy

1. **Settings → Git → Production Branch:** `main`. Every push to `main`
   redeploys production; other branches get Preview links.
2. **Settings → Build and Deployment → Node.js Version:** **20.x** or newer
   (22.x is fine).
3. **Settings → Functions → Function Region:** choose the region closest to
   the Atlas cluster. In Atlas, the cluster card shows its region. For **AWS
   Mumbai (ap-south-1)** pick **Mumbai, India (`bom1`)**. A far-away region
   makes every page slower.
4. Changing any variable or setting needs a redeploy: **Deployments** → the
   latest one → **⋯** → **Redeploy**.

---

## 4. Check the deployment

Open each URL on your live domain:

1. **`/api/health`** shows `{"ok":true,"db":"up"}`. If you see `{"ok":false}`,
   the app can't reach Atlas (Troubleshooting).
2. **`/login`** loads, and on the demo shows the **Explore as Admin / Staff /
   Student** buttons. A client deployment (no `DEMO_MODE`) shows only the
   normal sign-in form.
3. Click **Explore as Admin**. The admin dashboard opens with the demo
   banner at the top.
4. Click **Reset demo data** in the banner. The button spins and comes back;
   the demo data is restored.

---

## 5. Custom domain

1. **Settings → Domains → Add**, type e.g. `demo.auraedu.com`.
2. Vercel shows a DNS record (usually a `CNAME` to `cname.vercel-dns.com`, or
   an `A` record for a bare domain). Add it at your domain registrar and wait
   until Vercel shows **Valid Configuration**.
3. Change `AUTH_URL` to `https://demo.auraedu.com` (Production) and redeploy.
   Without this, signing in on the new domain fails or loops.

---

## 6. Deploying for a real institute

A real institute gets its **own** deployment and its **own** database, never
the sales-demo ones, and never the demo seed. Do this once per institute.

### 6.1 A separate database

In Atlas, create a separate database for the institute, or better a separate
cluster (or project) so its data, users and backups are fully apart from the
demo. Give it its own database user (1.1) and network access (1.2), and use
its own database name in the connection string (1.3), e.g.

```
mongodb+srv://sunrise-app:YOUR_PASSWORD@<institute-cluster>.mongodb.net/SunriseAcademy?retryWrites=true&w=majority
```

### 6.2 A separate Vercel project

Repeat section 3 as a **new Vercel project** (same repo), with:

- `MONGODB_URI` set to the institute's string from 6.1,
- its own `AUTH_SECRET` and `AUTH_URL`,
- **`DEMO_MODE` left unset.** Without it there are no one-click demo logins,
  no demo banner and no Reset button, and the reset action refuses on the
  server even if called directly.

Then sections 4 and 5 (check it, custom domain) as usual.

### 6.3 Create the first admin (once)

**Never run `npm run seed` / `seed:remote` here.** It would create the public
demo accounts (`admin@demo.auraedu.com` / `Admin@123` …). The seed refuses a
database that already has real accounts, but don't rely on that on an empty one.

Instead, from your computer, put the institute's `MONGODB_URI` in `.env` and run:

```bash
npm run setup:institute -- --confirm-remote --name "Asha Rao" --email asha@sunriseacademy.in --institute "Sunrise Academy" --branch "Main Branch"
```

- `--name`, `--email`: the institute's first admin (their own email, not a
  `@demo.auraedu.com` one; those are refused).
- `--institute`: the name printed on invoices and certificates.
- `--branch`: optional, creates the first branch.
- `--confirm-remote`: required for any database not on your computer. The
  script first prints the host and database it is writing to; check them.

It writes the institute profile (with the standard GST rules: 18% on coaching,
0% on books), the Master Data defaults (departments, designations, ID proofs,
lost reasons) and the admin account, and nothing else: no demo students,
tests or finance data. It prints a **one-time password once**. Hand it to the
admin securely (not in a shared chat), then switch `.env` back to your local
database.

The script refuses to run if the database already has any user, so running it
twice can't create a second "first" admin or overwrite the profile. To add
another admin later:

```bash
npm run setup:institute -- --confirm-remote --add-admin --name "Ravi Kumar" --email ravi@sunriseacademy.in
```

That only adds the admin (with its own one-time password); it changes nothing else.

### 6.4 First sign-in

The admin opens the institute's URL, signs in with their email and the
one-time password, and is asked to choose their own password before anything
else opens. Then, in **Settings**, they fill in the legal name, address, GSTIN,
PAN, support contacts and invoice terms, and add branches, batches, staff and
students.

---

## 7. Troubleshooting

**`/api/health` says `{"ok":false}` / logs show `MongoServerSelectionError`**
The app can't reach Atlas. In nearly every case Network Access is missing
`0.0.0.0/0`, or it is still pending (1.2). Also check the cluster isn't paused
(free clusters pause after long inactivity; click **Resume**). Vercel logs:
project → **Logs**.

**`bad auth : authentication failed`**
Wrong username or password in `MONGODB_URI`. Check the user in Database Access,
make sure special characters are encoded (1.4), and that you didn't leave the
`<` `>` brackets from the template. Simplest fix: **Edit** the user → new
letters-and-digits password → update `MONGODB_URI` → redeploy.

**Login goes back to /login, or loops**
`AUTH_URL` doesn't match the address in the browser bar (e.g. a custom domain
or `www.` vs no `www.`, `http` vs `https`). Set it to exactly the URL you're
using, without a trailing `/`, and redeploy. Also confirm `AUTH_SECRET` and
`AUTH_TRUST_HOST=true` are set for that environment (Production vs Preview).

**`db already exists with different case already have: [auraedu] trying to create [AuraEdu]`**
The cluster already has a database whose name differs only in capital letters.
Pick one spelling: in Atlas **Database → Browse Collections**, delete the
database you don't want (only if it holds nothing you need), or change
`MONGODB_URI` to use the existing spelling. Then use that spelling everywhere,
including in `.env` for `seed:remote`.

**`npm run seed` says "Refusing to seed"**
Working as intended: `.env` points at a remote database. Use
`npm run seed:remote` if you mean it (section 2).

**Too many login attempts**
After 5 failed logins an email+IP is locked out for 15 minutes. The counter
lives in MongoDB (the `ratelimits` collection), so every Vercel instance shares
it and restarts don't reset it; old entries delete themselves. A successful
login clears it. If the database can't be reached, the limiter lets the attempt
through and logs a warning instead of locking everyone out.

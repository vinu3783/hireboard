<h1 align="center">Hireboard</h1>

<p align="center">
  <strong>A simple applicant tracking system (ATS) for small recruiting teams.</strong><br/>
  Track candidates, move them through hiring stages, find anyone in seconds and see your pipeline at a glance.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/unit_tests-36_passing-2ea44f" />
</p>

<p align="center">
  🎥 <a href="https://www.loom.com/share/7df1470744fb42a1a4607c9c62bbe045"><strong>Watch the demo video</strong></a>
</p>

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Hireboard dashboard" width="900" />
</p>

> Built for the **EarlyJobs.ai Full Stack Developer Intern** assignment: manage candidates, hiring stages, search and dashboard metrics.

---

## Contents

1. [What it does](#what-it-does)
2. [Visual tour](#visual-tour)
3. [Run it locally](#run-it-locally)
4. [How it's built](#how-its-built)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Known limitations](#known-limitations)

---

## What it does

| | Feature | In short |
| :-: | --- | --- |
| 📊 | **Dashboard** | Live counts of candidates, interviews and offers, a stage-by-stage chart and recent activity |
| 👤 | **Candidate management** | Add, view, edit and delete candidates, with clear error messages for bad or duplicate input |
| 🗂️ | **Hiring pipeline** | A board with 7 stages. Move a candidate with one click or by dragging the card |
| 🔍 | **Search and filters** | Search by name or email, then filter by stage, job title and source and sort the results |
| 🕒 | **Activity history** | Every new candidate, edit and stage change is recorded with a timestamp |
| 💾 | **Saved data** | Everything is stored in a PostgreSQL database, so nothing is lost on refresh |

**Hiring stages:** Applied → Screening → Technical Interview → Final Interview → Offer → Hired, plus Rejected.

---

## Visual tour

### 1. Dashboard: the whole pipeline at a glance

<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="900" />

- **Four headline numbers:** total candidates, candidates still active, interviews scheduled and offers made. All of them are calculated from the database every time the page loads; none are hard-coded.
- **Candidates by stage:** a bar for each hiring stage, with Hired and Rejected shown separately as outcomes.
- **Recent activity:** the latest additions, edits and stage changes.
- **Everything is clickable:** click a number or a stage bar to open the candidate list, already filtered to those candidates.

---

### 2. Candidates: search, filter and sort

<img src="docs/screenshots/candidates.png" alt="Candidate list" width="900" />

- **Search** by name or email. Results update as you type.
- **Filter** by stage (click the coloured chips, more than one at a time), by job title and by source (LinkedIn, referral and so on).
- **Sort** by newest or oldest application, or by name A–Z or Z–A.
- **Combine** search, filters and sorting freely. **Clear filters** resets everything.
- The list shows **10 candidates per page**, with Previous and Next buttons.

Filters are saved in the page URL, so a filtered view can be bookmarked or shared. Here the list is filtered to the two interview stages and sorted by name:

<img src="docs/screenshots/candidates-filtered.png" alt="Filtered candidate list" width="900" />

---

### 3. Candidate profile: everything about one person

<img src="docs/screenshots/candidate-profile.png" alt="Candidate profile" width="900" />

- **Profile:** contact details, the job applied for, experience, source, application date, resume link and skills.
- **Recruiter notes:** free-text notes about the candidate.
- **Hiring stage:** change the stage from the menu, or use the one-click **Move to [next stage]** and **Reject** buttons.
- **Activity:** a timeline of everything that happened to this candidate, with dates and times.
- **Edit** and **Delete** are at the top right. Delete asks for confirmation first.

---

### 4. Pipeline: a board of all candidates by stage

<img src="docs/screenshots/pipeline.png" alt="Pipeline board" width="900" />

- There's one column per stage, and each column shows its candidate count.
- **To move a candidate**, pick a new stage from the menu on their card, or drag the card to another column.
- The card moves immediately. If the save fails, it moves back and an error message appears.
- Every move is saved, updates the dashboard and is added to the candidate's activity history.

---

### 5. Adding a candidate, with helpful validation

<img src="docs/screenshots/add-candidate-validation.png" alt="Add candidate form with validation errors" width="900" />

- Required fields are marked with **\***.
- Problems are shown **right under the field**, as soon as you leave it and again when you submit.
- **Duplicate emails are blocked.** You can't add the same person twice, even if the email is typed with different capital letters.
- The same rules run in the browser and on the server, so bad data can't be saved by any route.

---

### 6. Empty state and mobile view

When there are no candidates yet, each page explains what to do next instead of showing a blank screen:

<img src="docs/screenshots/empty-state.png" alt="Empty state" width="900" />

The layout adapts to tablets and phones:

<p>
  <img src="docs/screenshots/mobile-dashboard.png" alt="Mobile dashboard" width="300" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-candidates.png" alt="Mobile candidate list" width="300" />
</p>

---

## Run it locally

**You need:** Node.js 20.9 or newer, and a PostgreSQL database. If you don't have Postgres installed, step 3 starts one for you.

```bash
# 1. Get the code
git clone https://github.com/vinu3783/hireboard.git
cd hireboard

# 2. Install dependencies
npm install

# 3. Start a local Postgres (no install needed). It prints the connection URLs.
npm run db:local

# 4. Create your .env file and paste in the "TCP" URL printed in step 3
cp .env.example .env

# 5. Create the tables and load 18 sample candidates
npm run db:migrate
npm run db:seed

# 6. Start the app at http://localhost:3000
npm run dev
```

<details>
<summary><strong>Example <code>.env</code> for the local database from step 3</strong></summary>

The local Prisma Postgres server shares a single session, so add `pgbouncer=true&connection_limit=1`:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=1"
```

With any other Postgres (Docker, Postgres.app, Neon), use your normal connection string for both values.
</details>

<details>
<summary><strong>All npm scripts</strong></summary>

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build / start the production server |
| `npm test` | Run the unit tests |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript checks |
| `npm run db:local` | Start a local Postgres with Prisma |
| `npm run db:migrate` | Create or apply database migrations |
| `npm run db:seed` | Add the sample candidates. Safe to run again: no duplicates are created |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:reset` | ⚠️ Delete all data, recreate the tables and re-seed |
</details>

---

## How it's built

| Layer | Technology |
| --- | --- |
| Frontend and backend | **Next.js 15** (App Router) with **React 19** and **TypeScript** |
| Styling | **Tailwind CSS 4** |
| Database | **PostgreSQL** with the **Prisma** ORM |
| Validation | **Zod**: one set of rules shared by the form and the API |
| Testing | **Vitest** |

**How a request works**
- **Pages** are rendered on the server and read from the database directly, so pages arrive with their data already in place.
- **Changes** (create, edit, delete, move stage) go through a small JSON API. After a change, the page refreshes its data, which is why the dashboard and pipeline always match.

<details>
<summary><strong>Project structure</strong></summary>

```
src/
├── app/                      Pages and API routes
│   ├── (overview)/           Dashboard
│   ├── candidates/           List, add, profile, edit
│   ├── pipeline/             Kanban board
│   └── api/candidates/       JSON API (create, read, update, delete, change stage)
├── components/               UI pieces (forms, tables, board, dashboard widgets)
└── lib/
    ├── db.ts                 Database client
    └── candidates/
        ├── schema.ts         Validation rules (shared by browser and server)
        ├── query.ts          Turns search/filter settings into database queries
        ├── metrics.ts        Dashboard calculations
        ├── activity.ts       Activity history text
        └── service.ts        All database reads and writes
prisma/
├── schema.prisma             Data model
├── migrations/               Database migrations
└── seed.ts                   Sample data
```
</details>

<details>
<summary><strong>Data model</strong></summary>

**Candidate:** full name, email (unique), phone, job title, years of experience, skills (a list), stage, source, application date, recruiter notes, resume URL.

**Activity:** one row per event (created, updated, stage changed or deleted). It records which stage the candidate moved from and to, which fields changed, and when. Each event keeps the candidate's name, so the history still reads correctly after a candidate is deleted.

Stage and source are fixed lists (database enums), so typos like "Screning" can't get into the data.
</details>

<details>
<summary><strong>How the dashboard numbers are calculated</strong></summary>

| Metric | Counts candidates currently in… |
| --- | --- |
| Total candidates | Any stage |
| Active in pipeline | Applied, Screening, Technical Interview, Final Interview or Offer |
| Interviews scheduled | Technical Interview or Final Interview |
| Offers made | Offer or Hired (hired candidates accepted an offer) |
</details>

<details>
<summary><strong>API reference</strong></summary>

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/candidates?q=&stage=&job=&source=&sort=&page=` | List candidates, with filters |
| `POST` | `/api/candidates` | Create a candidate |
| `GET` | `/api/candidates/:id` | Get one candidate |
| `PATCH` | `/api/candidates/:id` | Update a candidate |
| `PATCH` | `/api/candidates/:id/stage` | Change the stage only |
| `DELETE` | `/api/candidates/:id` | Delete a candidate |

Successful responses look like `{ "data": ... }`. Errors look like `{ "error": { "code", "message", "fieldErrors" } }`, with status 400 (bad JSON), 404 (not found), 409 (duplicate email), 422 (invalid fields) or 503 (database unavailable).
</details>

---

## Testing

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- **36 unit tests** cover the validation rules, search and filter logic, pagination, dashboard calculations and activity history.
- **Browser walkthrough:** the main workflows were checked in Chrome against a production build. These covered adding, editing and deleting candidates, the duplicate-email error, combined search and filters, moving stages, the dashboard updating after changes, data staying after a refresh, and the mobile layout.
- **Edge cases:** empty states and database-outage handling were checked by hand.

---

## Deployment

The app is designed for **Vercel** with a **Neon** Postgres database. A file-based database like SQLite doesn't persist on Vercel, which is why Hireboard uses Postgres.

1. Create a free database at [neon.tech](https://neon.tech) and copy its **pooled** and **direct** connection strings.
2. Import this repository into [Vercel](https://vercel.com/new).
3. Add two environment variables in Vercel:
   - `DATABASE_URL`: the pooled connection string, with `&pgbouncer=true` added to the end
   - `DIRECT_URL`: the direct connection string
4. Deploy. Database migrations run automatically during the build.
5. Load the sample data once, from your computer:
   ```bash
   DATABASE_URL="<pooled url>" DIRECT_URL="<direct url>" npm run db:seed
   ```

---

## Known limitations

These are deliberate trade-offs for a time-boxed assignment:

- **No login.** Anyone with the link can view and change data. A real deployment needs authentication.
- **Job titles are free text** (with suggestions), not a separate "Jobs" list.
- **"Interviews scheduled" is based on stage.** There's no calendar or interview times.
- **No edit-conflict warning.** If two people edit the same candidate at once, the last save wins.
- **Drag and drop needs a mouse.** On keyboard and touch devices, use the stage menu on each card.

---

<p align="center">
  Made by <strong>Vinayaka GC</strong> · <a href="https://www.loom.com/share/7df1470744fb42a1a4607c9c62bbe045">Demo video</a> · <a href="docs/demo-script.md">Demo walkthrough script</a>
</p>

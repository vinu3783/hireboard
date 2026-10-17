# Hireboard

Hireboard is a compact applicant tracking system (ATS) for small recruiting teams. Recruiters can add candidates, move them through a seven-stage hiring pipeline, search and filter the candidate list, and see live pipeline metrics on a dashboard. Every change is written to an activity log.

![Dashboard](docs/screenshots/dashboard.png)

> **Status:** demo application without authentication — see [Known limitations](#known-limitations-and-trade-offs).

## Features

**Dashboard**
- Total candidates, active-in-pipeline, interviews scheduled and offers made, all calculated from the database on every request.
- "Candidates by stage" bar chart. Each row links to the candidate list filtered to that stage.
- Recent activity feed (creations, edits, stage changes, deletions) and a "top roles" breakdown.
- Each metric card links to the matching filtered list. For example, *Interviews scheduled* opens `/candidates?stage=TECHNICAL_INTERVIEW,FINAL_INTERVIEW`.

**Candidate management**
- Create, view, edit and delete (delete asks for confirmation in an accessible `<dialog>`).
- Shared Zod validation on the client and the server, with inline errors on blur and on submit. Focus moves to the first invalid field.
- Duplicate emails are rejected case-insensitively. Emails are stored lower-cased and protected by a unique index, so concurrent requests can't create duplicates either.
- Structured data: Postgres enums for stage and source, a `text[]` column for skills, an integer for years of experience, and a date for the application date.

**Hiring pipeline**
- Stages: Applied → Screening → Technical Interview → Final Interview → Offer → Hired, plus Rejected.
- A kanban board with a stage `<select>` on every card. The select works with a keyboard, screen readers and touch. Mouse users can also drag and drop cards.
- Moves update the board immediately, are rolled back if the API call fails, and are logged in the activity history.
- The candidate profile has "Move to *next stage*" and "Reject" shortcuts.

**Search, filtering and sorting**
- Search by name or email (case-insensitive, debounced).
- Filter by stage (multi-select chips), job title and source. Sort by application date or name. Paginated at 10 per page.
- All filters combine and live in the URL, so filtered views can be shared and the dashboard can link straight to them.
- Separate empty states for "no candidates yet" and "no candidates match these filters".

**Activity history**
- An append-only `Activity` table records `CREATED`, `UPDATED` (with the changed field names), `STAGE_CHANGED` (from → to) and `DELETED` events.
- Events are written in the same transaction as the change they describe.
- Events keep a snapshot of the candidate's name, so the dashboard feed still makes sense after a candidate is deleted.

**Robustness**
- One JSON response shape across the API: `{ data }` on success, `{ error: { code, message, fieldErrors? } }` on failure. Status codes: 400 invalid JSON, 404 not found, 409 duplicate email, 422 validation, 500 unexpected error, 503 database unreachable.
- Pages have loading skeletons, a "not found" page for missing candidates, and an error boundary with a retry button for database outages.
- Accessibility: a skip link, visible focus rings, labelled controls, `aria-pressed` filter chips, `aria-live` toasts, and stage colour always paired with a text label.

## Screenshots

| Candidates (search, filters, sort) | Candidate profile + activity |
| --- | --- |
| ![Candidates](docs/screenshots/candidates.png) | ![Profile](docs/screenshots/candidate-profile.png) |
| **Pipeline board** | **Add candidate with inline validation** |
| ![Pipeline](docs/screenshots/pipeline.png) | ![Validation](docs/screenshots/add-candidate-validation.png) |
| **Filtered list (from the dashboard)** | **Empty state** |
| ![Filtered](docs/screenshots/candidates-filtered.png) | ![Empty](docs/screenshots/empty-state.png) |

Mobile: [dashboard](docs/screenshots/mobile-dashboard.png) · [candidates](docs/screenshots/mobile-candidates.png)

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript | Server components read from the database directly; route handlers provide the JSON API |
| Styling | Tailwind CSS v4 with design tokens in `globals.css` | Fast to build with and keeps the visual system in one place |
| Database | PostgreSQL via Prisma 6 | Enums, arrays, case-insensitive search, and it runs on serverless hosts (SQLite does not persist on Vercel) |
| Validation | Zod 4 | One schema shared by the form and the API |
| Tests | Vitest | Fast unit tests for the business logic |

No chart or UI-kit dependency is used: the one chart is a small set of CSS bars, and the UI primitives in `src/components/ui` cover what the app needs.

## Architecture

```
src/
  app/                       Routes (server components unless marked "use client")
    (overview)/page.tsx      Dashboard  (route group so its loading skeleton doesn't wrap other pages)
    candidates/              List, new, [id] profile, [id]/edit
    pipeline/                Kanban board
    api/candidates/…         REST route handlers
  components/
    ui/                      Button, Field, Panel, StageBadge, Toast, ConfirmDialog, …
    candidates/ pipeline/ dashboard/ layout/
  lib/
    db.ts                    Prisma client singleton
    errors.ts / api.ts       AppError, Prisma error mapping, response helpers
    api-client.ts            Browser fetch wrapper that surfaces field errors
    candidates/
      constants.ts           Stages, sources, labels, stage groups (client-safe)
      schema.ts              Zod input schema shared by client and server
      query.ts               URL params → Prisma where/orderBy, pagination
      metrics.ts             Dashboard metrics from per-stage counts
      diff.ts / activity.ts  Change detection + human-readable activity text
      service.ts             All database reads and writes (server-only)
prisma/
  schema.prisma, migrations/, seed.ts
```

**How data flows**
- **Reads:** pages are server components. They call `lib/candidates/service.ts` directly; there is no client-side data fetching for the initial render.
- **Writes:** client components call the JSON API (`POST /api/candidates`, `PATCH /api/candidates/:id`, `PATCH /api/candidates/:id/stage`, `DELETE /api/candidates/:id`) and then `router.refresh()`. The pages re-render with fresh data, so the dashboard and pipeline are always up to date after a change.
- **Layering:** pure logic (validation, query building, metrics, diffing) has no database dependency and is unit tested. `service.ts` is the only module that touches Prisma.

### Data model

```prisma
enum Stage        { APPLIED SCREENING TECHNICAL_INTERVIEW FINAL_INTERVIEW OFFER HIRED REJECTED }
enum Source       { LINKEDIN REFERRAL CAREERS_PAGE JOB_BOARD AGENCY OTHER }
enum ActivityType { CREATED UPDATED STAGE_CHANGED DELETED }

model Candidate {
  id, fullName, email (unique, lower-cased), phone?, jobTitle, yearsExperience?,
  skills String[], stage Stage, source Source, appliedAt, notes?, resumeUrl?,
  createdAt, updatedAt, activities Activity[]
}

model Activity {
  id, type, candidateId? (SET NULL on delete), candidateName (snapshot),
  fromStage?, toStage?, changedFields String[], createdAt
}
```

### Metric definitions

Each metric is a sum of per-stage counts, computed in `lib/candidates/metrics.ts`.

| Metric | Definition |
| --- | --- |
| Total candidates | All candidates |
| Active in pipeline | Applied + Screening + Technical Interview + Final Interview + Offer (excludes Hired and Rejected) |
| Interviews scheduled | Technical Interview + Final Interview |
| Offers made | Offer + Hired (a hired candidate has accepted an offer) |

## Local setup

Requirements: Node.js 20.9+ and a PostgreSQL database.

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then set DATABASE_URL and DIRECT_URL
npm run db:migrate          # apply migrations (prisma migrate dev)
npm run db:seed             # load 18 fictional candidates (safe to re-run)
npm run dev                 # http://localhost:3000
```

**No local Postgres?** Prisma ships a local Postgres server that needs no install:

```bash
npm run db:local            # = prisma dev --name hireboard --detach; prints the connection URLs
```

Copy the `TCP` URL it prints into `.env`. That server shares one session across all connections, so add `pgbouncer=true&connection_limit=1`:

```
DATABASE_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=1"
```

Any other Postgres (Docker, Postgres.app, a free Neon branch) works with plain connection strings.

### Environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `DATABASE_URL` | App runtime | Postgres connection string. Use the **pooled** URL on Neon/Vercel. |
| `DIRECT_URL` | `prisma migrate` | Direct, non-pooled connection used for migrations. Locally it can equal `DATABASE_URL`. |

`.env` is git-ignored; only `.env.example` is committed.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply committed migrations (CI/production) |
| `npm run db:seed` | Seed fictional candidates. Idempotent: existing emails are skipped, so re-running never duplicates rows or overwrites your edits |
| `npm run db:reset` | Drop and recreate the database, then re-seed (destructive) |

## Testing

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

- **Unit tests (36):** schema validation and normalization (emails, phone, URLs, dates, skills), URL-param parsing and Prisma filter building, pagination clamping, metric calculations, change detection and activity descriptions.
- **End-to-end checks:** a scripted Chrome walkthrough (Playwright) was run against the production build. It covers dashboard metrics and metric links, validation and duplicate-email errors, create/edit/delete, combined search + filters + sort, pipeline moves, dashboard updates after changes, persistence across reloads, and mobile overflow. That script is not part of this repository.
- Empty states and database-outage handling (API returns 503, pages show the retry screen) were checked manually against a separate empty database.

## Deployment (Vercel + Neon)

SQLite would not persist on Vercel's serverless functions, so Hireboard uses Postgres everywhere.

1. **Create a database.** Create a free [Neon](https://neon.tech) project (or use Vercel → Storage → Neon). Copy both connection strings:
   - Pooled (host contains `-pooler`): append `&pgbouncer=true` → `DATABASE_URL`
   - Direct → `DIRECT_URL`
2. **Push to GitHub and import the repo into Vercel.** The framework is detected as Next.js.
3. **Set environment variables** in Vercel (Production and Preview): `DATABASE_URL` and `DIRECT_URL`.
4. **Deploy.** Vercel runs the `vercel-build` script: `prisma migrate deploy && next build`. Migrations are applied before every build, and `postinstall` generates the Prisma client.
5. **Seed once** from your machine, using the production URLs:
   ```bash
   DATABASE_URL="<pooled url>" DIRECT_URL="<direct url>" npm run db:seed
   ```
6. **Verify reads and writes:** open the deployed URL, add a candidate, move them to a new stage, reload the page and check the dashboard.

## Known limitations and trade-offs

- **No authentication or authorization.** Anyone with the URL can read and change data. This is fine for a demo with fictional data; a real deployment needs sign-in (e.g. Auth.js), per-organization data scoping and rate limiting.
- **Job titles are free text** (with suggestions from existing values) rather than a separate `Job` table. A `Job` model with open/closed status would be the next step.
- **"Interviews scheduled" is stage-based.** It counts candidates in an interview stage; there is no calendar or interview time slot model.
- **"Offers made" counts Offer + Hired.** Candidates who declined an offer and were moved to Rejected are not counted. Counting them would need a query over the activity history.
- **Last write wins.** Two recruiters editing the same candidate at the same time aren't warned; there is no optimistic locking.
- **Drag and drop is mouse-only** (native HTML5 DnD). The stage select on each card is the accessible path on keyboard and touch devices.
- **Missing-candidate pages return HTTP 200.** Profile pages stream behind a loading skeleton, so they render the "not found" UI with a 200 status. API routes return a real 404.
- **No root-level loading skeleton.** A loading boundary above `/candidates` stalled same-route search-param navigations (filters, pagination) in Next.js 15, so the list page shows an inline spinner in the search box instead.
- **Seeded activity is generated.** Seed data includes a plausible stage history for each candidate. All activity after seeding comes from real events.

## Demo

See [docs/demo-script.md](docs/demo-script.md) for a 2–3 minute walkthrough with narration.

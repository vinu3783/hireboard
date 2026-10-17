# Hireboard demo script (≈2½ minutes)

**Before recording**
- Start from freshly seeded data (`npm run db:seed` on an empty database).
- Keep the deployed URL open in one tab and the GitHub repository in another.
- Use a desktop browser window at about 1360 px wide.

| # | Time | On screen | Narration |
| --- | --- | --- | --- |
| 1 | 0:00 | Dashboard | "This is Hireboard, a small applicant tracking system I built with Next.js, Prisma and Postgres. The dashboard is calculated live from the database: 18 candidates, 12 still active, 4 in interview rounds and 4 offers, 2 of them accepted." |
| 2 | 0:15 | Hover the *Candidates by stage* rows, then click **Interviews scheduled** | "Every metric and every stage bar links to a filtered candidate list. This one opens the list with the Technical and Final Interview filters already applied." |
| 3 | 0:30 | Click **Add candidate**. Click **Add candidate** on the empty form, type a bad email, then type an existing email (`aarav.mehta@example.com`) | "Validation uses one Zod schema shared by the browser and the API. Required fields and email format are checked inline. Duplicate emails are rejected by the server, case-insensitively, and the error appears next to the field." |
| 4 | 0:50 | Fill in a new candidate (e.g. *Zara Quinn*, QA Engineer, Referral, skills `Playwright, Cypress`) and save | "After saving, we land on the profile. Skills are stored as a structured list, and the activity log has already recorded the creation." |
| 5 | 1:05 | Go to **Candidates**. Type `zara`, clear it, toggle the **Screening** chip, choose **Job title → Frontend Engineer**, change sort to **Name A–Z**, then **Clear filters** | "Search, stage, job title, source and sort all combine, and they're stored in the URL, so a filtered view can be shared or bookmarked." |
| 6 | 1:25 | Open a candidate, e.g. *Sofia Lindqvist* | "The profile shows contact details, skills, experience, recruiter notes and the full stage history with timestamps." |
| 7 | 1:40 | Click **Move to Offer**, then open **Pipeline** and use a card's stage menu (or drag a card) to move someone to *Technical Interview* | "Stage changes are saved through a dedicated endpoint and logged in the same database transaction. On the board the card moves immediately, and the change is rolled back with an error message if the save fails." |
| 8 | 2:00 | Go back to the **Dashboard** | "The dashboard reflects the changes. Offers went up, and the recent activity feed shows each stage change. Refreshing the page proves the data is persisted." Press ⌘R. |
| 9 | 2:15 | Switch to the deployed URL, add or move a candidate, then refresh | "This is the deployed version on Vercel with a Neon Postgres database, reading and writing the same way." |
| 10 | 2:30 | GitHub README | "The README covers setup, the data model, the test suite of 36 unit tests, and known limitations: most importantly, there's no authentication, because this is a demo." |

**Tips**
- Delete the demo candidate after recording so the next run starts clean. This also shows the confirmation dialog.
- If the deployment isn't ready, record steps 1–8 locally and say so in the video.

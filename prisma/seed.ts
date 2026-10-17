// Seeds fictional candidates. Safe to run repeatedly: candidates are keyed by
// email and existing ones are left untouched (including any edits you made).
//
// Each seeded candidate gets a believable stage history so the activity
// timeline isn't empty. Dates are relative to "now" so the dashboard stays fresh.

import { PrismaClient, type Source, type Stage } from "@prisma/client";

const prisma = new PrismaClient();

const HAPPY_PATH: Stage[] = ["APPLIED", "SCREENING", "TECHNICAL_INTERVIEW", "FINAL_INTERVIEW", "OFFER", "HIRED"];

interface SeedCandidate {
  fullName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  yearsExperience?: number;
  skills: string[];
  source: Source;
  daysAgo: number;
  /** Furthest happy-path stage reached. */
  reached: Stage;
  rejected?: boolean;
  notes?: string;
  resumeUrl?: string;
}

const candidates: SeedCandidate[] = [
  { fullName: "Aarav Mehta", email: "aarav.mehta@example.com", phone: "+91 98450 11223", jobTitle: "Frontend Engineer", yearsExperience: 3, skills: ["React", "TypeScript", "CSS"], source: "LINKEDIN", daysAgo: 2, reached: "APPLIED", notes: "Portfolio shows strong attention to accessibility." },
  { fullName: "Priya Raman", email: "priya.raman@example.com", jobTitle: "Backend Engineer", yearsExperience: 5, skills: ["Node.js", "PostgreSQL", "AWS"], source: "REFERRAL", daysAgo: 4, reached: "SCREENING", notes: "Referred by the platform team. Interested in payments work." },
  { fullName: "Daniel Okafor", email: "daniel.okafor@example.com", phone: "+44 7700 900123", jobTitle: "Full Stack Developer Intern", yearsExperience: 0, skills: ["JavaScript", "React", "Express"], source: "CAREERS_PAGE", daysAgo: 1, reached: "APPLIED" },
  { fullName: "Sofia Lindqvist", email: "sofia.lindqvist@example.com", jobTitle: "Product Designer", yearsExperience: 6, skills: ["Figma", "Design Systems", "User Research"], source: "LINKEDIN", daysAgo: 18, reached: "FINAL_INTERVIEW", notes: "Excellent case study on onboarding flows.", resumeUrl: "https://example.com/resumes/sofia-lindqvist.pdf" },
  { fullName: "Kenji Watanabe", email: "kenji.watanabe@example.com", jobTitle: "DevOps Engineer", yearsExperience: 7, skills: ["Kubernetes", "Terraform", "CI/CD"], source: "AGENCY", daysAgo: 25, reached: "OFFER", notes: "Offer sent; expecting a response by Friday." },
  { fullName: "Meera Iyer", email: "meera.iyer@example.com", phone: "+91 99001 44556", jobTitle: "Data Analyst", yearsExperience: 2, skills: ["SQL", "Python", "Tableau"], source: "JOB_BOARD", daysAgo: 9, reached: "TECHNICAL_INTERVIEW" },
  { fullName: "Lucas Ferreira", email: "lucas.ferreira@example.com", jobTitle: "Backend Engineer", yearsExperience: 4, skills: ["Go", "gRPC", "Redis"], source: "LINKEDIN", daysAgo: 32, reached: "HIRED", notes: "Accepted offer. Starts on the 1st." },
  { fullName: "Hannah Becker", email: "hannah.becker@example.com", jobTitle: "Frontend Engineer", yearsExperience: 2, skills: ["Vue", "JavaScript", "Testing Library"], source: "CAREERS_PAGE", daysAgo: 14, reached: "TECHNICAL_INTERVIEW", rejected: true, notes: "Take-home assignment was incomplete." },
  { fullName: "Omar Haddad", email: "omar.haddad@example.com", jobTitle: "Full Stack Developer Intern", yearsExperience: 1, skills: ["Next.js", "Prisma", "Tailwind CSS"], source: "REFERRAL", daysAgo: 6, reached: "SCREENING" },
  { fullName: "Chloé Martin", email: "chloe.martin@example.com", jobTitle: "Product Designer", yearsExperience: 3, skills: ["Figma", "Prototyping"], source: "JOB_BOARD", daysAgo: 11, reached: "SCREENING", rejected: true, notes: "Looking for a fully remote role; we need hybrid." },
  { fullName: "Ravi Shankar", email: "ravi.shankar@example.com", phone: "+91 90080 77889", jobTitle: "DevOps Engineer", yearsExperience: 4, skills: ["AWS", "Docker", "Prometheus"], source: "LINKEDIN", daysAgo: 13, reached: "TECHNICAL_INTERVIEW" },
  { fullName: "Grace Thompson", email: "grace.thompson@example.com", jobTitle: "Data Analyst", yearsExperience: 5, skills: ["SQL", "dbt", "Looker"], source: "REFERRAL", daysAgo: 21, reached: "FINAL_INTERVIEW" },
  { fullName: "Mateo Rossi", email: "mateo.rossi@example.com", jobTitle: "Frontend Engineer", yearsExperience: 6, skills: ["React", "Next.js", "GraphQL"], source: "AGENCY", daysAgo: 28, reached: "OFFER" },
  { fullName: "Nadia Petrova", email: "nadia.petrova@example.com", jobTitle: "Backend Engineer", yearsExperience: 8, skills: ["Java", "Spring Boot", "Kafka"], source: "LINKEDIN", daysAgo: 40, reached: "HIRED" },
  { fullName: "Ethan Clarke", email: "ethan.clarke@example.com", jobTitle: "Full Stack Developer Intern", yearsExperience: 0, skills: ["Python", "Django", "React"], source: "CAREERS_PAGE", daysAgo: 3, reached: "APPLIED" },
  { fullName: "Ananya Kulkarni", email: "ananya.kulkarni@example.com", jobTitle: "Data Analyst", yearsExperience: 1, skills: ["Excel", "SQL", "Power BI"], source: "OTHER", daysAgo: 16, reached: "APPLIED", rejected: true, notes: "Role requires 2+ years with SQL." },
  { fullName: "Samuel Adeyemi", email: "samuel.adeyemi@example.com", jobTitle: "Frontend Engineer", yearsExperience: 4, skills: ["Angular", "RxJS", "TypeScript"], source: "JOB_BOARD", daysAgo: 8, reached: "SCREENING" },
  { fullName: "Isabella García", email: "isabella.garcia@example.com", jobTitle: "Product Designer", yearsExperience: 4, skills: ["Figma", "Interaction Design", "Accessibility"], source: "REFERRAL", daysAgo: 20, reached: "FINAL_INTERVIEW", rejected: true, notes: "Strong portfolio, but accepted another offer." },
];

const DAY = 86_400_000;

function utcMidnight(daysAgo: number): Date {
  const date = new Date(Date.now() - daysAgo * DAY);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Builds the stage transitions a candidate went through, spaced across their application window. */
function buildHistory(seed: SeedCandidate) {
  const reachedIndex = HAPPY_PATH.indexOf(seed.reached);
  const path = HAPPY_PATH.slice(0, reachedIndex + 1);
  if (seed.rejected) path.push("REJECTED");

  const appliedAt = utcMidnight(seed.daysAgo);
  // Spread events between 9:30am on the application day and roughly now.
  const start = appliedAt.getTime() + 9.5 * 3_600_000;
  const span = Math.max(Date.now() - start - 3_600_000, 0);
  const step = path.length > 1 ? span / (path.length - 1) : 0;

  const events = path.map((stage, index) => ({
    type: index === 0 ? ("CREATED" as const) : ("STAGE_CHANGED" as const),
    fromStage: index === 0 ? null : path[index - 1],
    toStage: stage,
    createdAt: new Date(start + step * index),
  }));
  return { appliedAt, stage: path[path.length - 1], events };
}

async function main() {
  let created = 0;
  for (const seed of candidates) {
    const exists = await prisma.candidate.findUnique({ where: { email: seed.email }, select: { id: true } });
    if (exists) continue;

    const { appliedAt, stage, events } = buildHistory(seed);
    const { daysAgo: _daysAgo, reached: _reached, rejected: _rejected, ...fields } = seed;
    await prisma.candidate.create({
      data: {
        ...fields,
        stage,
        appliedAt,
        createdAt: events[0].createdAt,
        activities: { create: events.map((event) => ({ ...event, candidateName: seed.fullName })) },
      },
    });
    created++;
  }
  console.log(`Seed complete: ${created} created, ${candidates.length - created} already present.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

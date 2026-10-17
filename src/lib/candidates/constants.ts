// Domain constants shared by server and client code. These mirror the Prisma
// enums but live here so client components don't import @prisma/client.

export const STAGES = [
  "APPLIED",
  "SCREENING",
  "TECHNICAL_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  TECHNICAL_INTERVIEW: "Technical Interview",
  FINAL_INTERVIEW: "Final Interview",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

/** Stages where a candidate is still moving through the funnel. */
export const ACTIVE_STAGES: readonly Stage[] = [
  "APPLIED",
  "SCREENING",
  "TECHNICAL_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER",
];
export const INTERVIEW_STAGES: readonly Stage[] = ["TECHNICAL_INTERVIEW", "FINAL_INTERVIEW"];
/** An offer has been made to anyone currently in Offer or already Hired. */
export const OFFER_STAGES: readonly Stage[] = ["OFFER", "HIRED"];

export const SOURCES = [
  "LINKEDIN",
  "REFERRAL",
  "CAREERS_PAGE",
  "JOB_BOARD",
  "AGENCY",
  "OTHER",
] as const;
export type Source = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<Source, string> = {
  LINKEDIN: "LinkedIn",
  REFERRAL: "Referral",
  CAREERS_PAGE: "Careers page",
  JOB_BOARD: "Job board",
  AGENCY: "Agency",
  OTHER: "Other",
};

export const SORT_OPTIONS = ["applied_desc", "applied_asc", "name_asc", "name_desc"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  applied_desc: "Newest applications",
  applied_asc: "Oldest applications",
  name_asc: "Name A–Z",
  name_desc: "Name Z–A",
};

export const PAGE_SIZE = 10;

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

export function isSource(value: unknown): value is Source {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

/** The stage that follows `stage` in the happy path, or null for terminal stages. */
export function nextStage(stage: Stage): Stage | null {
  const index = ACTIVE_STAGES.indexOf(stage);
  if (index === -1) return null;
  return index === ACTIVE_STAGES.length - 1 ? "HIRED" : ACTIVE_STAGES[index + 1];
}

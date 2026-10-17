import type { CandidateInput } from "./schema";

/** Fields tracked in UPDATED activity events. Stage changes get their own event. */
const TRACKED_FIELDS = [
  "fullName",
  "email",
  "phone",
  "jobTitle",
  "yearsExperience",
  "skills",
  "source",
  "appliedAt",
  "notes",
  "resumeUrl",
] as const satisfies readonly (keyof CandidateInput)[];

export type TrackedField = (typeof TRACKED_FIELDS)[number];

export const FIELD_LABELS: Record<TrackedField, string> = {
  fullName: "name",
  email: "email",
  phone: "phone",
  jobTitle: "job title",
  yearsExperience: "experience",
  skills: "skills",
  source: "source",
  appliedAt: "application date",
  notes: "notes",
  resumeUrl: "resume link",
};

function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.getTime();
  if (Array.isArray(value)) return JSON.stringify(value);
  return value ?? null;
}

/** Returns the names of tracked fields whose values differ. */
export function diffCandidate(
  before: Pick<CandidateInput, TrackedField>,
  after: Pick<CandidateInput, TrackedField>,
): TrackedField[] {
  return TRACKED_FIELDS.filter((field) => normalize(before[field]) !== normalize(after[field]));
}

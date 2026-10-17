import { z } from "zod";
import { SOURCES, STAGES } from "./constants";

// One schema validates both the client form and the API body, so the rules
// can't drift apart. It accepts raw form values (strings) and normalizes them.

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const optionalText = (max: number, label: string) =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(max, `${label} must be ${max} characters or fewer`).nullable().optional(),
  ).transform((value) => value ?? null);

/** Splits "React, node ,react" into ["React", "node"] (trimmed, de-duplicated case-insensitively). */
export function normalizeSkills(input: string | string[]): string[] {
  const parts = Array.isArray(input) ? input : input.split(",");
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of parts) {
    const skill = part.trim().replace(/\s+/g, " ");
    const key = skill.toLowerCase();
    if (skill && !seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
  }
  return result;
}

/** Parses "YYYY-MM-DD" (from <input type="date">) or an ISO string into a UTC date. */
function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date(NaN) : date;
}

export const candidateInputSchema = z.object({
  fullName: z
    .string({ error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be 120 characters or fewer"),
  email: z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .pipe(z.email("Enter a valid email address")),
  phone: z
    .preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(/^\+?[\d\s().-]{7,20}$/, "Enter a valid phone number")
        .nullable()
        .optional(),
    )
    .transform((value) => value ?? null),
  jobTitle: z
    .string({ error: "Job title is required" })
    .trim()
    .min(2, "Job title is required")
    .max(120, "Job title must be 120 characters or fewer"),
  yearsExperience: z
    .preprocess(
      (value) => {
        const v = emptyToNull(value);
        return typeof v === "string" ? Number(v) : v;
      },
      z
        .number({ error: "Years of experience must be a number" })
        .int("Use whole years")
        .min(0, "Years of experience can't be negative")
        .max(60, "Years of experience looks too high")
        .nullable()
        .optional(),
    )
    .transform((value) => value ?? null),
  skills: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => normalizeSkills(value ?? []))
    .pipe(
      z
        .array(z.string().max(40, "Each skill must be 40 characters or fewer"))
        .max(30, "Add at most 30 skills"),
    ),
  stage: z.enum(STAGES, { error: "Choose a valid stage" }).default("APPLIED"),
  source: z.enum(SOURCES, { error: "Choose where the candidate came from" }),
  appliedAt: z.preprocess(
    parseDate,
    z
      .date({
        // parseDate yields undefined for a blank value and an Invalid Date for garbage.
        error: (issue) => (issue.input === undefined ? "Application date is required" : "Enter a valid date"),
      })
      // Allow one day of slack so "today" works in every timezone.
      .refine((date) => date.getTime() <= Date.now() + 86_400_000, "Application date can't be in the future"),
  ),
  notes: optionalText(5000, "Notes"),
  resumeUrl: z
    .preprocess(
      emptyToNull,
      z
        .url({ protocol: /^https?$/, error: "Enter a valid http(s) URL" })
        .max(500, "URL is too long")
        .nullable()
        .optional(),
    )
    .transform((value) => value ?? null),
});

/** Raw values as they come from the form / request body. */
export type CandidateFormValues = z.input<typeof candidateInputSchema>;
/** Normalized values ready to persist. */
export type CandidateInput = z.output<typeof candidateInputSchema>;

export const stageChangeSchema = z.object({
  stage: z.enum(STAGES, { error: "Choose a valid stage" }),
});

export type FieldErrors = Partial<Record<string, string>>;

/** Flattens a ZodError into `{ field: firstMessage }` for inline form errors. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_form";
    result[key] ??= issue.message;
  }
  return result;
}

import { describe, expect, it } from "vitest";
import { candidateInputSchema, normalizeSkills, stageChangeSchema, toFieldErrors } from "./schema";

const valid = {
  fullName: "  Jane Doe ",
  email: " Jane.Doe@Example.COM ",
  jobTitle: "Frontend Engineer",
  source: "LINKEDIN",
  appliedAt: "2026-01-15",
};

function errorsFor(input: Record<string, unknown>) {
  const result = candidateInputSchema.safeParse(input);
  return result.success ? {} : toFieldErrors(result.error);
}

describe("candidateInputSchema", () => {
  it("normalizes a minimal valid candidate", () => {
    const parsed = candidateInputSchema.parse(valid);
    expect(parsed).toMatchObject({
      fullName: "Jane Doe",
      email: "jane.doe@example.com",
      stage: "APPLIED",
      phone: null,
      yearsExperience: null,
      notes: null,
      resumeUrl: null,
      skills: [],
    });
    expect(parsed.appliedAt.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("reports every missing required field", () => {
    const errors = errorsFor({});
    expect(Object.keys(errors).sort()).toEqual(["appliedAt", "email", "fullName", "jobTitle", "source"]);
  });

  it.each(["plainaddress", "a@b", "@example.com", "jane@ example.com"])("rejects invalid email %s", (email) => {
    expect(errorsFor({ ...valid, email }).email).toBe("Enter a valid email address");
  });

  it("converts form strings and empty strings", () => {
    const parsed = candidateInputSchema.parse({
      ...valid,
      yearsExperience: "4",
      phone: "",
      notes: "   ",
      resumeUrl: "",
      skills: "React, typescript , react,, TypeScript",
    });
    expect(parsed.yearsExperience).toBe(4);
    expect(parsed.phone).toBeNull();
    expect(parsed.notes).toBeNull();
    expect(parsed.resumeUrl).toBeNull();
    expect(parsed.skills).toEqual(["React", "typescript"]);
  });

  it("validates optional fields when provided", () => {
    const errors = errorsFor({
      ...valid,
      phone: "call me",
      yearsExperience: "-1",
      resumeUrl: "javascript:alert(1)",
    });
    expect(errors.phone).toBeDefined();
    expect(errors.yearsExperience).toBeDefined();
    expect(errors.resumeUrl).toBe("Enter a valid http(s) URL");
  });

  it("rejects non-integer experience", () => {
    expect(errorsFor({ ...valid, yearsExperience: "2.5" }).yearsExperience).toBe("Use whole years");
  });

  it("rejects future and invalid application dates", () => {
    expect(errorsFor({ ...valid, appliedAt: "2999-01-01" }).appliedAt).toMatch(/future/);
    expect(errorsFor({ ...valid, appliedAt: "not-a-date" }).appliedAt).toBe("Enter a valid date");
  });

  it("rejects unknown stages and sources", () => {
    const errors = errorsFor({ ...valid, stage: "PROMOTED", source: "TWITTER" });
    expect(errors.stage).toBeDefined();
    expect(errors.source).toBeDefined();
  });
});

describe("normalizeSkills", () => {
  it("trims, collapses whitespace and de-duplicates case-insensitively", () => {
    expect(normalizeSkills(" Node.js ,  machine   learning, NODE.JS, ")).toEqual(["Node.js", "machine learning"]);
  });

  it("accepts arrays", () => {
    expect(normalizeSkills(["SQL", " sql ", "Go"])).toEqual(["SQL", "Go"]);
  });
});

describe("stageChangeSchema", () => {
  it("accepts known stages only", () => {
    expect(stageChangeSchema.safeParse({ stage: "OFFER" }).success).toBe(true);
    expect(stageChangeSchema.safeParse({ stage: "offer" }).success).toBe(false);
    expect(stageChangeSchema.safeParse({}).success).toBe(false);
  });
});

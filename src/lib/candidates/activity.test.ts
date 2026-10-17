import { describe, expect, it } from "vitest";
import { describeActivity } from "./activity";
import { diffCandidate } from "./diff";
import { candidateInputSchema } from "./schema";

const base = candidateInputSchema.parse({
  fullName: "Jane Doe",
  email: "jane@example.com",
  jobTitle: "QA Engineer",
  source: "REFERRAL",
  appliedAt: "2026-02-01",
  skills: "Cypress, Playwright",
});

describe("diffCandidate", () => {
  it("returns no changes for identical values (including dates and arrays)", () => {
    const copy = { ...base, appliedAt: new Date(base.appliedAt), skills: [...base.skills] };
    expect(diffCandidate(base, copy)).toEqual([]);
  });

  it("lists changed fields and ignores stage", () => {
    const changed = { ...base, phone: "+1 555 0100", skills: ["Cypress"], stage: "OFFER" as const };
    expect(diffCandidate(base, changed)).toEqual(["phone", "skills"]);
  });

  it("treats undefined and null as equal", () => {
    expect(diffCandidate({ ...base, notes: null }, { ...base, notes: undefined as unknown as null })).toEqual([]);
  });
});

describe("describeActivity", () => {
  const event = { fromStage: null, toStage: null, changedFields: [] as string[] };

  it("describes each event type", () => {
    expect(describeActivity({ ...event, type: "CREATED", toStage: "APPLIED" })).toBe("Added to Applied");
    expect(
      describeActivity({ ...event, type: "STAGE_CHANGED", fromStage: "SCREENING", toStage: "TECHNICAL_INTERVIEW" }),
    ).toBe("Moved from Screening to Technical Interview");
    expect(describeActivity({ ...event, type: "DELETED", fromStage: "OFFER" })).toBe("Deleted while in Offer");
  });

  it("joins changed field labels naturally", () => {
    expect(describeActivity({ ...event, type: "UPDATED", changedFields: ["phone"] })).toBe("Updated phone");
    expect(describeActivity({ ...event, type: "UPDATED", changedFields: ["phone", "jobTitle", "notes"] })).toBe(
      "Updated phone, job title and notes",
    );
  });
});

import { describe, expect, it } from "vitest";
import { nextStage } from "./constants";
import { computeMetrics } from "./metrics";

describe("computeMetrics", () => {
  it("returns zeros for an empty pipeline, with every stage present", () => {
    const metrics = computeMetrics({});
    expect(metrics.total).toBe(0);
    expect(metrics.byStage).toHaveLength(7);
    expect(metrics.byStage.every((row) => row.count === 0)).toBe(true);
  });

  it("derives totals consistently from stage counts", () => {
    const metrics = computeMetrics({
      APPLIED: 4,
      SCREENING: 3,
      TECHNICAL_INTERVIEW: 2,
      FINAL_INTERVIEW: 1,
      OFFER: 2,
      HIRED: 1,
      REJECTED: 5,
    });
    expect(metrics.total).toBe(18);
    // Active excludes the terminal stages.
    expect(metrics.active).toBe(12);
    expect(metrics.interviews).toBe(3);
    // Hired candidates also received an offer.
    expect(metrics.offers).toBe(3);
    expect(metrics.hired).toBe(1);
    expect(metrics.rejected).toBe(5);
    expect(metrics.active + metrics.hired + metrics.rejected).toBe(metrics.total);
  });

  it("keeps stages in pipeline order", () => {
    expect(computeMetrics({ REJECTED: 1, APPLIED: 2 }).byStage.map((row) => row.stage)).toEqual([
      "APPLIED",
      "SCREENING",
      "TECHNICAL_INTERVIEW",
      "FINAL_INTERVIEW",
      "OFFER",
      "HIRED",
      "REJECTED",
    ]);
  });
});

describe("nextStage", () => {
  it("advances along the happy path and stops at terminal stages", () => {
    expect(nextStage("APPLIED")).toBe("SCREENING");
    expect(nextStage("FINAL_INTERVIEW")).toBe("OFFER");
    expect(nextStage("OFFER")).toBe("HIRED");
    expect(nextStage("HIRED")).toBeNull();
    expect(nextStage("REJECTED")).toBeNull();
  });
});

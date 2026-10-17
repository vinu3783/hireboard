import { describe, expect, it } from "vitest";
import {
  buildCandidateOrderBy,
  buildCandidateWhere,
  hasActiveFilters,
  paginate,
  parseListParams,
  toSearchParams,
} from "./query";

describe("parseListParams", () => {
  it("returns defaults for an empty query", () => {
    expect(parseListParams({})).toEqual({
      q: "",
      stages: [],
      jobTitle: null,
      source: null,
      sort: "applied_desc",
      page: 1,
    });
  });

  it("parses comma-separated and repeated stages, dropping unknown values", () => {
    expect(parseListParams({ stage: "OFFER,HIRED,BOGUS" }).stages).toEqual(["OFFER", "HIRED"]);
    expect(parseListParams({ stage: ["SCREENING", "SCREENING,OFFER"] }).stages).toEqual(["SCREENING", "OFFER"]);
  });

  it("ignores invalid source, sort and page values", () => {
    const params = parseListParams({ source: "TWITTER", sort: "random", page: "-3" });
    expect(params.source).toBeNull();
    expect(params.sort).toBe("applied_desc");
    expect(params.page).toBe(1);
  });

  it("trims the search term and job title", () => {
    const params = parseListParams({ q: "  ravi ", job: " DevOps Engineer " });
    expect(params.q).toBe("ravi");
    expect(params.jobTitle).toBe("DevOps Engineer");
  });

  it("round-trips through toSearchParams", () => {
    const params = parseListParams({ q: "a", stage: "OFFER,HIRED", job: "QA", source: "REFERRAL", sort: "name_asc", page: "2" });
    expect(parseListParams(Object.fromEntries(toSearchParams(params)))).toEqual(params);
  });

  it("omits defaults when serializing", () => {
    expect(toSearchParams(parseListParams({})).toString()).toBe("");
  });
});

describe("buildCandidateWhere", () => {
  it("returns an empty filter when nothing is selected", () => {
    expect(buildCandidateWhere(parseListParams({}))).toEqual({});
  });

  it("combines search, stage, job title and source with AND", () => {
    const where = buildCandidateWhere(
      parseListParams({ q: "mehta", stage: "APPLIED,SCREENING", job: "Frontend Engineer", source: "LINKEDIN" }),
    );
    expect(where).toEqual({
      AND: [
        {
          OR: [
            { fullName: { contains: "mehta", mode: "insensitive" } },
            { email: { contains: "mehta", mode: "insensitive" } },
          ],
        },
        { stage: { in: ["APPLIED", "SCREENING"] } },
        { jobTitle: "Frontend Engineer" },
        { source: "LINKEDIN" },
      ],
    });
  });

  it("detects active filters (sorting alone is not a filter)", () => {
    expect(hasActiveFilters(parseListParams({ sort: "name_asc" }))).toBe(false);
    expect(hasActiveFilters(parseListParams({ source: "AGENCY" }))).toBe(true);
  });
});

describe("buildCandidateOrderBy", () => {
  it("uses a stable tie-breaker for every sort", () => {
    for (const sort of ["applied_desc", "applied_asc", "name_asc", "name_desc"] as const) {
      expect(buildCandidateOrderBy(sort).at(-1)).toEqual({ id: "asc" });
    }
  });

  it("sorts by name in the requested direction", () => {
    expect(buildCandidateOrderBy("name_desc")[0]).toEqual({ fullName: "desc" });
    expect(buildCandidateOrderBy("applied_asc")[0]).toEqual({ appliedAt: "asc" });
  });
});

describe("paginate", () => {
  it("computes skip and total pages", () => {
    expect(paginate(2, 10, 25)).toEqual({ page: 2, totalPages: 3, skip: 10 });
  });

  it("clamps out-of-range pages", () => {
    expect(paginate(99, 10, 25)).toEqual({ page: 3, totalPages: 3, skip: 20 });
    expect(paginate(5, 10, 0)).toEqual({ page: 1, totalPages: 1, skip: 0 });
  });
});

import type { Prisma } from "@prisma/client";
import { isSource, isStage, SORT_OPTIONS, type SortOption, type Source, type Stage } from "./constants";

// Parses list filters from URL search params. Invalid values are dropped
// rather than rejected so a hand-edited URL still renders a sensible list.

export interface ListParams {
  q: string;
  stages: Stage[];
  jobTitle: string | null;
  source: Source | null;
  sort: SortOption;
  page: number;
}

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListParams(raw: RawParams): ListParams {
  const q = (first(raw.q) ?? "").trim().slice(0, 100);

  const stageValues = (Array.isArray(raw.stage) ? raw.stage : [raw.stage ?? ""])
    .flatMap((value) => value.split(","))
    .filter(isStage);
  const stages = [...new Set(stageValues)];

  const jobTitle = first(raw.job)?.trim() || null;
  const sourceValue = first(raw.source);
  const source = isSource(sourceValue) ? sourceValue : null;

  const sortValue = first(raw.sort);
  const sort = (SORT_OPTIONS as readonly string[]).includes(sortValue ?? "")
    ? (sortValue as SortOption)
    : "applied_desc";

  const pageNumber = Number.parseInt(first(raw.page) ?? "1", 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;

  return { q, stages, jobTitle, source, sort, page };
}

/** Serializes params back to a query string, omitting defaults. */
export function toSearchParams(params: Partial<ListParams>): URLSearchParams {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.stages?.length) search.set("stage", params.stages.join(","));
  if (params.jobTitle) search.set("job", params.jobTitle);
  if (params.source) search.set("source", params.source);
  if (params.sort && params.sort !== "applied_desc") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  return search;
}

export function hasActiveFilters(params: ListParams): boolean {
  return Boolean(params.q || params.stages.length || params.jobTitle || params.source);
}

export function buildCandidateWhere(params: ListParams): Prisma.CandidateWhereInput {
  const and: Prisma.CandidateWhereInput[] = [];
  if (params.q) {
    and.push({
      OR: [
        { fullName: { contains: params.q, mode: "insensitive" } },
        { email: { contains: params.q, mode: "insensitive" } },
      ],
    });
  }
  if (params.stages.length) and.push({ stage: { in: params.stages } });
  if (params.jobTitle) and.push({ jobTitle: params.jobTitle });
  if (params.source) and.push({ source: params.source });
  return and.length ? { AND: and } : {};
}

export function buildCandidateOrderBy(sort: SortOption): Prisma.CandidateOrderByWithRelationInput[] {
  switch (sort) {
    case "applied_asc":
      return [{ appliedAt: "asc" }, { fullName: "asc" }, { id: "asc" }];
    case "name_asc":
      return [{ fullName: "asc" }, { id: "asc" }];
    case "name_desc":
      return [{ fullName: "desc" }, { id: "asc" }];
    case "applied_desc":
    default:
      return [{ appliedAt: "desc" }, { fullName: "asc" }, { id: "asc" }];
  }
}

/** Clamps the requested page into range, returning the skip offset. */
export function paginate(page: number, pageSize: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return { page: current, totalPages, skip: (current - 1) * pageSize };
}

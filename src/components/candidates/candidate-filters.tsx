"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/field";
import { STAGE_DOT } from "@/components/ui/stage-badge";
import {
  SORT_LABELS,
  SORT_OPTIONS,
  SOURCE_LABELS,
  SOURCES,
  STAGE_LABELS,
  STAGES,
  type SortOption,
  type Source,
  type Stage,
} from "@/lib/candidates/constants";
import { hasActiveFilters, toSearchParams, type ListParams } from "@/lib/candidates/query";

// The URL is the single source of truth for filters: every control writes to
// the query string and the server component re-renders the list. This keeps
// filtered views shareable and lets the dashboard link straight into them.

export function CandidateFilters({ params, jobTitles }: { params: ListParams; jobTitles: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  // Local copy of the filters so controls respond instantly and quick
  // successive changes build on each other instead of on stale server props.
  const [current, setCurrent] = useState(params);
  const [query, setQuery] = useState(params.q);
  const lastSentQuery = useRef(params.q);

  // Adopt the server's view once a navigation completes. The search box is only
  // overwritten when the URL changed from elsewhere (e.g. a "Clear filters"
  // link), never while the user is still typing.
  useEffect(() => {
    setCurrent(params);
    if (params.q !== lastSentQuery.current) {
      lastSentQuery.current = params.q;
      setQuery(params.q);
    }
  }, [params]);

  function navigate(next: Partial<ListParams>) {
    // Any filter change resets to page 1.
    const updated = { ...current, page: 1, ...next };
    lastSentQuery.current = updated.q;
    setCurrent(updated);
    const search = toSearchParams(updated);
    const href = search.size ? `${pathname}?${search}` : pathname;
    startTransition(() => router.replace(href, { scroll: false }));
  }

  // Debounce typing so we don't hit the server on every keystroke.
  useEffect(() => {
    if (query.trim() === current.q) return;
    const timeout = setTimeout(() => navigate({ q: query.trim() }), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate is recreated each render; only the query matters
  }, [query]);

  function toggleStage(stage: Stage) {
    const stages = current.stages.includes(stage)
      ? current.stages.filter((s) => s !== stage)
      : [...current.stages, stage];
    navigate({ stages: STAGES.filter((s) => stages.includes(s)) });
  }

  const filtered = hasActiveFilters(current);

  return (
    <section aria-label="Filter candidates" className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_170px_190px]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="search" className="sr-only">
            Search by name or email
          </label>
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3 3" strokeLinecap="round" />
          </svg>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email"
            className={`${controlClasses()} h-9 pl-9`}
          />
          {pending && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-subtle">
              <Spinner />
              <span className="sr-only">Updating results</span>
            </span>
          )}
        </div>

        <FilterSelect
          id="job"
          label="Job title"
          value={current.jobTitle ?? ""}
          onChange={(value) => navigate({ jobTitle: value || null })}
        >
          <option value="">All job titles</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
          {current.jobTitle && !jobTitles.includes(current.jobTitle) && (
            <option value={current.jobTitle}>{current.jobTitle}</option>
          )}
        </FilterSelect>

        <FilterSelect
          id="source"
          label="Source"
          value={current.source ?? ""}
          onChange={(value) => navigate({ source: (value || null) as Source | null })}
        >
          <option value="">All sources</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {SOURCE_LABELS[source]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id="sort"
          label="Sort by"
          value={current.sort}
          onChange={(value) => navigate({ sort: value as SortOption })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by stage">
        <span className="mr-1 text-[13px] text-ink-subtle">Stage:</span>
        {STAGES.map((stage) => {
          const active = current.stages.includes(stage);
          return (
            <button
              key={stage}
              type="button"
              aria-pressed={active}
              onClick={() => toggleStage(stage)}
              className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-accent-ink"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              <span className={`size-1.5 rounded-full ${STAGE_DOT[stage]}`} aria-hidden="true" />
              {STAGE_LABELS[stage]}
            </button>
          );
        })}
        {filtered && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              navigate({ q: "", stages: [], jobTitle: null, source: null });
            }}
            className="ml-1 rounded px-1.5 text-[13px] font-medium text-accent hover:text-accent-hover hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${controlClasses()} h-9`}>
        {children}
      </select>
    </div>
  );
}

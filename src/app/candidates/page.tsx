import type { Metadata } from "next";
import { CandidateFilters } from "@/components/candidates/candidate-filters";
import { CandidateTable } from "@/components/candidates/candidate-table";
import { Pagination } from "@/components/candidates/pagination";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { hasActiveFilters, parseListParams } from "@/lib/candidates/query";
import { listCandidates, listJobTitles } from "@/lib/candidates/service";
import { pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Candidates" };

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = parseListParams(await searchParams);
  const [list, jobTitles] = await Promise.all([listCandidates(params), listJobTitles()]);
  const filtered = hasActiveFilters(params);
  const noCandidatesAtAll = list.total === 0 && !filtered;

  return (
    <>
      <PageHeader
        title="Candidates"
        description={noCandidatesAtAll ? undefined : `${pluralize(list.total, filtered ? "match" : "candidate", filtered ? "matches" : "candidates")}`}
        actions={<ButtonLink href="/candidates/new">Add candidate</ButtonLink>}
      />

      {noCandidatesAtAll ? (
        <div className="rounded-xl border border-line bg-surface shadow-xs">
          <EmptyState
            title="No candidates yet"
            description="Add your first candidate to start tracking them through the hiring pipeline. Developers can also run npm run db:seed to load sample data."
            action={<ButtonLink href="/candidates/new">Add candidate</ButtonLink>}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <CandidateFilters params={params} jobTitles={jobTitles} />
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
            {list.items.length ? (
              <>
                <CandidateTable candidates={list.items} />
                <Pagination
                  params={params}
                  page={list.page}
                  totalPages={list.totalPages}
                  total={list.total}
                  pageSize={list.pageSize}
                />
              </>
            ) : (
              <EmptyState
                title="No candidates match these filters"
                description="Try a different search term, or clear some filters to widen the results."
                action={
                  <ButtonLink href="/candidates" variant="secondary">
                    Clear filters
                  </ButtonLink>
                }
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

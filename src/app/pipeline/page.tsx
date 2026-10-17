import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listPipelineCandidates } from "@/lib/candidates/service";

export const metadata: Metadata = { title: "Pipeline" };
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const candidates = await listPipelineCandidates();

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Move candidates with the stage menu on each card, or drag cards between columns."
        actions={<ButtonLink href="/candidates/new">Add candidate</ButtonLink>}
      />
      {candidates.length ? (
        <PipelineBoard candidates={candidates} />
      ) : (
        <div className="rounded-xl border border-line bg-surface shadow-xs">
          <EmptyState
            title="Your pipeline is empty"
            description="Candidates you add will appear here, grouped by hiring stage."
            action={<ButtonLink href="/candidates/new">Add candidate</ButtonLink>}
          />
        </div>
      )}
    </>
  );
}

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CandidateNotFound() {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-xs">
      <EmptyState
        title="Candidate not found"
        description="This candidate may have been deleted, or the link is incorrect."
        action={<ButtonLink href="/candidates">Back to candidates</ButtonLink>}
      />
    </div>
  );
}

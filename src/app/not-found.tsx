import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-xs">
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={<ButtonLink href="/">Go to dashboard</ButtonLink>}
      />
    </div>
  );
}

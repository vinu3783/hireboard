import Link from "next/link";
import { LocalTime } from "@/components/ui/local-time";
import { STAGE_DOT } from "@/components/ui/stage-badge";
import { describeActivity } from "@/lib/candidates/activity";
import type { ActivityWithCandidate } from "@/lib/candidates/service";

export function RecentActivity({ activities }: { activities: ActivityWithCandidate[] }) {
  if (!activities.length) {
    return <p className="py-6 text-center text-sm text-ink-muted">Activity will appear here as you work with candidates.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-3 py-2.5">
          <span
            className={`mt-1.5 size-2 shrink-0 rounded-full ${activity.toStage ? STAGE_DOT[activity.toStage] : "bg-line-strong"}`}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink">
              {activity.candidate ? (
                <Link href={`/candidates/${activity.candidate.id}`} className="font-medium hover:text-accent">
                  {activity.candidate.fullName}
                </Link>
              ) : (
                <span className="font-medium text-ink-muted">{activity.candidateName}</span>
              )}{" "}
              <span className="text-ink-muted">· {describeActivity(activity)}</span>
            </p>
          </div>
          <span className="shrink-0 text-xs text-ink-subtle">
            <LocalTime date={activity.createdAt} mode="relative" />
          </span>
        </li>
      ))}
    </ul>
  );
}

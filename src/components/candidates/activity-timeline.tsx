import type { Activity } from "@prisma/client";
import { LocalTime } from "@/components/ui/local-time";
import { STAGE_DOT } from "@/components/ui/stage-badge";
import { describeActivity } from "@/lib/candidates/activity";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length) {
    return <p className="text-sm text-ink-muted">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-line">
      {activities.map((activity) => {
        const dot = activity.toStage ? STAGE_DOT[activity.toStage] : "bg-line-strong";
        return (
          <li key={activity.id} className="relative pl-6">
            <span
              className={`absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-surface ${dot}`}
              aria-hidden="true"
            />
            <p className="text-sm text-ink">{describeActivity(activity)}</p>
            <p className="text-xs text-ink-subtle">
              <LocalTime date={activity.createdAt} />
            </p>
          </li>
        );
      })}
    </ol>
  );
}

import { STAGE_LABELS, type Stage } from "./constants";
import { FIELD_LABELS, type TrackedField } from "./diff";

export interface ActivityLike {
  type: "CREATED" | "UPDATED" | "STAGE_CHANGED" | "DELETED";
  fromStage: Stage | null;
  toStage: Stage | null;
  changedFields: string[];
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Human-readable summary of an activity event, without the candidate's name. */
export function describeActivity(activity: ActivityLike): string {
  switch (activity.type) {
    case "CREATED":
      return activity.toStage ? `Added to ${STAGE_LABELS[activity.toStage]}` : "Added";
    case "STAGE_CHANGED":
      if (activity.fromStage && activity.toStage) {
        return `Moved from ${STAGE_LABELS[activity.fromStage]} to ${STAGE_LABELS[activity.toStage]}`;
      }
      return activity.toStage ? `Moved to ${STAGE_LABELS[activity.toStage]}` : "Stage changed";
    case "UPDATED": {
      const labels = activity.changedFields.map((field) => FIELD_LABELS[field as TrackedField] ?? field);
      return labels.length ? `Updated ${joinList(labels)}` : "Profile updated";
    }
    case "DELETED":
      return activity.fromStage ? `Deleted while in ${STAGE_LABELS[activity.fromStage]}` : "Deleted";
  }
}

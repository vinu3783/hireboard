import { STAGE_LABELS, type Stage } from "@/lib/candidates/constants";

/** Dot colour per stage. The label always accompanies it, so colour is never the only cue. */
export const STAGE_DOT: Record<Stage, string> = {
  APPLIED: "bg-stone-400",
  SCREENING: "bg-sky-500",
  TECHNICAL_INTERVIEW: "bg-violet-500",
  FINAL_INTERVIEW: "bg-indigo-500",
  OFFER: "bg-amber-500",
  HIRED: "bg-emerald-600",
  REJECTED: "bg-rose-500",
};

const BADGE_TONE: Partial<Record<Stage, string>> = {
  HIRED: "bg-success-soft text-success border-emerald-200",
  REJECTED: "bg-danger-soft text-danger border-rose-200",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
        BADGE_TONE[stage] ?? "border-line bg-subtle text-ink-muted"
      }`}
    >
      <span className={`size-1.5 rounded-full ${STAGE_DOT[stage]}`} aria-hidden="true" />
      {STAGE_LABELS[stage]}
    </span>
  );
}

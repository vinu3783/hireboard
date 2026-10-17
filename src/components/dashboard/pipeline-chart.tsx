import Link from "next/link";
import { ACTIVE_STAGES, STAGE_LABELS } from "@/lib/candidates/constants";
import type { StageCount } from "@/lib/candidates/metrics";
import { pluralize } from "@/lib/format";

// A single-series horizontal bar chart: one hue, magnitude encoded by length,
// exact counts as text. Each row links to the filtered candidate list, which
// doubles as the "table view" of the chart.

export function PipelineChart({ byStage, total }: { byStage: StageCount[]; total: number }) {
  const max = Math.max(1, ...byStage.map((row) => row.count));
  const active = byStage.filter((row) => ACTIVE_STAGES.includes(row.stage));
  const outcomes = byStage.filter((row) => !ACTIVE_STAGES.includes(row.stage));

  return (
    <div>
      <ul className="space-y-0.5">
        {active.map((row) => (
          <Row key={row.stage} row={row} max={max} total={total} />
        ))}
      </ul>
      <p className="mt-3 mb-1 border-t border-line pt-3 text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">
        Outcomes
      </p>
      <ul className="space-y-0.5">
        {outcomes.map((row) => (
          <Row key={row.stage} row={row} max={max} total={total} />
        ))}
      </ul>
    </div>
  );
}

function Row({ row, max, total }: { row: StageCount; max: number; total: number }) {
  const share = total ? Math.round((row.count / total) * 100) : 0;
  const width = (row.count / max) * 100;
  return (
    <li>
      <Link
        href={`/candidates?stage=${row.stage}`}
        title={`${STAGE_LABELS[row.stage]}: ${pluralize(row.count, "candidate")} (${share}%)`}
        className="grid grid-cols-[8.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md px-2 py-1.5 hover:bg-subtle"
      >
        <span className="truncate text-[13px] text-ink-muted">{STAGE_LABELS[row.stage]}</span>
        <span className="h-2.5 rounded-r-full bg-subtle" aria-hidden="true">
          {row.count > 0 && (
            <span className="block h-full min-w-1 rounded-r-full bg-accent" style={{ width: `${width}%` }} />
          )}
        </span>
        <span className="text-right text-[13px] font-medium text-ink tabular-nums">
          {row.count}
          <span className="sr-only"> candidates, {share}% of total</span>
        </span>
      </Link>
    </li>
  );
}

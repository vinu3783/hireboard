"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type DragEvent } from "react";
import { STAGE_DOT } from "@/components/ui/stage-badge";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiRequest } from "@/lib/api-client";
import { STAGE_LABELS, STAGES, type Stage } from "@/lib/candidates/constants";
import { formatDate } from "@/lib/format";

export interface PipelineCandidate {
  id: string;
  fullName: string;
  jobTitle: string;
  stage: Stage;
  appliedAt: Date;
}

const DRAG_TYPE = "application/x-hireboard-candidate";

/**
 * Kanban-style board. Each card has a stage <select> (works with keyboard,
 * screen readers and touch); mouse users can also drag cards between columns.
 * Moves are applied optimistically and rolled back if the API call fails.
 */
export function PipelineBoard({ candidates: initial }: { candidates: PipelineCandidate[] }) {
  const router = useRouter();
  const toast = useToast();
  const [candidates, setCandidates] = useState(initial);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [dropTarget, setDropTarget] = useState<Stage | null>(null);

  // Adopt fresh server data after router.refresh().
  useEffect(() => setCandidates(initial), [initial]);

  async function move(id: string, to: Stage) {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate || candidate.stage === to) return;
    const from = candidate.stage;

    setCandidates((all) => all.map((c) => (c.id === id ? { ...c, stage: to } : c)));
    setSavingIds((ids) => new Set(ids).add(id));
    try {
      await apiRequest(`/api/candidates/${id}/stage`, { method: "PATCH", body: { stage: to } });
      toast(`${candidate.fullName} moved to ${STAGE_LABELS[to]}`);
      router.refresh();
    } catch (error) {
      setCandidates((all) => all.map((c) => (c.id === id ? { ...c, stage: from } : c)));
      toast(error instanceof ApiError ? error.message : "Could not move candidate", "error");
    } finally {
      setSavingIds((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
    }
  }

  function handleDrop(event: DragEvent, stage: Stage) {
    event.preventDefault();
    setDropTarget(null);
    const id = event.dataTransfer.getData(DRAG_TYPE);
    if (id) move(id, stage);
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      <div className="flex gap-3" style={{ minWidth: `${STAGES.length * 236}px` }}>
        {STAGES.map((stage) => {
          const items = candidates.filter((c) => c.stage === stage);
          const terminal = stage === "HIRED" || stage === "REJECTED";
          return (
            <section
              key={stage}
              aria-labelledby={`col-${stage}`}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes(DRAG_TYPE)) {
                  event.preventDefault();
                  setDropTarget(stage);
                }
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropTarget(null);
              }}
              onDrop={(event) => handleDrop(event, stage)}
              className={`flex w-56 shrink-0 flex-col rounded-xl border transition-colors ${
                dropTarget === stage ? "border-accent bg-accent-soft/60" : terminal ? "border-line bg-subtle/40" : "border-line bg-subtle"
              }`}
            >
              <header className="flex items-center justify-between px-3 pt-3 pb-2">
                <h2 id={`col-${stage}`} className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <span className={`size-2 rounded-full ${STAGE_DOT[stage]}`} aria-hidden="true" />
                  {STAGE_LABELS[stage]}
                </h2>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-muted tabular-nums ring-1 ring-line">
                  {items.length}
                  <span className="sr-only"> candidates</span>
                </span>
              </header>

              <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed border-line-strong px-3 py-4 text-center text-xs text-ink-subtle">
                    No candidates
                  </li>
                )}
                {items.map((candidate) => (
                  <li
                    key={candidate.id}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(DRAG_TYPE, candidate.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    className={`rounded-lg border border-line bg-surface p-3 shadow-xs transition-opacity ${
                      savingIds.has(candidate.id) ? "opacity-60" : ""
                    } cursor-grab active:cursor-grabbing`}
                  >
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="block text-sm font-medium text-ink hover:text-accent"
                      draggable={false}
                    >
                      {candidate.fullName}
                    </Link>
                    <p className="truncate text-xs text-ink-muted">{candidate.jobTitle}</p>
                    <p className="mt-0.5 text-[11px] text-ink-subtle">Applied {formatDate(candidate.appliedAt)}</p>
                    <label htmlFor={`move-${candidate.id}`} className="sr-only">
                      Move {candidate.fullName} to stage
                    </label>
                    <select
                      id={`move-${candidate.id}`}
                      value={candidate.stage}
                      disabled={savingIds.has(candidate.id)}
                      onChange={(event) => move(candidate.id, event.target.value as Stage)}
                      className="mt-2 h-7 w-full rounded-md border border-line bg-subtle/60 px-1.5 text-xs text-ink-muted hover:border-line-strong"
                    >
                      {STAGES.map((option) => (
                        <option key={option} value={option}>
                          {option === candidate.stage ? `Stage: ${STAGE_LABELS[option]}` : `Move to ${STAGE_LABELS[option]}`}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

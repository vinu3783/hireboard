"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiRequest } from "@/lib/api-client";
import { nextStage, STAGE_LABELS, STAGES, type Stage } from "@/lib/candidates/constants";

/** Stage selector + one-click "advance" and "reject" shortcuts for the profile page. */
export function StageControl({ candidateId, stage }: { candidateId: string; stage: Stage }) {
  const router = useRouter();
  const toast = useToast();
  const [pendingStage, setPendingStage] = useState<Stage | null>(null);
  const advanceTo = nextStage(stage);

  // Keep showing the requested stage until the refreshed server value arrives.
  useEffect(() => setPendingStage(null), [stage]);

  async function move(to: Stage) {
    if (to === stage) return;
    setPendingStage(to);
    try {
      await apiRequest(`/api/candidates/${candidateId}/stage`, { method: "PATCH", body: { stage: to } });
      toast(`Moved to ${STAGE_LABELS[to]}`);
      router.refresh();
    } catch (error) {
      setPendingStage(null);
      toast(error instanceof ApiError ? error.message : "Could not change stage", "error");
    }
  }

  const busy = pendingStage !== null;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="stage-select" className="mb-1.5 block text-[13px] font-medium text-ink">
          Current stage
        </label>
        <select
          id="stage-select"
          value={pendingStage ?? stage}
          disabled={busy}
          onChange={(event) => move(event.target.value as Stage)}
          className={`${controlClasses()} h-9 disabled:opacity-60`}
        >
          {STAGES.map((option) => (
            <option key={option} value={option}>
              {STAGE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
      {(advanceTo || stage !== "REJECTED") && (
        <div className="flex flex-wrap gap-2">
          {advanceTo && (
            <Button size="sm" onClick={() => move(advanceTo)} loading={pendingStage === advanceTo} disabled={busy}>
              Move to {STAGE_LABELS[advanceTo]}
            </Button>
          )}
          {stage !== "REJECTED" && stage !== "HIRED" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => move("REJECTED")}
              loading={pendingStage === "REJECTED"}
              disabled={busy}
            >
              Reject
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

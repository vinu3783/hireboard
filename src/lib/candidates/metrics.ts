import { ACTIVE_STAGES, INTERVIEW_STAGES, OFFER_STAGES, STAGES, type Stage } from "./constants";

export interface StageCount {
  stage: Stage;
  count: number;
}

export interface PipelineMetrics {
  total: number;
  active: number;
  interviews: number;
  offers: number;
  hired: number;
  rejected: number;
  /** Every stage in pipeline order, including zero counts. */
  byStage: StageCount[];
}

/** Derives dashboard numbers from per-stage counts (e.g. a Prisma groupBy). */
export function computeMetrics(counts: Partial<Record<Stage, number>>): PipelineMetrics {
  const byStage = STAGES.map((stage) => ({ stage, count: counts[stage] ?? 0 }));
  const sum = (stages: readonly Stage[]) =>
    stages.reduce((total, stage) => total + (counts[stage] ?? 0), 0);

  return {
    total: sum(STAGES),
    active: sum(ACTIVE_STAGES),
    interviews: sum(INTERVIEW_STAGES),
    offers: sum(OFFER_STAGES),
    hired: counts.HIRED ?? 0,
    rejected: counts.REJECTED ?? 0,
    byStage,
  };
}

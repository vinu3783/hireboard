import "server-only";
import type { Activity, Candidate } from "@prisma/client";
import { db } from "@/lib/db";
import { duplicateEmail, notFound, toAppError } from "@/lib/errors";
import { PAGE_SIZE, type Stage } from "./constants";
import { diffCandidate } from "./diff";
import { computeMetrics, type PipelineMetrics } from "./metrics";
import { buildCandidateOrderBy, buildCandidateWhere, paginate, type ListParams } from "./query";
import type { CandidateInput } from "./schema";

// All database access for candidates goes through this module. Mutations that
// touch more than one row run in a transaction so the activity log can never
// disagree with the candidate record.

export type ActivityWithCandidate = Activity & { candidate: Pick<Candidate, "id" | "fullName"> | null };

export interface CandidateList {
  items: Candidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listCandidates(params: ListParams): Promise<CandidateList> {
  const where = buildCandidateWhere(params);
  const total = await db.candidate.count({ where });
  const { page, totalPages, skip } = paginate(params.page, PAGE_SIZE, total);
  const items = await db.candidate.findMany({
    where,
    orderBy: buildCandidateOrderBy(params.sort),
    skip,
    take: PAGE_SIZE,
  });
  return { items, total, page, pageSize: PAGE_SIZE, totalPages };
}

/** Lightweight list for the pipeline board (every candidate, minimal fields). */
export function listPipelineCandidates() {
  return db.candidate.findMany({
    select: { id: true, fullName: true, jobTitle: true, stage: true, appliedAt: true, updatedAt: true },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listJobTitles(): Promise<string[]> {
  const rows = await db.candidate.findMany({
    distinct: ["jobTitle"],
    select: { jobTitle: true },
    orderBy: { jobTitle: "asc" },
  });
  return rows.map((row) => row.jobTitle);
}

export function getCandidate(id: string) {
  return db.candidate.findUnique({ where: { id } });
}

export function getCandidateActivity(candidateId: string) {
  return db.activity.findMany({
    where: { candidateId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function createCandidate(input: CandidateInput): Promise<Candidate> {
  try {
    return await db.candidate.create({
      data: {
        ...input,
        activities: {
          create: { type: "CREATED", candidateName: input.fullName, toStage: input.stage },
        },
      },
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function updateCandidate(id: string, input: CandidateInput): Promise<Candidate> {
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.candidate.findUnique({ where: { id } });
      if (!existing) throw notFound();

      const changedFields = diffCandidate(existing, input);
      const stageChanged = existing.stage !== input.stage;
      if (!changedFields.length && !stageChanged) return existing;

      if (changedFields.includes("email")) {
        const clash = await tx.candidate.findUnique({ where: { email: input.email }, select: { id: true } });
        if (clash && clash.id !== id) throw duplicateEmail();
      }

      const updated = await tx.candidate.update({ where: { id }, data: input });

      if (changedFields.length) {
        await tx.activity.create({
          data: { type: "UPDATED", candidateId: id, candidateName: updated.fullName, changedFields },
        });
      }
      if (stageChanged) {
        await tx.activity.create({
          data: {
            type: "STAGE_CHANGED",
            candidateId: id,
            candidateName: updated.fullName,
            fromStage: existing.stage,
            toStage: updated.stage,
          },
        });
      }
      return updated;
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function changeCandidateStage(id: string, stage: Stage): Promise<Candidate> {
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.candidate.findUnique({ where: { id } });
      if (!existing) throw notFound();
      if (existing.stage === stage) return existing;

      const updated = await tx.candidate.update({ where: { id }, data: { stage } });
      await tx.activity.create({
        data: {
          type: "STAGE_CHANGED",
          candidateId: id,
          candidateName: updated.fullName,
          fromStage: existing.stage,
          toStage: stage,
        },
      });
      return updated;
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export async function deleteCandidate(id: string): Promise<void> {
  try {
    await db.$transaction(async (tx) => {
      const existing = await tx.candidate.findUnique({ where: { id }, select: { fullName: true, stage: true } });
      if (!existing) throw notFound();
      // Earlier events keep their name snapshot; candidateId becomes NULL via onDelete: SetNull.
      await tx.candidate.delete({ where: { id } });
      await tx.activity.create({
        data: { type: "DELETED", candidateName: existing.fullName, fromStage: existing.stage },
      });
    });
  } catch (error) {
    throw toAppError(error);
  }
}

export interface DashboardData {
  metrics: PipelineMetrics;
  recentActivity: ActivityWithCandidate[];
  topRoles: { jobTitle: string; count: number }[];
  appliedLast7Days: number;
}

export async function getDashboardData(): Promise<DashboardData> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [stageGroups, recentActivity, roleGroups, appliedLast7Days] = await Promise.all([
    db.candidate.groupBy({ by: ["stage"], _count: { _all: true } }),
    db.activity.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 8,
      include: { candidate: { select: { id: true, fullName: true } } },
    }),
    db.candidate.groupBy({
      by: ["jobTitle"],
      _count: { _all: true },
      orderBy: { _count: { jobTitle: "desc" } },
      take: 5,
    }),
    db.candidate.count({ where: { appliedAt: { gte: weekAgo } } }),
  ]);

  const counts = Object.fromEntries(stageGroups.map((group) => [group.stage, group._count._all]));
  return {
    metrics: computeMetrics(counts),
    recentActivity,
    topRoles: roleGroups.map((group) => ({ jobTitle: group.jobTitle, count: group._count._all })),
    appliedLast7Days,
  };
}

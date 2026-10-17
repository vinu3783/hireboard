import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ActivityTimeline } from "@/components/candidates/activity-timeline";
import { Avatar } from "@/components/candidates/candidate-table";
import { DeleteCandidateButton } from "@/components/candidates/delete-candidate-button";
import { StageControl } from "@/components/candidates/stage-control";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { StageBadge } from "@/components/ui/stage-badge";
import { SOURCE_LABELS } from "@/lib/candidates/constants";
import { getCandidate, getCandidateActivity } from "@/lib/candidates/service";
import { formatDate, pluralize } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const candidate = await getCandidate((await params).id);
  return { title: candidate?.fullName ?? "Candidate not found" };
}

export default async function CandidatePage({ params }: Props) {
  const { id } = await params;
  const [candidate, activities] = await Promise.all([getCandidate(id), getCandidateActivity(id)]);
  if (!candidate) notFound();

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-ink-subtle">
        <Link href="/candidates" className="hover:text-ink">
          Candidates
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink-muted">{candidate.fullName}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={candidate.fullName} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{candidate.fullName}</h1>
              <StageBadge stage={candidate.stage} />
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">
              {candidate.jobTitle} · Applied {formatDate(candidate.appliedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/candidates/${candidate.id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
          <DeleteCandidateButton candidateId={candidate.id} name={candidate.fullName} />
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Panel title="Profile">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Email">
                <a href={`mailto:${candidate.email}`} className="text-accent hover:underline">
                  {candidate.email}
                </a>
              </Detail>
              <Detail label="Phone">
                {candidate.phone ? (
                  <a href={`tel:${candidate.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                    {candidate.phone}
                  </a>
                ) : (
                  <Muted>Not provided</Muted>
                )}
              </Detail>
              <Detail label="Job applied for">{candidate.jobTitle}</Detail>
              <Detail label="Experience">
                {candidate.yearsExperience === null ? (
                  <Muted>Not provided</Muted>
                ) : candidate.yearsExperience === 0 ? (
                  "Less than a year"
                ) : (
                  pluralize(candidate.yearsExperience, "year")
                )}
              </Detail>
              <Detail label="Source">{SOURCE_LABELS[candidate.source]}</Detail>
              <Detail label="Application date">{formatDate(candidate.appliedAt)}</Detail>
              <Detail label="Resume">
                {candidate.resumeUrl ? (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-accent hover:underline"
                  >
                    Open resume ↗
                  </a>
                ) : (
                  <Muted>Not provided</Muted>
                )}
              </Detail>
              <Detail label="Skills" className="sm:col-span-2">
                {candidate.skills.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <li key={skill} className="rounded-md border border-line bg-subtle px-2 py-0.5 text-[13px] text-ink-muted">
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Muted>No skills listed</Muted>
                )}
              </Detail>
            </dl>
          </Panel>

          <Panel title="Recruiter notes">
            {candidate.notes ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{candidate.notes}</p>
            ) : (
              <p className="text-sm text-ink-muted">
                No notes yet.{" "}
                <Link href={`/candidates/${candidate.id}/edit#notes`} className="font-medium text-accent hover:underline">
                  Add a note
                </Link>
              </p>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Hiring stage">
            <StageControl candidateId={candidate.id} stage={candidate.stage} />
          </Panel>
          <Panel title="Activity">
            <ActivityTimeline activities={activities} />
          </Panel>
        </div>
      </div>
    </>
  );
}

function Detail({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-ink-subtle">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-ink-subtle">{children}</span>;
}

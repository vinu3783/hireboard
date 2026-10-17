import type { Candidate } from "@prisma/client";
import Link from "next/link";
import { StageBadge } from "@/components/ui/stage-badge";
import { SOURCE_LABELS } from "@/lib/candidates/constants";
import { formatDate, initials } from "@/lib/format";

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent-ink ${
        size === "lg" ? "size-12 text-base" : "size-8 text-xs"
      }`}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Table on wide screens, stacked rows on phones. Each row links to the profile. */
export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  return (
    <>
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-line text-left text-xs font-medium text-ink-subtle">
            <th scope="col" className="py-2.5 pr-3 pl-4 font-medium">Candidate</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Job title</th>
            <th scope="col" className="px-3 py-2.5 font-medium">Stage</th>
            <th scope="col" className="hidden px-3 py-2.5 font-medium lg:table-cell">Source</th>
            <th scope="col" className="py-2.5 pr-4 pl-3 text-right font-medium">Applied</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="group relative hover:bg-subtle/60">
              <td className="py-2.5 pr-3 pl-4">
                <div className="flex items-center gap-3">
                  <Avatar name={candidate.fullName} />
                  <div className="min-w-0">
                    {/* The ::after overlay makes the whole row clickable while keeping one link per row. */}
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="font-medium text-ink after:absolute after:inset-0 hover:text-accent focus-visible:after:outline-2 focus-visible:after:outline-accent"
                    >
                      {candidate.fullName}
                    </Link>
                    <p className="truncate text-[13px] text-ink-subtle">{candidate.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2.5 text-ink-muted">{candidate.jobTitle}</td>
              <td className="px-3 py-2.5">
                <StageBadge stage={candidate.stage} />
              </td>
              <td className="hidden px-3 py-2.5 text-ink-muted lg:table-cell">{SOURCE_LABELS[candidate.source]}</td>
              <td className="py-2.5 pr-4 pl-3 text-right text-ink-muted tabular-nums">{formatDate(candidate.appliedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <Link href={`/candidates/${candidate.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-subtle/60">
              <Avatar name={candidate.fullName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-ink">{candidate.fullName}</p>
                  <StageBadge stage={candidate.stage} />
                </div>
                <p className="truncate text-[13px] text-ink-muted">{candidate.jobTitle}</p>
                <p className="text-xs text-ink-subtle">
                  {SOURCE_LABELS[candidate.source]} · Applied {formatDate(candidate.appliedAt)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

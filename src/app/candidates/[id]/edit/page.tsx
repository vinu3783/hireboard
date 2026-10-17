import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { PageHeader } from "@/components/layout/page-header";
import { getCandidate, listJobTitles } from "@/lib/candidates/service";

export const metadata: Metadata = { title: "Edit candidate" };

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [candidate, jobTitles] = await Promise.all([getCandidate(id), listJobTitles()]);
  if (!candidate) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Edit ${candidate.fullName}`}
        breadcrumb={
          <>
            <Link href="/candidates" className="hover:text-ink">Candidates</Link>
            <span aria-hidden="true"> / </span>
            <Link href={`/candidates/${candidate.id}`} className="hover:text-ink">{candidate.fullName}</Link>
          </>
        }
      />
      <CandidateForm candidate={candidate} jobTitles={jobTitles} />
    </div>
  );
}

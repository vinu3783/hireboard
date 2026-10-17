import type { Metadata } from "next";
import Link from "next/link";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { PageHeader } from "@/components/layout/page-header";
import { listJobTitles } from "@/lib/candidates/service";

export const metadata: Metadata = { title: "Add candidate" };
// Job-title suggestions come from the database, so render per request.
export const dynamic = "force-dynamic";

export default async function NewCandidatePage() {
  const jobTitles = await listJobTitles();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Add candidate"
        description="Fields marked * are required."
        breadcrumb={<Link href="/candidates" className="hover:text-ink">Candidates</Link>}
      />
      <CandidateForm jobTitles={jobTitles} />
    </div>
  );
}

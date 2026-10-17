import Link from "next/link";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { EmptyState } from "@/components/ui/empty-state";
import { ACTIVE_STAGES, INTERVIEW_STAGES, OFFER_STAGES } from "@/lib/candidates/constants";
import { getDashboardData } from "@/lib/candidates/service";
import { pluralize } from "@/lib/format";

// Always render from live data; never serve a cached snapshot of the metrics.
export const dynamic = "force-dynamic";

const stageHref = (stages: readonly string[]) => `/candidates?stage=${stages.join(",")}`;

export default async function DashboardPage() {
  const { metrics, recentActivity, topRoles, appliedLast7Days } = await getDashboardData();

  const actions = (
    <>
      <ButtonLink href="/pipeline" variant="secondary">
        View pipeline
      </ButtonLink>
      <ButtonLink href="/candidates/new">Add candidate</ButtonLink>
    </>
  );

  if (metrics.total === 0) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="rounded-xl border border-line bg-surface shadow-xs">
          <EmptyState
            title="Welcome to Hireboard"
            description="Add your first candidate to see pipeline metrics, stage breakdowns and recent activity here."
            action={<ButtonLink href="/candidates/new">Add your first candidate</ButtonLink>}
          />
        </div>
        {recentActivity.length > 0 && (
          <Panel title="Recent activity" className="mt-5">
            <RecentActivity activities={recentActivity} />
          </Panel>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your hiring pipeline." actions={actions} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total candidates"
          value={metrics.total}
          detail={`${appliedLast7Days} applied in the last 7 days`}
          href="/candidates"
        />
        <StatCard
          label="Active in pipeline"
          value={metrics.active}
          detail="Excludes hired and rejected"
          href={stageHref(ACTIVE_STAGES)}
        />
        <StatCard
          label="Interviews scheduled"
          value={metrics.interviews}
          detail="Technical + final rounds"
          href={stageHref(INTERVIEW_STAGES)}
        />
        <StatCard
          label="Offers made"
          value={metrics.offers}
          detail={`${metrics.hired} accepted · ${metrics.offers - metrics.hired} pending`}
          href={stageHref(OFFER_STAGES)}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel
          title="Candidates by stage"
          action={
            <Link href="/pipeline" className="text-[13px] font-medium text-accent hover:underline">
              Open pipeline
            </Link>
          }
        >
          <PipelineChart byStage={metrics.byStage} total={metrics.total} />
        </Panel>

        <Panel title="Recent activity">
          <RecentActivity activities={recentActivity} />
        </Panel>
      </div>

      <Panel title="Top roles" className="mt-5">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {topRoles.map((role) => (
            <li key={role.jobTitle}>
              <Link
                href={`/candidates?job=${encodeURIComponent(role.jobTitle)}`}
                className="block rounded-lg border border-line px-3 py-2.5 hover:border-line-strong hover:bg-subtle/60"
              >
                <p className="truncate text-sm font-medium text-ink">{role.jobTitle}</p>
                <p className="text-xs text-ink-subtle">{pluralize(role.count, "candidate")}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

import Link from "next/link";

export function StatCard({ label, value, detail, href }: { label: string; value: number; detail?: string; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-line bg-surface p-4 shadow-xs transition-colors hover:border-line-strong"
    >
      <p className="text-[13px] font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1 flex items-center justify-between gap-2 text-xs text-ink-subtle">
        <span>{detail}</span>
        <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          View →
        </span>
      </p>
    </Link>
  );
}

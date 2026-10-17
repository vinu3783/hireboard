import Link from "next/link";
import { toSearchParams, type ListParams } from "@/lib/candidates/query";

interface PaginationProps {
  params: ListParams;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export function Pagination({ params, page, totalPages, total, pageSize }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const href = (target: number) => {
    const search = toSearchParams({ ...params, page: target });
    return search.size ? `/candidates?${search}` : "/candidates";
  };

  const linkClass =
    "inline-flex h-8 items-center rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink hover:bg-subtle";
  const disabledClass =
    "inline-flex h-8 items-center rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-ink-subtle opacity-60";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
      <p className="text-[13px] text-ink-muted tabular-nums">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of{" "}
        <span className="font-medium text-ink">{total}</span>
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={href(page - 1)} className={linkClass} rel="prev">
              Previous
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">Previous</span>
          )}
          <span className="hidden text-[13px] text-ink-subtle tabular-nums sm:inline">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={href(page + 1)} className={linkClass} rel="next">
              Next
            </Link>
          ) : (
            <span className={disabledClass} aria-disabled="true">Next</span>
          )}
        </div>
      )}
    </nav>
  );
}

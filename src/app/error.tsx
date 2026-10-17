"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Catches errors thrown while rendering any page, most commonly the database
// being unreachable. Server error messages aren't forwarded in production, so
// we show a generic message plus a retry.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-xl border border-line bg-surface px-6 py-14 text-center shadow-xs">
      <h1 className="text-base font-semibold text-ink">We couldn&apos;t load this page</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
        Hireboard couldn&apos;t reach its database or hit an unexpected error. Check your connection and try again.
      </p>
      {error.digest && <p className="mt-2 text-xs text-ink-subtle">Reference: {error.digest}</p>}
      <Button className="mt-5" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

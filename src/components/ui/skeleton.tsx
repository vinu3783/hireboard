// Route-level loading placeholders. Deliberately not used above /candidates:
// a loading boundary there made same-route search-param navigations (filters,
// pagination) stall in Next 15, so the list shows an inline spinner instead.

function Block({ className }: { className: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`} />;
}

export function PageSkeleton({ variant }: { variant: "dashboard" | "detail" | "board" }) {
  return (
    <div aria-busy="true" className="animate-pulse space-y-4">
      <span className="sr-only" role="status">
        Loading…
      </span>
      <div className="h-7 w-48 rounded-md bg-line" />
      {variant === "dashboard" && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Block key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <Block className="h-80" />
            <Block className="h-80" />
          </div>
        </>
      )}
      {variant === "detail" && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Block className="h-96" />
          <Block className="h-96" />
        </div>
      )}
      {variant === "board" && (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <Block key={i} className="h-96 w-56 shrink-0" />
          ))}
        </div>
      )}
    </div>
  );
}

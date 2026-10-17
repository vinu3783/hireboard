import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-md text-[15px] font-semibold tracking-tight text-ink">
      <span className="grid size-6 place-items-center rounded-md bg-accent" aria-hidden="true">
        <svg viewBox="0 0 16 16" className="size-3.5 text-white" fill="currentColor">
          <rect x="2" y="3" width="3" height="10" rx="1" />
          <rect x="6.5" y="3" width="3" height="7" rx="1" />
          <rect x="11" y="3" width="3" height="4" rx="1" />
        </svg>
      </span>
      Hireboard
    </Link>
  );
}

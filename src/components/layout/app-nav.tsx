"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z" },
  { href: "/candidates", label: "Candidates", icon: "M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 8a5 5 0 0 1 10 0M13 4.5a2.5 2.5 0 0 1 0 5M15 12.5a4 4 0 0 1 3 4" },
  { href: "/pipeline", label: "Pipeline", icon: "M3 3h4v14H3zM8 3h4v9H8zM13 3h4v5h-4z" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ orientation }: { orientation: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className={orientation === "vertical" ? "space-y-0.5" : "flex gap-1"}>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-surface text-ink shadow-xs ring-1 ring-line" : "text-ink-muted hover:bg-subtle hover:text-ink"
                }`}
              >
                <svg
                  viewBox="0 0 20 20"
                  className={`size-4 ${active ? "text-accent" : "text-ink-subtle"} ${orientation === "horizontal" ? "hidden sm:block" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

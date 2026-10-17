"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";

const absolute = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function relative(date: Date, now: number): string {
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return absolute.format(date);
}

/**
 * Renders a timestamp in the viewer's timezone. The server can't know that
 * timezone, so it renders the UTC date and the local format is swapped in
 * after hydration.
 */
export function LocalTime({ date, mode = "absolute" }: { date: Date | string; mode?: "absolute" | "relative" }) {
  const value = new Date(date);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(mode === "relative" ? relative(value, Date.now()) : absolute.format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the timestamp changes
  }, [value.getTime(), mode]);

  return (
    <time dateTime={value.toISOString()} title={absolute.format(value)} suppressHydrationWarning>
      {label ?? formatDate(value)}
    </time>
  );
}

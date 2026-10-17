// Application dates are stored as UTC midnight, so format them in UTC to
// avoid showing the previous day in negative-offset timezones.
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

/** "YYYY-MM-DD" for <input type="date">. */
export function toDateInputValue(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

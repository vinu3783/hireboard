import type { ReactNode } from "react";

export function controlClasses(invalid = false) {
  return `block w-full rounded-md border bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle shadow-xs transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 ${
    invalid ? "border-danger focus-visible:outline-danger" : "border-line-strong focus-visible:outline-accent"
  }`;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Label + control + hint/error. The control must set `id`, and
 * `aria-describedby={describedBy(id, hint, error)}` to link the messages.
 */
export function Field({ id, label, required, hint, error, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-ink-subtle"> (optional)</span>
        )}
      </label>
      {children}
      {/* A fixed-height message line: showing an error on blur must not shift
          the layout, or a click on the submit button can miss its target. */}
      <div className="mt-1 min-h-5 text-[13px] leading-5">
        {error ? (
          <p id={`${id}-error`} className="text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-ink-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

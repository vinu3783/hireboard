"use client";

import type { Candidate } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { controlClasses, describedBy, Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiRequest } from "@/lib/api-client";
import { SOURCE_LABELS, SOURCES, STAGE_LABELS, STAGES } from "@/lib/candidates/constants";
import { candidateInputSchema, normalizeSkills, toFieldErrors, type FieldErrors } from "@/lib/candidates/schema";
import { toDateInputValue } from "@/lib/format";

type Values = Record<
  | "fullName"
  | "email"
  | "phone"
  | "jobTitle"
  | "yearsExperience"
  | "skills"
  | "stage"
  | "source"
  | "appliedAt"
  | "notes"
  | "resumeUrl",
  string
>;

function initialValues(candidate?: Candidate): Values {
  return {
    fullName: candidate?.fullName ?? "",
    email: candidate?.email ?? "",
    phone: candidate?.phone ?? "",
    jobTitle: candidate?.jobTitle ?? "",
    yearsExperience: candidate?.yearsExperience?.toString() ?? "",
    skills: candidate?.skills.join(", ") ?? "",
    stage: candidate?.stage ?? "APPLIED",
    source: candidate?.source ?? "",
    appliedAt: toDateInputValue(candidate?.appliedAt ?? new Date()),
    notes: candidate?.notes ?? "",
    resumeUrl: candidate?.resumeUrl ?? "",
  };
}

interface CandidateFormProps {
  candidate?: Candidate;
  /** Existing job titles, offered as suggestions. */
  jobTitles: string[];
}

export function CandidateForm({ candidate, jobTitles }: CandidateFormProps) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(candidate);
  const [values, setValues] = useState<Values>(() => initialValues(candidate));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    if (errors[field]) setErrors(({ [field]: _removed, ...rest }) => rest);
  }

  /** Re-validates one field on blur so errors appear without waiting for submit. */
  function validateField(field: keyof Values) {
    const result = candidateInputSchema.safeParse(values);
    const fieldError = result.success ? undefined : toFieldErrors(result.error)[field];
    setErrors((current) => ({ ...current, [field]: fieldError }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = candidateInputSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = toFieldErrors(result.error);
      setErrors(fieldErrors);
      // Move focus to the first invalid field.
      const first = Object.keys(fieldErrors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const saved = await apiRequest<Candidate>(isEdit ? `/api/candidates/${candidate!.id}` : "/api/candidates", {
        method: isEdit ? "PATCH" : "POST",
        body: values,
      });
      toast(isEdit ? "Candidate updated" : `${saved.fullName} added to the pipeline`);
      router.push(`/candidates/${saved.id}`);
      router.refresh();
    } catch (error) {
      setSubmitting(false);
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setFormError(error.message);
        const first = Object.keys(error.fieldErrors)[0];
        if (first) document.getElementById(first)?.focus();
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  }

  const control = (field: keyof Values, hint?: string) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: { target: { value: string } }) => set(field, event.target.value),
    onBlur: () => validateField(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": describedBy(field, hint, errors[field]),
  });

  const skillPreview = normalizeSkills(values.skills);

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-surface shadow-xs">
      {formError && (
        <div role="alert" className="border-b border-rose-200 bg-danger-soft px-5 py-3 text-sm text-danger">
          {formError}
        </div>
      )}

      <fieldset className="grid gap-x-5 gap-y-1.5 p-5 sm:grid-cols-2">
        <legend className="sr-only">Contact details</legend>
        <SectionTitle>Contact</SectionTitle>
        <Field id="fullName" label="Full name" required error={errors.fullName}>
          <input {...control("fullName")} autoComplete="off" className={`${controlClasses(!!errors.fullName)} h-9`} />
        </Field>
        <Field id="email" label="Email" required error={errors.email}>
          <input {...control("email")} type="email" autoComplete="off" className={`${controlClasses(!!errors.email)} h-9`} />
        </Field>
        <Field id="phone" label="Phone" error={errors.phone}>
          <input {...control("phone")} type="tel" className={`${controlClasses(!!errors.phone)} h-9`} />
        </Field>
        <Field id="resumeUrl" label="Resume URL" error={errors.resumeUrl}>
          <input
            {...control("resumeUrl")}
            type="url"
            placeholder="https://"
            className={`${controlClasses(!!errors.resumeUrl)} h-9`}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-x-5 gap-y-1.5 border-t border-line p-5 sm:grid-cols-2">
        <legend className="sr-only">Application</legend>
        <SectionTitle>Application</SectionTitle>
        <Field id="jobTitle" label="Job title applied for" required error={errors.jobTitle}>
          <input {...control("jobTitle")} list="job-title-options" className={`${controlClasses(!!errors.jobTitle)} h-9`} />
          <datalist id="job-title-options">
            {jobTitles.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </Field>
        <Field id="source" label="Source" required error={errors.source}>
          <select {...control("source")} className={`${controlClasses(!!errors.source)} h-9`}>
            <option value="" disabled>
              Select a source
            </option>
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="stage" label="Hiring stage" required error={errors.stage}>
          <select {...control("stage")} className={`${controlClasses(!!errors.stage)} h-9`}>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="appliedAt" label="Application date" required error={errors.appliedAt}>
          <input
            {...control("appliedAt")}
            type="date"
            max={toDateInputValue(new Date())}
            className={`${controlClasses(!!errors.appliedAt)} h-9`}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-x-5 gap-y-1.5 border-t border-line p-5 sm:grid-cols-2">
        <legend className="sr-only">Experience</legend>
        <SectionTitle>Experience</SectionTitle>
        <Field id="yearsExperience" label="Years of experience" error={errors.yearsExperience}>
          <input
            {...control("yearsExperience")}
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            className={`${controlClasses(!!errors.yearsExperience)} h-9`}
          />
        </Field>
        <Field id="skills" label="Skills" hint="Separate skills with commas" error={errors.skills}>
          <input
            {...control("skills", "Separate skills with commas")}
            placeholder="React, TypeScript, SQL"
            className={`${controlClasses(!!errors.skills)} h-9`}
          />
          {skillPreview.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="Skills preview">
              {skillPreview.map((skill) => (
                <li key={skill} className="rounded border border-line bg-subtle px-1.5 py-0.5 text-xs text-ink-muted">
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </Field>
        <Field id="notes" label="Recruiter notes" error={errors.notes} className="sm:col-span-2">
          <textarea {...control("notes")} rows={4} className={`${controlClasses(!!errors.notes)} py-2`} />
        </Field>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 border-t border-line bg-subtle/50 px-5 py-3 sm:flex-row sm:justify-end">
        <ButtonLink href={isEdit ? `/candidates/${candidate!.id}` : "/candidates"} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" loading={submitting}>
          {isEdit ? "Save changes" : "Add candidate"}
        </Button>
      </div>
    </form>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold tracking-wide text-ink-subtle uppercase sm:col-span-2" aria-hidden="true">
      {children}
    </h2>
  );
}

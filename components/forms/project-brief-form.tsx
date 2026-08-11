"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type SubmitHandler,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  PROJECT_INQUIRY_FIELD_ORDER,
  PROJECT_TYPE_OPTIONS,
  projectInquirySchema,
  type ProjectInquiry,
  type ProjectInquiryVisibleField,
} from "@/lib/validation/project-inquiry";

const FIELD_LABELS: Record<ProjectInquiryVisibleField, string> = {
  projectType: "Project type",
  name: "Name",
  company: "Company",
  email: "Email",
  projectSummary: "Project summary",
  budget: "Budget",
  timeline: "Timeline",
};

type ContactResponse = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof ProjectInquiry, string[]>>;
};

type SuccessContact = Pick<ProjectInquiry, "email" | "name">;

function fieldErrorId(field: ProjectInquiryVisibleField) {
  return `project-brief-${field}-error`;
}

export function ProjectBriefForm() {
  const [submissionAttempt, setSubmissionAttempt] = useState<{
    id: string;
    signature: string;
  } | null>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [successContact, setSuccessContact] =
    useState<SuccessContact | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
    setValue,
  } = useForm<ProjectInquiry>({
    resolver: zodResolver(projectInquirySchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      submissionId: "",
      name: "",
      company: "",
      email: "",
      projectSummary: "",
      budget: "",
      timeline: "",
      website: "",
    },
  });

  useEffect(() => {
    setValue("submissionId", window.crypto.randomUUID(), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [setValue]);

  useEffect(() => {
    if (successContact) {
      successRef.current?.focus();
    }
  }, [successContact]);

  const visibleErrors = PROJECT_INQUIRY_FIELD_ORDER.flatMap((field) => {
    const message = errors[field]?.message;

    return typeof message === "string" ? [{ field, message }] : [];
  });

  const focusField = (field: ProjectInquiryVisibleField) => {
    setFocus(field, { shouldSelect: true });
  };

  const handleInvalid = (fieldErrors: FieldErrors<ProjectInquiry>) => {
    setServerMessage(null);

    const firstError = PROJECT_INQUIRY_FIELD_ORDER.find(
      (field) => fieldErrors[field],
    );

    if (firstError) {
      window.requestAnimationFrame(() => focusField(firstError));
    }
  };

  const submitBrief: SubmitHandler<ProjectInquiry> = async (values) => {
    setServerMessage(null);

    const signature = JSON.stringify(
      PROJECT_INQUIRY_FIELD_ORDER.map((field) => values[field]),
    );
    const submissionId =
      submissionAttempt?.signature === signature
        ? submissionAttempt.id
        : submissionAttempt
          ? window.crypto.randomUUID()
          : values.submissionId;
    const submission = { ...values, submissionId };

    setSubmissionAttempt({ id: submissionId, signature });
    setValue("submissionId", submissionId, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const payload = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok || !payload.ok) {
        if (payload.fieldErrors) {
          for (const field of PROJECT_INQUIRY_FIELD_ORDER) {
            const message = payload.fieldErrors[field]?.[0];

            if (message) {
              setError(field, { type: "server", message });
            }
          }

          const firstServerError = PROJECT_INQUIRY_FIELD_ORDER.find(
            (field) => payload.fieldErrors?.[field]?.[0],
          );

          if (firstServerError) {
            window.requestAnimationFrame(() => focusField(firstServerError));
            return;
          }
        }

        setServerMessage(
          payload.message ??
            "We could not send the brief right now. Please try again.",
        );
        return;
      }

      setSuccessContact({ email: submission.email, name: submission.name });
    } catch {
      setServerMessage(
        "The connection was interrupted. Your answers are still here, so you can try again.",
      );
    }
  };

  if (successContact) {
    return (
      <div
        ref={successRef}
        className="wc-project-brief__success"
        role="status"
        tabIndex={-1}
      >
        <p className="wc-project-brief__eyebrow">Brief received</p>
        <h3>Thanks, {successContact.name}.</h3>
        <p>
          A confirmation is on its way to {successContact.email}. We will review
          the brief and reply with the right next questions.
        </p>
      </div>
    );
  }

  return (
    <form
      className="wc-project-brief"
      aria-busy={isSubmitting}
      aria-labelledby="project-brief-form-title"
      noValidate
      onSubmit={handleSubmit(submitBrief, handleInvalid)}
    >
      <div className="wc-project-brief__header">
        <p className="wc-project-brief__eyebrow">Open a creative brief</p>
        <h3 id="project-brief-form-title">Your project, in a few clear lines.</h3>
        <p>
          Start with what you know. Budget and timing can stay open while the
          idea takes shape.
        </p>
      </div>

      {visibleErrors.length > 0 ? (
        <div
          className="wc-project-brief__error-summary"
          role="alert"
          aria-labelledby="project-brief-error-title"
        >
          <p id="project-brief-error-title">
            Check {visibleErrors.length === 1 ? "this field" : "these fields"}:
          </p>
          <ul>
            {visibleErrors.map(({ field, message }) => (
              <li key={field}>
                <button type="button" onClick={() => focusField(field)}>
                  {FIELD_LABELS[field]}: {message}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {serverMessage ? (
        <p className="wc-project-brief__server-error" role="alert">
          {serverMessage}
        </p>
      ) : null}

      <input type="hidden" {...register("submissionId")} />

      <div className="wc-project-brief__honeypot" aria-hidden="true">
        <label htmlFor="project-brief-website">Leave this field empty</label>
        <input
          id="project-brief-website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          {...register("website")}
        />
      </div>

      <div className="wc-project-brief__fields">
        <div className="wc-project-brief__field wc-project-brief__field--wide">
          <label htmlFor="project-brief-project-type">
            Project type <span aria-hidden="true">*</span>
            <span className="wc-sr-only"> (required)</span>
          </label>
          <select
            id="project-brief-project-type"
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={
              errors.projectType ? fieldErrorId("projectType") : undefined
            }
            required
            {...register("projectType")}
          >
            <option value="">Choose the closest fit</option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.projectType?.message ? (
            <p id={fieldErrorId("projectType")} className="wc-project-brief__field-error">
              {errors.projectType.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field">
          <label htmlFor="project-brief-name">
            Name <span aria-hidden="true">*</span>
            <span className="wc-sr-only"> (required)</span>
          </label>
          <input
            id="project-brief-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? fieldErrorId("name") : undefined}
            required
            {...register("name")}
          />
          {errors.name?.message ? (
            <p id={fieldErrorId("name")} className="wc-project-brief__field-error">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field">
          <label htmlFor="project-brief-company">
            Company <span>Optional</span>
          </label>
          <input
            id="project-brief-company"
            type="text"
            autoComplete="organization"
            maxLength={120}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={
              errors.company ? fieldErrorId("company") : undefined
            }
            {...register("company")}
          />
          {errors.company?.message ? (
            <p id={fieldErrorId("company")} className="wc-project-brief__field-error">
              {errors.company.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field wc-project-brief__field--wide">
          <label htmlFor="project-brief-email">
            Email <span aria-hidden="true">*</span>
            <span className="wc-sr-only"> (required)</span>
          </label>
          <input
            id="project-brief-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? fieldErrorId("email") : undefined}
            required
            {...register("email")}
          />
          {errors.email?.message ? (
            <p id={fieldErrorId("email")} className="wc-project-brief__field-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field wc-project-brief__field--wide">
          <label htmlFor="project-brief-summary">
            Project summary <span aria-hidden="true">*</span>
            <span className="wc-sr-only"> (required)</span>
          </label>
          <textarea
            id="project-brief-summary"
            rows={7}
            maxLength={4_000}
            aria-invalid={Boolean(errors.projectSummary)}
            aria-describedby={
              errors.projectSummary
                ? `project-brief-summary-help ${fieldErrorId("projectSummary")}`
                : "project-brief-summary-help"
            }
            required
            {...register("projectSummary")}
          />
          <p id="project-brief-summary-help" className="wc-project-brief__field-help">
            What are you building, what needs to change, and why does it matter?
          </p>
          {errors.projectSummary?.message ? (
            <p
              id={fieldErrorId("projectSummary")}
              className="wc-project-brief__field-error"
            >
              {errors.projectSummary.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field">
          <label htmlFor="project-brief-budget">
            Budget <span>Optional</span>
          </label>
          <input
            id="project-brief-budget"
            type="text"
            maxLength={160}
            placeholder="A range or an open question"
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={errors.budget ? fieldErrorId("budget") : undefined}
            {...register("budget")}
          />
          {errors.budget?.message ? (
            <p id={fieldErrorId("budget")} className="wc-project-brief__field-error">
              {errors.budget.message}
            </p>
          ) : null}
        </div>

        <div className="wc-project-brief__field">
          <label htmlFor="project-brief-timeline">
            Timeline <span>Optional</span>
          </label>
          <input
            id="project-brief-timeline"
            type="text"
            maxLength={160}
            placeholder="A date, a season, or flexible"
            aria-invalid={Boolean(errors.timeline)}
            aria-describedby={
              errors.timeline ? fieldErrorId("timeline") : undefined
            }
            {...register("timeline")}
          />
          {errors.timeline?.message ? (
            <p id={fieldErrorId("timeline")} className="wc-project-brief__field-error">
              {errors.timeline.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="wc-project-brief__footer">
        <p>
          We use these details only to review and respond to your project brief.
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending brief..." : "Send project brief"}
        </Button>
      </div>
    </form>
  );
}

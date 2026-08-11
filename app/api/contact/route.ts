import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createHash } from "node:crypto";

import {
  projectInquirySchema,
  type ProjectInquiry,
} from "@/lib/validation/project-inquiry";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 20_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const RATE_LIMIT_MAX_PER_EMAIL = 5;
const RATE_LIMIT_MAX_PER_IP = 10;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

// This is a best-effort per-instance guard. Vercel's deployment-level rate
// limit should remain the durable outer boundary once production traffic begins.
const contactRateLimits = new Map<string, RateLimitBucket>();

type ErrorBody = {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function jsonResponse<T>(body: T, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);

  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Content-Type-Options", "nosniff");

  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}

function errorResponse(
  status: number,
  message: string,
  fieldErrors?: ErrorBody["fieldErrors"],
  headers?: HeadersInit,
) {
  return jsonResponse<ErrorBody>(
    { ok: false, message, fieldErrors },
    status,
    headers,
  );
}

async function readLimitedBody(request: Request) {
  if (!request.body) {
    return { rawBody: "", tooLarge: false } as const;
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let rawBody = "";
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        rawBody += decoder.decode();
        return { rawBody, tooLarge: false } as const;
      }

      receivedBytes += value.byteLength;

      if (receivedBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return { rawBody: "", tooLarge: true } as const;
      }

      rawBody += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function hashRateLimitValue(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function readTrustedClientIp(request: Request) {
  return request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();
}

function consumeRateLimit(key: string, limit: number, now: number) {
  const current = contactRateLimits.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (bucket.count >= limit) {
    return Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000));
  }

  bucket.count += 1;
  contactRateLimits.set(key, bucket);
  return null;
}

function checkRateLimit(request: Request, inquiry: ProjectInquiry) {
  const now = Date.now();

  for (const [key, bucket] of contactRateLimits) {
    if (bucket.resetAt <= now) {
      contactRateLimits.delete(key);
    }
  }

  const clientIp = readTrustedClientIp(request);

  if (clientIp) {
    const ipRetryAfter = consumeRateLimit(
      `ip:${hashRateLimitValue(clientIp)}`,
      RATE_LIMIT_MAX_PER_IP,
      now,
    );

    if (ipRetryAfter) {
      return ipRetryAfter;
    }
  }

  return consumeRateLimit(
    `email:${hashRateLimitValue(inquiry.email.toLowerCase())}`,
    RATE_LIMIT_MAX_PER_EMAIL,
    now,
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

function present(value?: string) {
  return value || "Not provided";
}

function htmlValue(value?: string) {
  return escapeHtml(present(value)).replace(/\r?\n/g, "<br />");
}

function buildInternalText(inquiry: ProjectInquiry) {
  return [
    `Submission ID: ${inquiry.submissionId}`,
    `Project type: ${inquiry.projectType}`,
    `Name: ${inquiry.name}`,
    `Company: ${present(inquiry.company)}`,
    `Email: ${inquiry.email}`,
    `Budget: ${present(inquiry.budget)}`,
    `Timeline: ${present(inquiry.timeline)}`,
    "",
    "Project summary:",
    inquiry.projectSummary,
  ].join("\n");
}

function buildInternalHtml(inquiry: ProjectInquiry) {
  const rows = ([
    ["Submission ID", inquiry.submissionId],
    ["Project type", inquiry.projectType],
    ["Name", inquiry.name],
    ["Company", inquiry.company],
    ["Email", inquiry.email],
    ["Budget", inquiry.budget],
    ["Timeline", inquiry.timeline],
  ] satisfies [string, string | undefined][])
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:8px 16px 8px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:8px 0">${htmlValue(value)}</td></tr>`,
    )
    .join("");

  return `<main style="font-family:Arial,sans-serif;color:#0c0c0b;line-height:1.5"><h1 style="font-size:24px">New WestCose project brief</h1><table style="border-collapse:collapse">${rows}</table><h2 style="font-size:18px;margin-top:32px">Project summary</h2><p>${htmlValue(inquiry.projectSummary)}</p></main>`;
}

function buildConfirmationText(inquiry: ProjectInquiry) {
  return [
    `Hi ${inquiry.name},`,
    "",
    `We received your ${inquiry.projectType.toLowerCase()} project brief.`,
    "",
    "We will review the details and reply with the right next questions.",
    "",
    `Reference: ${inquiry.submissionId}`,
    "",
    "WestCose Designs",
  ].join("\n");
}

function buildConfirmationHtml(inquiry: ProjectInquiry) {
  return `<main style="font-family:Arial,sans-serif;color:#0c0c0b;line-height:1.6"><p>Hi ${escapeHtml(inquiry.name)},</p><p>We received your ${escapeHtml(inquiry.projectType.toLowerCase())} project brief.</p><p>We will review the details and reply with the right next questions.</p><p style="color:#5f5d56;font-size:13px">Reference: ${escapeHtml(inquiry.submissionId)}</p><p>WestCose Designs</p></main>`;
}

function readEmailEnvironment() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  return apiKey && from && to ? { apiKey, from, to } : null;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return errorResponse(415, "Submit the project brief as JSON.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return errorResponse(413, "The project brief is too large to submit.");
  }

  let limitedBody: Awaited<ReturnType<typeof readLimitedBody>>;

  try {
    limitedBody = await readLimitedBody(request);
  } catch {
    return errorResponse(400, "The project brief could not be read.");
  }

  if (limitedBody.tooLarge) {
    return errorResponse(413, "The project brief is too large to submit.");
  }

  let body: unknown;

  try {
    body = JSON.parse(limitedBody.rawBody);
  } catch {
    return errorResponse(400, "The project brief could not be read.");
  }

  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.trim()
  ) {
    return jsonResponse({ ok: true, submissionId: "received" });
  }

  const parsed = projectInquirySchema.safeParse(body);

  if (!parsed.success) {
    const validation = z.flattenError(parsed.error);

    return errorResponse(
      422,
      "Check the highlighted fields and try again.",
      validation.fieldErrors,
    );
  }

  const inquiry = parsed.data;
  const retryAfter = checkRateLimit(request, inquiry);

  if (retryAfter) {
    return errorResponse(
      429,
      "Too many project briefs were submitted. Please wait and try again.",
      undefined,
      { "Retry-After": String(retryAfter) },
    );
  }

  const emailEnvironment = readEmailEnvironment();

  if (!emailEnvironment) {
    return errorResponse(
      503,
      "The brief service is temporarily unavailable. Please try again later.",
    );
  }

  const resend = new Resend(emailEnvironment.apiKey);

  try {
    const { error } = await resend.batch.send(
      [
        {
          from: emailEnvironment.from,
          to: emailEnvironment.to,
          replyTo: inquiry.email,
          subject: `New project brief: ${inquiry.projectType}`,
          text: buildInternalText(inquiry),
          html: buildInternalHtml(inquiry),
        },
        {
          from: emailEnvironment.from,
          to: inquiry.email,
          subject: "We received your WestCose project brief",
          text: buildConfirmationText(inquiry),
          html: buildConfirmationHtml(inquiry),
        },
      ],
      {
        batchValidation: "strict",
        idempotencyKey: `project-inquiry-${inquiry.submissionId}`,
      },
    );

    if (!error) {
      return jsonResponse({ ok: true, submissionId: inquiry.submissionId });
    }

    console.error("Project brief email batch failed.");
  } catch {
    console.error("Project brief email batch threw an exception.");
  }

  return errorResponse(
    502,
    "We could not send the brief right now. Your answers are safe in the form, so please try again.",
  );
}

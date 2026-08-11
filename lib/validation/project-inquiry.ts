import { z } from "zod";

export const PROJECT_TYPE_OPTIONS = [
  "Brand Identity",
  "Logo Design",
  "Illustration",
  "Apparel Design",
  "Brand Development",
  "Corporate Collateral",
  "Ongoing Design Support",
  "Not Sure Yet",
] as const;

const optionalShortAnswer = z
  .string()
  .trim()
  .max(160, "Keep this answer under 160 characters.")
  .optional();

export const projectInquirySchema = z
  .object({
    submissionId: z
      .string()
      .uuid("Refresh the page and try submitting again."),
    projectType: z.enum(PROJECT_TYPE_OPTIONS, {
      error: "Choose the project type that fits best.",
    }),
    name: z
      .string()
      .trim()
      .min(2, "Enter your name.")
      .max(100, "Keep your name under 100 characters."),
    company: z
      .string()
      .trim()
      .max(120, "Keep the company name under 120 characters.")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254, "Keep the email address under 254 characters."),
    projectSummary: z
      .string()
      .trim()
      .min(20, "Share a little more about the project.")
      .max(4_000, "Keep the project summary under 4,000 characters."),
    budget: optionalShortAnswer,
    timeline: optionalShortAnswer,
    website: z.string().max(200).optional(),
  })
  .strict();

export type ProjectInquiry = z.infer<typeof projectInquirySchema>;

export const PROJECT_INQUIRY_FIELD_ORDER = [
  "projectType",
  "name",
  "company",
  "email",
  "projectSummary",
  "budget",
  "timeline",
] as const satisfies readonly (keyof ProjectInquiry)[];

export type ProjectInquiryVisibleField =
  (typeof PROJECT_INQUIRY_FIELD_ORDER)[number];

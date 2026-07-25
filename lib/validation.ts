import { z } from "zod";

export const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 - $5,000",
  "$5,000 - $20,000",
  "$20,000+",
] as const;

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  budgetRange: z.enum(BUDGET_RANGES, {
    message: "Select a budget range",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (10+ characters)")
    .max(2000, "Message is too long"),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const LEAD_STATUSES = ["New", "Contacted", "Closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const statusUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

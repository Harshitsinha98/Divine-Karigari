import { Prisma } from "@prisma/client";
import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3)
      .max(40)
      .regex(/^[A-Za-z0-9_-]+$/),
    description: z
      .string()
      .trim()
      .transform((value) => sanitizeText(value, 300))
      .pipe(z.string().max(300))
      .optional(),
    discountType: z.enum(["percentage", "fixed"]),
    value: z.number().positive(),
    minimumOrder: z.number().nonnegative().nullable().optional(),
    maxDiscount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (value) =>
      value.discountType !== "percentage" ||
      (value.value <= 100 && value.value > 0),
    { message: "Percentage discounts must be between 0 and 100." },
  )
  .refine(
    (value) =>
      !value.startsAt ||
      !value.expiresAt ||
      new Date(value.expiresAt) > new Date(value.startsAt),
    { message: "Expiry must be after the start date." },
  );

export function couponData(input: z.infer<typeof couponSchema>) {
  return {
    ...input,
    code: input.code.toUpperCase(),
    value: new Prisma.Decimal(input.value),
    minimumOrder:
      input.minimumOrder == null
        ? null
        : new Prisma.Decimal(input.minimumOrder),
    maxDiscount:
      input.maxDiscount == null ? null : new Prisma.Decimal(input.maxDiscount),
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  };
}

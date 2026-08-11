import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

const decimalField = z.number().nonnegative();
const clean = (minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, maximum))
    .pipe(z.string().min(minimum).max(maximum));
const optionalClean = (maximum: number) =>
  z
    .string()
    .trim()
    .transform((value) => sanitizeText(value, maximum))
    .pipe(z.string().max(maximum))
    .optional();

export const productInputSchema = z.object({
  categoryId: z.string().min(1),
  name: clean(1, 160),
  slug: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: clean(1, 10000),
  shortDescription: optionalClean(500),
  sku: clean(1, 80),
  price: decimalField,
  compareAtPrice: decimalField.optional(),
  images: z.array(z.string().url()).max(12).default([]),
  occasionTags: z.array(clean(1, 60)).max(30).default([]),
  colors: z.array(clean(1, 60)).max(30).default([]),
  materials: z.array(clean(1, 80)).max(30).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  customizationEnabled: z.boolean().default(false),
  customizationLabel: optionalClean(160),
  customizationMaxLength: z.number().int().positive().max(500).optional(),
  stock: z.number().int().nonnegative().default(0),
  weightGrams: z.number().int().positive().optional(),
  lengthCm: decimalField.optional(),
  widthCm: decimalField.optional(),
  heightCm: decimalField.optional(),
  variants: z
    .array(
      z.object({
        name: optionalClean(120),
        size: optionalClean(80),
        color: optionalClean(80),
        sku: clean(1, 80),
        price: decimalField.optional(),
        stock: z.number().int().nonnegative().default(0),
        imageUrl: z.string().url().optional(),
      }),
    )
    .max(50)
    .default([]),
});

export const categoryInputSchema = z.object({
  name: clean(1, 120),
  slug: z
    .string()
    .min(1)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: optionalClean(1000),
  imageUrl: z.string().url().optional(),
  active: z.boolean().default(true),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

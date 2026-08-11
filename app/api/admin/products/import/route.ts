import { NextResponse } from "next/server";
import { requireAdmin, adminError } from "@/lib/admin-api";
import { productInputSchema } from "@/lib/api-validation";
import { csvList, parseCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

const numberOrUndefined = (value: string) =>
  value.trim() === "" ? undefined : Number(value);
const boolean = (value: string) =>
  ["true", "yes", "1"].includes(value.trim().toLowerCase());

export async function POST(request: Request) {
  const { error } = await requireAdmin(["INVENTORY_MANAGER"]);
  if (error) return error;
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "Choose a CSV file." },
        { status: 400 },
      );

    const rows = parseCsv(await file.text());
    if (!rows.length)
      return NextResponse.json(
        { error: "The CSV has no product rows." },
        { status: 400 },
      );

    const categories = await prisma.category.findMany({
      select: { id: true, slug: true },
    });
    const categoryBySlug = new Map(
      categories.map((category) => [category.slug, category.id]),
    );
    const parsed = rows.map((row, index) => {
      const categoryId = categoryBySlug.get(row.categorySlug);
      const result = productInputSchema.safeParse({
        categoryId,
        name: row.name,
        slug: row.slug,
        description: row.description,
        shortDescription: row.shortDescription || undefined,
        sku: row.sku,
        price: Number(row.price),
        compareAtPrice: numberOrUndefined(row.compareAtPrice),
        images: csvList(row.images),
        occasionTags: csvList(row.occasionTags),
        colors: csvList(row.colors),
        materials: csvList(row.materials),
        status: row.status || "DRAFT",
        customizationEnabled: boolean(row.customizationEnabled),
        customizationLabel: row.customizationLabel || undefined,
        customizationMaxLength: numberOrUndefined(row.customizationMaxLength),
        stock: Number(row.stock || 0),
        weightGrams: numberOrUndefined(row.weightGrams),
        lengthCm: numberOrUndefined(row.lengthCm),
        widthCm: numberOrUndefined(row.widthCm),
        heightCm: numberOrUndefined(row.heightCm),
        variants: [],
      });
      return { row: index + 2, result };
    });
    const invalid = parsed.filter((item) => !item.result.success);
    if (invalid.length)
      return NextResponse.json(
        {
          error: "Some rows could not be imported.",
          details: invalid.map((item) => ({
            row: item.row,
            issues: item.result.error?.issues.map((issue) => issue.message),
          })),
        },
        { status: 400 },
      );

    await prisma.$transaction(
      parsed.map((item) => {
        const input = item.result.data!;
        const { variants, ...product } = input;
        return prisma.product.upsert({
          where: { sku: product.sku },
          update: product,
          create: { ...product, variants: { create: variants } },
        });
      }),
    );
    return NextResponse.json({ data: { imported: parsed.length } });
  } catch (caught) {
    return adminError(caught);
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim().slice(0, 80);
  if (!q || q.length < 2) return NextResponse.json({ data: [] });
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: { category: true },
      take: 6,
      orderBy: { salesCount: "desc" },
    });
    return NextResponse.json({
      data: products.map((product) => ({
        name: product.name,
        slug: product.slug,
        category: product.category.name,
      })),
    });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

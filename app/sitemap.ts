import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/shipping",
    "/returns",
    "/privacy",
    "/terms",
  ];
  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });
  } catch {}
  return [
    ...staticPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency:
        path === "" || path === "/shop"
          ? ("daily" as const)
          : ("monthly" as const),
      priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/shop/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

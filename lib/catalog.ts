import { prisma } from "@/lib/prisma";
import type { CatalogProduct } from "@/components/home/ProductCard";

const fallbackProducts: CatalogProduct[] = [
  {
    id: "fallback-1",
    name: "Personalized Brass Name Plate",
    slug: "personalized-brass-name-plate",
    shortDescription: "A hand-etched welcome.",
    price: 2499,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    category: { name: "Personalized Gifts", slug: "personalized-gifts" },
    customizationEnabled: true,
  },
  {
    id: "fallback-2",
    name: "Handpainted Rakhi Set",
    slug: "handpainted-rakhi-set",
    shortDescription: "For the bond that keeps growing.",
    price: 599,
    images: [
      "https://images.unsplash.com/photo-1599552683573-16b443d7a6a3?auto=format&fit=crop&w=1200&q=80",
    ],
    category: { name: "Rakhi & Festive", slug: "rakhi-festive" },
  },
  {
    id: "fallback-3",
    name: "Carved Mango Wood Bookends",
    slug: "carved-mango-wood-bookends",
    shortDescription: "A little grounding for your shelf.",
    price: 1899,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
    ],
    category: { name: "Home & Decor", slug: "home-decor" },
  },
  {
    id: "fallback-4",
    name: "Dhokra Leaf Earrings",
    slug: "dhokra-leaf-earrings",
    shortDescription: "Wear a little wildness.",
    price: 1299,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    ],
    category: { name: "Jewelry Accessories", slug: "jewelry-accessories" },
  },
];

export const homepageCategories = [
  {
    name: "Personalized gifts",
    slug: "personalized-gifts",
    note: "Made especially for them.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Rakhi & festive",
    slug: "rakhi-festive",
    note: "For rituals and rejoicing.",
    image:
      "https://images.unsplash.com/photo-1599552683573-16b443d7a6a3?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Home & decor",
    slug: "home-decor",
    note: "Quiet pieces for living spaces.",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1000&q=80",
  },
  {
    name: "Jewelry accessories",
    slug: "jewelry-accessories",
    note: "Small accents, lasting feeling.",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80",
  },
];

export async function getHomepageProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    if (!products.length) return fallbackProducts;
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      images: product.images,
      category: { name: product.category.name, slug: product.category.slug },
      customizationEnabled: product.customizationEnabled,
      compareAtPrice: product.compareAtPrice
        ? Number(product.compareAtPrice)
        : null,
      stock: product.stock,
      occasionTags: product.occasionTags,
      colors: product.colors,
      materials: product.materials,
      salesCount: product.salesCount,
    }));
  } catch {
    return fallbackProducts;
  }
}

export async function getListingProducts(filters: {
  category?: string;
  occasion?: string;
  color?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
}) {
  const page = filters.page ?? 1;
  const take = 12;
  try {
    const where = {
      status: "ACTIVE" as const,
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.occasion ? { occasionTags: { has: filters.occasion } } : {}),
      ...(filters.color ? { colors: { has: filters.color } } : {}),
      ...(filters.material ? { materials: { has: filters.material } } : {}),
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            price: {
              ...(filters.minPrice !== undefined
                ? { gte: filters.minPrice }
                : {}),
              ...(filters.maxPrice !== undefined
                ? { lte: filters.maxPrice }
                : {}),
            },
          }
        : {}),
    };
    const orderBy =
      filters.sort === "price-asc"
        ? { price: "asc" as const }
        : filters.sort === "price-desc"
          ? { price: "desc" as const }
          : filters.sort === "popularity"
            ? { salesCount: "desc" as const }
            : { createdAt: "desc" as const };
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * take,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        images: product.images,
        stock: product.stock,
        category: { name: product.category.name, slug: product.category.slug },
        customizationEnabled: product.customizationEnabled,
        occasionTags: product.occasionTags,
        colors: product.colors,
        materials: product.materials,
        salesCount: product.salesCount,
      })),
      total,
      page,
      pageCount: Math.max(1, Math.ceil(total / take)),
    };
  } catch {
    return {
      products: fallbackProducts,
      total: fallbackProducts.length,
      page: 1,
      pageCount: 1,
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
        reviews: {
          where: { approved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (product)
      return {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        variants: product.variants.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : null,
        })),
      };
  } catch {}
  const fallback = fallbackProducts.find((product) => product.slug === slug);
  if (!fallback) return null;
  return {
    ...fallback,
    description:
      fallback.shortDescription ?? "A considered piece, made by hand.",
    variants: [],
    reviews: [],
    stock: fallback.stock ?? 12,
    customizationLabel: fallback.customizationEnabled ? "Your message" : null,
    customizationMaxLength: fallback.customizationEnabled ? 40 : null,
    category: fallback.category,
  };
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/home/ProductCard";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { Reveal } from "@/components/motion/Reveal";
import { ProductGallery } from "@/components/shop/ProductGallery";
import {
  ProductPurchase,
  type ProductDetailData,
} from "@/components/shop/ProductPurchase";
import { getHomepageProducts, getProductBySlug } from "@/lib/catalog";
import { siteName, siteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Gift Not Found" };
  const description =
    product.shortDescription ??
    product.description.slice(0, 155) ??
    `Shop ${product.name} from ${siteName}.`;
  const url = `${siteUrl}/shop/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName,
      title: product.name,
      description,
      url,
      images: product.images.map((image) => ({
        url: image,
        alt: product.name,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const raw = await getProductBySlug(params.slug);
  if (!raw) notFound();
  const product: ProductDetailData = {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    price: Number(raw.price),
    compareAtPrice: raw.compareAtPrice ? Number(raw.compareAtPrice) : null,
    images: raw.images,
    stock: raw.stock,
    customizationEnabled: raw.customizationEnabled ?? false,
    customizationLabel: raw.customizationLabel,
    customizationMaxLength: raw.customizationMaxLength,
    category: { name: raw.category.name, slug: raw.category.slug },
    variants: raw.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
    })),
    reviews: raw.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      adminReply: "adminReply" in review ? review.adminReply : null,
      user: "user" in review ? review.user : null,
    })),
  };
  const related = (await getHomepageProducts())
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.category.slug === product.category.slug,
    )
    .slice(0, 4);
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
    : null;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: "sku" in raw ? raw.sku : undefined,
    category: product.category.name,
    brand: { "@type": "Brand", name: siteName },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/shop/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(averageRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: product.reviews.length,
          },
        }
      : {}),
  };
  return (
    <main className="container py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <ProductGallery images={product.images} name={product.name} />
        <ProductPurchase product={product} />
      </div>
      {related.length > 0 && (
        <Reveal>
          <section className="mt-24 border-t border-sand-line pt-12">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              You may also like
            </p>
            <h2 className="mt-3 font-display text-4xl">
              More from {product.category.name}.
            </h2>
            <div className="mt-8">
              <ProductCarousel products={related} />
            </div>
          </section>
        </Reveal>
      )}
    </main>
  );
}

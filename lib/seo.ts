import type { Metadata } from "next";

export const siteName = "Divine Karigari";
export const siteDescription =
  "Premium handcrafted and personalized gifts from India for festivals, weddings, birthdays, and meaningful everyday moments.";
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export function pageMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

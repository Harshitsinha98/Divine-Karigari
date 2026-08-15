import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@/styles/globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CommerceProvider } from "@/components/commerce/CommerceProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { OAuthHashHandler } from "@/components/auth/OAuthHashHandler";
import { siteDescription, siteName, siteUrl } from "@/lib/seo";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Handcrafted & Personalized Gifts`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName,
    title: `${siteName} | Handcrafted & Personalized Gifts`,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Handcrafted & Personalized Gifts`,
    description: siteDescription,
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <OAuthHashHandler />
        <CommerceProvider>
          <SiteChrome>{children}</SiteChrome>
          <Analytics />
        </CommerceProvider>
      </body>
    </html>
  );
}

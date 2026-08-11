import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact Us",
  "Contact Divine Karigari about orders, personalized gifts, collaborations, or customer support.",
  "/contact",
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

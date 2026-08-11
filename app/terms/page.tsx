import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Terms & Conditions",
  "Terms governing orders, personalization, payments, and use of the Divine Karigari website.",
  "/terms",
);
export default function TermsPage() {
  return (
    <PolicyPage eyebrow="The fine print" title="Terms & Conditions">
      <h2>Using Divine Karigari</h2>
      <p>
        By using this website, you agree to these terms and to provide accurate
        information when placing an order. We may update product details,
        availability, prices, and these terms from time to time.
      </p>
      <h2>Products and customization</h2>
      <p>
        Our products are handmade or hand-finished, so small variations in
        colour, grain, texture, and finish are part of their character. You are
        responsible for checking personalized text before submitting an order.
      </p>
      <h2>Orders and payment</h2>
      <p>
        An order is accepted when payment is confirmed and we send an order
        confirmation. We may contact you if an item is unavailable or if we need
        to verify order details.
      </p>
      <h2>Intellectual property</h2>
      <p>
        All text, imagery, marks, and design elements on this website belong to
        Divine Karigari or our partners and may not be copied or used without
        permission.
      </p>
    </PolicyPage>
  );
}

import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Exchange & Support Policy",
  "How we handle damaged or incorrect orders at Divine Karigari.",
  "/returns",
);
export default function ReturnsPage() {
  return (
    <PolicyPage eyebrow="We're here to help" title="Exchange & Support Policy">
      <h2>No returns</h2>
      <p>
        Due to the handcrafted and personalized nature of our products, we do
        not accept returns or offer refunds for change of mind. Each piece is
        made to order with care and craftsmanship.
      </p>
      <h2>Damaged or incorrect orders</h2>
      <p>
        If your order arrives damaged, defective, or incorrect, please contact
        us on WhatsApp within 48 hours of delivery with photographs of the
        parcel and item. We&apos;ll review and arrange an exchange or suitable
        resolution on a case-by-case basis.
      </p>
      <h2>Need help?</h2>
      <p>
        For any concerns about your order, reach out to us directly on WhatsApp
        and we&apos;ll be happy to assist you promptly.
      </p>
    </PolicyPage>
  );
}

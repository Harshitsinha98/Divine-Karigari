import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Return & Refund Policy",
  "Eligibility, timelines, and refund information for Divine Karigari orders.",
  "/returns",
);
export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="If something isn’t right"
      title="Return & Refund Policy"
    >
      <h2>Eligible returns</h2>
      <p>
        Unused, non-personalized items may be eligible for a return request
        within 7 days of delivery. Items must be in their original condition and
        packaging.
      </p>
      <h2>Damaged or incorrect orders</h2>
      <p>
        Please contact us within 48 hours of delivery with photographs of the
        parcel and item. We’ll review the issue and arrange a replacement,
        refund, or other suitable resolution.
      </p>
      <h2>Personalized items</h2>
      <p>
        Customized products are made specifically for you and cannot usually be
        returned for a change of mind. This does not affect your rights if an
        item arrives damaged, defective, or incorrectly made.
      </p>
      <h2>Refunds</h2>
      <p>
        Approved refunds are sent to the original payment method. Processing
        time can vary by bank or payment provider. Final eligibility and process
        will be confirmed in our launch-ready policy.
      </p>
    </PolicyPage>
  );
}

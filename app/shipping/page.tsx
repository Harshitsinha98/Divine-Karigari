import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Shipping Policy",
  "Delivery coverage, timelines, and tracking for Divine Karigari orders across India.",
  "/shipping",
);
export default function ShippingPage() {
  return (
    <PolicyPage eyebrow="From our hands to yours" title="Shipping Policy">
      <h2>Delivery across India</h2>
      <p>
        We currently deliver to serviceable pin codes across India. Orders are
        dispatched after payment confirmation and any personalization
        preparation is complete.
      </p>
      <h2>Estimated timelines</h2>
      <p>
        Standard delivery generally takes 3–7 working days after dispatch.
        Remote locations and peak festive periods may take longer. The estimated
        delivery date shown at checkout is the best current guide.
      </p>
      <h2>Shipping charges</h2>
      <p>
        Shipping is <strong>free</strong> on all orders above ₹499. For orders
        below ₹499, a nominal delivery charge based on your pincode and package
        weight will be shown at checkout before payment.
      </p>
      <h2>Tracking</h2>
      <p>
        Once your order ships, we&apos;ll share tracking details by email. You
        can also track anytime from your account or the Track Order page.
      </p>
    </PolicyPage>
  );
}

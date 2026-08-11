import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Shipping Policy",
  "Delivery coverage, timelines, shipping charges, and tracking for Divine Karigari orders across India.",
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
        Shipping is free on orders over ₹999. A delivery charge may apply below
        that threshold and will be shown before payment.
      </p>
      <h2>Tracking</h2>
      <p>
        Once your order ships, we’ll share tracking details by email or message.
        Please ensure someone is available to receive the parcel.
      </p>
    </PolicyPage>
  );
}

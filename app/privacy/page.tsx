import { PolicyPage } from "@/components/pages/PolicyPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Privacy Policy",
  "How Divine Karigari collects, uses, and protects customer information.",
  "/privacy",
);
export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="Your privacy matters" title="Privacy Policy">
      <h2>What we collect</h2>
      <p>
        We collect information you share when you create an account, place an
        order, request personalization, contact us, or subscribe to updates.
        This may include your name, email, phone number, delivery address, and
        order details.
      </p>
      <h2>How we use it</h2>
      <p>
        We use this information to process and deliver orders, provide customer
        support, personalize your experience, prevent fraud, and share updates
        you have requested. We do not sell your personal information.
      </p>
      <h2>Payments and partners</h2>
      <p>
        Payment details are processed by our payment partners. Shipping
        information is shared only with the logistics partners needed to deliver
        your order.
      </p>
      <h2>Your choices</h2>
      <p>
        You may ask us to access, correct, or delete personal information we
        hold about you by writing to hello@divinekarigari.in. Some information
        may need to be retained for legal or accounting purposes.
      </p>
    </PolicyPage>
  );
}

import { Accordion } from "@/components/ui/Accordion";
import { PageIntro } from "@/components/pages/PageIntro";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Frequently Asked Questions",
  "Answers about personalization, delivery, gifting, returns, and caring for Divine Karigari products.",
  "/faq",
);
export default function FAQPage() {
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro
        eyebrow="Questions, answered"
        title="A little help along the way."
      >
        If you’re still wondering about something, we’d be happy to help at
        hello@divinekarigari.in.
      </PageIntro>
      <div className="mt-12 max-w-3xl">
        <Accordion
          items={[
            {
              title: "Can I personalize a gift?",
              content:
                "Yes. Eligible products will show their personalization field on the product page. Please check spelling carefully before placing your order.",
            },
            {
              title: "How long does personalization take?",
              content:
                "Personalized orders usually need an additional 2–4 working days before dispatch. The product page will show the most accurate estimate.",
            },
            {
              title: "Do you ship across India?",
              content:
                "We currently ship across India. Delivery times vary by pin code and will be shown during checkout.",
            },
            {
              title: "Can I send a gift directly to someone?",
              content:
                "Absolutely. Add their address at checkout and include a gift note where available. Pricing is not included in the parcel.",
            },
            {
              title: "What are the shipping charges?",
              content:
                "Shipping is free on all orders above ₹499. For orders below ₹499, a small delivery charge based on your pincode and package weight is shown at checkout.",
            },
            {
              title: "What if my order arrives damaged?",
              content:
                "Please contact us on WhatsApp within 48 hours with photographs of the outer packaging and the product. We’ll help make it right with an exchange or suitable resolution.",
            },
          ]}
        />
      </div>
    </main>
  );
}

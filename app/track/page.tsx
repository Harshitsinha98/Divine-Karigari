import { TrackOrder } from "@/components/track/TrackOrder";
import { PageIntro } from "@/components/pages/PageIntro";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your Divine Karigari order in real time — from dispatch to doorstep.",
};

export default function TrackPage() {
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro eyebrow="Order tracking" title="Where's my gift?">
        Enter your order number and the email or AWB number used at checkout to
        see live delivery updates.
      </PageIntro>
      <div className="mt-12">
        <TrackOrder />
      </div>
    </main>
  );
}

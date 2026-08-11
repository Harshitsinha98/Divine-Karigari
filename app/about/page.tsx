import Image from "next/image";
import Link from "next/link";
import { PageIntro } from "@/components/pages/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "About Us",
  "Meet Divine Karigari and the Indian makers behind our thoughtful, small-batch handcrafted gifts.",
  "/about",
);

export default function AboutPage() {
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro
        eyebrow="The story behind the gift"
        title="Craft is a way of paying attention."
      >
        Divine Karigari brings together India’s rich handmade traditions and the
        simple joy of giving something that feels deeply considered.
      </PageIntro>
      <Reveal>
        <section className="mt-14 grid items-center gap-10 md:grid-cols-2 md:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-soft-xl">
            <Image
              src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80"
              alt="Warm, carefully made home objects"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gold">
              Our beginning
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight">
              A love for the things made slowly.
            </h2>
            <p className="mt-6 text-base leading-8 text-muted-ink">
              We started Divine Karigari after noticing how often the most
              meaningful gifts were the ones with a trace of a person in them —
              a hand-painted line, a small irregularity, a thoughtful detail.
            </p>
            <p className="mt-5 text-base leading-8 text-muted-ink">
              So we began looking for makers across India whose work carried
              that same feeling. Today, we curate small-batch pieces for
              birthdays, weddings, festivals, new beginnings, and all the
              ordinary days worth marking.
            </p>
          </div>
        </section>
      </Reveal>
      <Reveal>
        <section className="mt-20 grid gap-8 border-y border-sand-line py-12 sm:grid-cols-3">
          <div>
            <p className="font-display text-3xl text-oxblood">01</p>
            <h3 className="mt-3 font-display text-2xl">Choose with care</h3>
            <p className="mt-3 text-sm leading-7 text-muted-ink">
              Every object earns its place through material, process, and
              feeling.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-oxblood">02</p>
            <h3 className="mt-3 font-display text-2xl">Make it personal</h3>
            <p className="mt-3 text-sm leading-7 text-muted-ink">
              Thoughtful custom details turn a lovely gift into their gift.
            </p>
          </div>
          <div>
            <p className="font-display text-3xl text-oxblood">03</p>
            <h3 className="mt-3 font-display text-2xl">Keep it human</h3>
            <p className="mt-3 text-sm leading-7 text-muted-ink">
              We believe in makers, honest materials, and less unnecessary
              excess.
            </p>
          </div>
        </section>
      </Reveal>
      <div className="mt-12">
        <Link
          href="/shop"
          className="text-sm font-medium text-oxblood hover:text-gold"
        >
          Explore the collection →
        </Link>
      </div>
    </main>
  );
}

import type { ReactNode } from "react";
import { PageIntro } from "@/components/pages/PageIntro";

export function PolicyPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="container py-16 sm:py-24">
      <PageIntro eyebrow={eyebrow} title={title}>
        This is a working policy draft for Divine Karigari. We’ll refine the
        language with our legal advisor before launch.
      </PageIntro>
      <article className="prose prose-stone prose-headings:font-display prose-headings:font-normal prose-headings:text-ink prose-p:leading-8 prose-li:leading-8 mt-12 max-w-3xl text-muted-ink">
        {children}
      </article>
    </main>
  );
}

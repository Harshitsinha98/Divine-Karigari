import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-sand-line/50 pb-12">
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full border border-oxblood/15 bg-oxblood/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-oxblood">
          <span className="h-1 w-1 rounded-full bg-oxblood" />
          {eyebrow}
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight sm:text-7xl">
          {title}
        </h1>
        {children && (
          <div className="mt-6 max-w-2xl text-base leading-8 text-muted-ink">
            {children}
          </div>
        )}
      </Reveal>
    </div>
  );
}

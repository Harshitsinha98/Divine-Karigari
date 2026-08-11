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
    <div className="border-b border-sand-line pb-12">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.24em] text-oxblood">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight sm:text-7xl">
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

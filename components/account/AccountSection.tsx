import type { ReactNode } from "react";
export function AccountSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
      {children}
    </>
  );
}
export function AccountCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-soft-xl border border-sand-line p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

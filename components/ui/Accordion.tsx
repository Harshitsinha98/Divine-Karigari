"use client";
import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
export function Accordion({
  items,
}: {
  items: { title: string; content: ReactNode }[];
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-sand-line border-y border-sand-line">
      {items.map((item, index) => (
        <div key={item.title}>
          <button
            className="flex w-full items-center justify-between py-5 text-left font-medium"
            aria-expanded={open === index}
            onClick={() => setOpen(open === index ? null : index)}
          >
            {item.title}
            <ChevronDown
              size={18}
              className={cn(
                "text-gold transition-transform",
                open === index && "rotate-180",
              )}
            />
          </button>
          {open === index && (
            <div className="pb-5 pr-8 text-sm leading-7 text-muted-ink">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

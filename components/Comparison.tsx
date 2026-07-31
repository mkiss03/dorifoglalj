"use client";

import { X, Check } from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

export function Comparison({ content }: { content: SiteContent["comparison"] }) {
  return (
    <section className="scroll-mt-24 bg-paper-alt py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

        <div className="shadow-sheet mt-10 rounded-3xl bg-white p-4 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-paper-alt p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{content.old_way_title}</p>
              <ul className="mt-5 space-y-4">
                {content.old_way_items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft">
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 text-[15px] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">{content.new_way_title}</p>
              <ul className="mt-5 space-y-4">
                {content.new_way_items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-dark text-paper">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

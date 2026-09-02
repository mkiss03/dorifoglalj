"use client";

import { CalendarClock, MousePointerClick, ShieldCheck, Timer, type LucideIcon } from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

const POINT_ICONS: Record<string, LucideIcon> = {
  calendar: CalendarClock,
  click: MousePointerClick,
  shield: ShieldCheck,
  timer: Timer,
};

export function WhyUs({ content }: { content: SiteContent["whyus"] }) {
  return (
    <section className="bg-paper py-14 lg:py-20">
      <Container>
        <div className="shadow-sheet rounded-3xl bg-paper-alt p-6 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
          <h2 className="mt-3 max-w-2xl text-balance font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {content.heading}
          </h2>
          {content.subheading && (
            <p className="mt-3 max-w-xl text-lg font-semibold leading-snug text-ink-soft">{content.subheading}</p>
          )}

          <div className="mt-10 grid gap-8 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {content.points.map((p) => {
              const Icon = POINT_ICONS[p.id] ?? CalendarClock;
              return (
                <div key={p.id} className="flex flex-col items-center text-center">
                  <span className="shadow-card flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <p className="mt-4 font-display text-lg text-ink">{p.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

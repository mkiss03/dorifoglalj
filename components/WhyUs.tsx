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
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {content.points.map((p) => {
            const Icon = POINT_ICONS[p.id] ?? CalendarClock;
            return (
              <div key={p.id} className="shadow-card flex flex-col rounded-2xl bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-ink">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-display text-xl text-ink">{p.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.text}</p>
                <div className="mt-4 inline-flex w-fit items-center rounded-full bg-paper-alt px-3 py-1.5">
                  <p className="text-xs font-semibold tabular-nums text-ink-soft">{p.visual}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

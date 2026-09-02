"use client";

import {
  Clock3,
  PhoneOff,
  Link2,
  Tags,
  Images,
  BellRing,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

const POINT_ICONS: Record<string, LucideIcon> = {
  hours: Clock3,
  calls: PhoneOff,
  page: Link2,
  prices: Tags,
  portfolio: Images,
  confirm: BellRing,
  calendar: CalendarClock,
};

export function ForProvidersWhy({ content }: { content: SiteContent["forproviderswhy"] }) {
  return (
    <section className="bg-paper py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 max-w-xl text-balance font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {content.heading}
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.points.map((p) => {
            const Icon = POINT_ICONS[p.id] ?? Clock3;
            return (
              <div key={p.id} className="shadow-card flex flex-col rounded-2xl bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-ink">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 font-display text-lg text-ink">{p.label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{p.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

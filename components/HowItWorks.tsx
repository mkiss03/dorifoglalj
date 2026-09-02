"use client";

import {
  Search,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  UserPlus,
  UserRound,
  CalendarClock,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

const GUEST_ICONS: Record<string, LucideIcon> = {
  search: Search,
  pick: CalendarCheck,
  details: ClipboardList,
  confirm: CheckCircle2,
};

const PROVIDER_ICONS: Record<string, LucideIcon> = {
  register: UserPlus,
  profile: UserRound,
  calendar: CalendarClock,
  accept: Inbox,
};

function FlowColumn({
  heading,
  steps,
  icons,
}: {
  heading: string;
  steps: { id: string; title: string; text: string }[];
  icons: Record<string, LucideIcon>;
}) {
  return (
    <div className="shadow-card rounded-3xl bg-white p-6 lg:p-8">
      <h3 className="font-display text-xl text-ink">{heading}</h3>
      <div className="mt-6">
        {steps.map((s, i) => {
          const Icon = icons[s.id] ?? CheckCircle2;
          const isLast = i === steps.length - 1;
          return (
            <div key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span aria-hidden className="absolute left-5 top-11 bottom-0 w-px bg-line" />
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel text-ink">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="pt-2 text-sm leading-relaxed text-ink">
                <span className="font-semibold">{s.title}</span> <span className="text-ink-soft">{s.text}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HowItWorks({ content }: { content: SiteContent["howitworks"] }) {
  return (
    <section id="hogyan-mukodik" className="scroll-mt-16 bg-paper py-14 lg:scroll-mt-20 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <FlowColumn heading={content.guest_heading} steps={content.guest_steps} icons={GUEST_ICONS} />
          <FlowColumn heading={content.provider_heading} steps={content.provider_steps} icons={PROVIDER_ICONS} />
        </div>
      </Container>
    </section>
  );
}

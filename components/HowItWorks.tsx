"use client";

import Image from "next/image";
import { Search, CalendarCheck, CheckCircle2, Star, Clock, type LucideIcon } from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

const STEP_ICONS: Record<string, LucideIcon> = {
  search: Search,
  pick: CalendarCheck,
  book: CheckCircle2,
};

const RESULT_IMAGES: Record<string, string> = {
  r1: "/images/nails-closeup.jpg",
  r2: "/images/hair-color.jpg",
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < count ? "h-3 w-3 fill-ink text-ink" : "h-3 w-3 text-line"} />
      ))}
    </div>
  );
}

function StepMock({ index, content }: { index: number; content: SiteContent["howitworks"] }) {
  if (index === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-2.5 p-5">
        {content.mock_results.map((r) => (
          <div key={r.id} className="shadow-card flex gap-3 rounded-2xl bg-white p-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <Image src={RESULT_IMAGES[r.id] ?? "/images/nails-closeup.jpg"} alt={r.name} fill sizes="48px" className="photo-grade object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{r.name}</p>
              <Stars count={5} />
              <p className="mt-0.5 truncate text-[11px] text-ink-soft">{r.area}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    const first = content.mock_results[0];
    return (
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src="/images/nails-pink.jpg" alt={first?.name ?? ""} fill sizes="36px" className="photo-grade object-cover" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">{first?.name}</p>
            <p className="text-[11px] text-ink-soft">{content.mock_booking_service_day}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {["09:00", "11:00", "13:30", "14:30"].map((t, i) => (
            <span
              key={t}
              className={
                "flex items-center justify-center rounded-full py-2 text-xs font-semibold tabular-nums " +
                (i === 2 ? "bg-accent-dark text-paper" : "bg-paper-alt text-ink-soft")
              }
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-start justify-center p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dark text-paper">
        <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-ink">{content.mock_confirmation_title}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
        {content.mock_confirmation_detail}
      </p>
    </div>
  );
}

export function HowItWorks({ content }: { content: SiteContent["howitworks"] }) {
  return (
    <section className="bg-paper py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {content.steps.map((s, i) => {
            const Icon = STEP_ICONS[s.id] ?? Search;
            return (
              <div key={s.id} className="flex flex-col">
                <div className="shadow-sheet h-56 overflow-hidden rounded-3xl bg-white">
                  <StepMock index={i} content={content} />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent-dark" strokeWidth={1.75} />
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>
                <h3 className="mt-2 font-display text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

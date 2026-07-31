"use client";

import Link from "next/link";
import {
  UserRound,
  Images,
  Tag,
  CalendarClock,
  BellRing,
  BarChart3,
  Repeat,
  FileCheck2,
  Check,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Container } from "./ui/Container";
import { FacebookGlyph } from "./icons/BrandIcons";
import { MiniCalendar } from "./ui/MiniCalendar";
import type { SiteContent } from "@/lib/content/types";

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  profile: UserRound,
  gallery: Images,
  tag: Tag,
  calendar: CalendarClock,
  bell: BellRing,
  chart: BarChart3,
  repeat: Repeat,
  filecheck: FileCheck2,
};

const DAY_START = 9;
const DAY_END = 18;
const PX_PER_HOUR = 34;
const HOURS = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i);

function timeToY(hour: number) {
  return (hour - DAY_START) * PX_PER_HOUR;
}

type Tone = "gold" | "beige" | "cream";

const toneClass: Record<Tone, string> = {
  gold: "bg-accent-light/35 border-accent-dark/20",
  beige: "bg-panel/45 border-ink/10",
  cream: "bg-paper-alt border-ink/10",
};

/** A minta-naptár elrendezése (időpont, oszlop, szín) kód-vezérelt marad —
 * túl kockázatos lenne szabadon szerkeszthetővé tenni, könnyen eltörne a
 * mock elrendezése. staffId-vel hivatkozik a munkatársra, nem tömb-indexszel,
 * hogy a staff-lista átrendezése (fixed lista is húzható) ne borítsa fel. */
const BOOKING_LAYOUT: Record<string, { staffId: string; start: number; end: number; tone: Tone }> = {
  b1: { staffId: "staff-0", start: 9, end: 10.5, tone: "beige" },
  b2: { staffId: "staff-0", start: 11, end: 12.25, tone: "gold" },
  b3: { staffId: "staff-0", start: 14.5, end: 16, tone: "beige" },
  b4: { staffId: "staff-1", start: 10, end: 11.5, tone: "cream" },
  b5: { staffId: "staff-1", start: 13, end: 14.25, tone: "beige" },
  b6: { staffId: "staff-2", start: 12, end: 13.5, tone: "gold" },
};
const FREE_SLOT = { staffId: "staff-2", start: 15, end: 16.5 };

function DayByStaffCalendar({ content }: { content: SiteContent["forproviders"] }) {
  const height = (DAY_END - DAY_START) * PX_PER_HOUR;
  const staff = content.mock_staff;
  const bookings = content.mock_bookings.filter((b) => BOOKING_LAYOUT[b.id]);

  return (
    <div>
      <div className="flex text-xs">
        <div style={{ width: 40 }} />
        {staff.map((s) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1.5 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-panel text-[11px] font-semibold text-ink">
              {s.initials}
            </span>
            <span className="font-medium text-ink">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="relative flex" style={{ height }}>
        <div style={{ width: 40 }} className="relative shrink-0">
          {HOURS.filter((_, i) => i % 2 === 0).map((h) => (
            <span
              key={h}
              className="absolute left-0 -translate-y-1/2 text-[11px] font-medium tabular-nums text-ink-soft"
              style={{ top: timeToY(h) }}
            >
              {h}:00
            </span>
          ))}
        </div>
        {staff.map((s) => (
          <div key={s.id} className="relative flex-1 border-l border-line">
            {HOURS.map((h) => (
              <div key={h} className="absolute inset-x-0 border-t border-line/70" style={{ top: timeToY(h) }} />
            ))}
            {bookings
              .filter((b) => BOOKING_LAYOUT[b.id].staffId === s.id)
              .map((b) => {
                const layout = BOOKING_LAYOUT[b.id];
                return (
                  <div
                    key={b.id}
                    className={
                      "absolute inset-x-1 overflow-hidden rounded-xl border px-2 py-1.5 text-[11px] leading-tight shadow-card " +
                      toneClass[layout.tone]
                    }
                    style={{ top: timeToY(layout.start), height: (layout.end - layout.start) * PX_PER_HOUR }}
                  >
                    <p className="truncate font-semibold text-ink">{b.name}</p>
                    <p className="truncate text-ink-soft">{b.service}</p>
                  </div>
                );
              })}
            {FREE_SLOT.staffId === s.id && (
              <div
                className="absolute inset-x-1 flex items-center justify-center rounded-xl border border-dashed border-accent-dark/50 text-[11px] font-semibold text-accent-dark"
                style={{ top: timeToY(FREE_SLOT.start), height: (FREE_SLOT.end - FREE_SLOT.start) * PX_PER_HOUR }}
              >
                Szabad
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ForProviders({ content }: { content: SiteContent["forproviders"] }) {
  return (
    <section id="szolgaltatoknak" className="scroll-mt-16 bg-paper-alt py-14 lg:scroll-mt-20 lg:py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">{content.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

            <div className="mt-8 space-y-6">
              {content.promises.map((p, i) => (
                <div key={p.id} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel text-sm font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-lg leading-snug text-ink">{p.title}</p>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-8 sm:grid-cols-2">
              {content.benefits.map((b) => {
                const Icon = BENEFIT_ICONS[b.id] ?? UserRound;
                return (
                  <div key={b.id} className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-card">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <span className="text-[13px] text-ink-soft">{b.label}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/regisztracio"
              className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[15px] font-semibold text-paper shadow-card transition-colors duration-200 hover:bg-ink/90"
            >
              {content.cta_label}
            </Link>
          </div>

          <div className="relative isolate">
            <div aria-hidden className="absolute -inset-10 -z-10 rounded-[3rem] bg-accent-light/70 blur-xl" />
            <div className="shadow-sheet rounded-3xl bg-white p-4 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <p className="font-display text-lg text-ink">{content.mock_date_label}</p>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-full bg-paper-alt p-1 text-xs font-semibold">
                    <span className="rounded-full bg-ink px-3 py-1.5 text-paper">Nap</span>
                    <span className="px-3 py-1.5 text-ink-soft">Hét</span>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-ink/90"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Új időpont
                  </button>
                </div>
              </div>

              <div className="flex gap-6 pt-4">
                <div className="hidden shrink-0 md:block md:w-44">
                  <MiniCalendar selected={new Date()} compact />
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">Munkatársak</p>
                    <ul className="mt-3 space-y-2.5">
                      {content.mock_staff.map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-panel text-[10px] font-semibold text-ink">
                            {s.initials}
                          </span>
                          <span className="flex-1 truncate text-sm text-ink">{s.name}</span>
                          <Check className="h-3.5 w-3.5 shrink-0 text-accent-dark" strokeWidth={2.5} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="min-w-0 flex-1 overflow-x-auto">
                  <DayByStaffCalendar content={content} />
                </div>
              </div>
            </div>

            <div className="shadow-card mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 lg:absolute lg:-bottom-5 lg:-right-4 lg:mt-0 lg:w-64">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                <FacebookGlyph className="h-4 w-4" />
              </span>
              <p className="text-xs font-medium leading-snug text-ink-soft">{content.mock_facebook_note}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

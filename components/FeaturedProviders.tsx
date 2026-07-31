"use client";

import Image from "next/image";
import { MapPin, Star, ArrowUpRight } from "lucide-react";
import { Container } from "./ui/Container";
import { itemAnchor } from "@/lib/content/anchors";
import type { SiteContent } from "@/lib/content/types";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < count ? "h-3 w-3 fill-ink text-ink" : "h-3 w-3 text-line"} />
      ))}
    </div>
  );
}

export function FeaturedProviders({ content }: { content: SiteContent["featuredproviders"] }) {
  return (
    <section className="bg-paper-alt py-14 lg:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>
          </div>
          <p className="max-w-sm text-xs italic leading-relaxed text-ink-soft">{content.disclaimer}</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.cards.map((c) => (
            <a
              key={c.id}
              href="#kereses"
              className="shadow-card group flex flex-col rounded-2xl bg-white p-3 transition-all duration-200 hover:-translate-y-1"
              data-field-anchor={itemAnchor("featuredproviders.cards", c.id, "image")}
            >
              <div className="relative h-36 w-full overflow-hidden rounded-xl">
                <Image
                  src={c.image}
                  alt={`${c.name} — ${c.category}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="photo-grade object-cover"
                />
                <span className="shadow-card absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                  {c.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-2 pt-3">
                <p className="font-display text-lg text-ink">{c.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars count={Math.round(Number(c.rating)) || 0} />
                  <p className="flex items-center gap-1 text-xs text-ink-soft">
                    <MapPin className="h-3 w-3" strokeWidth={1.75} />
                    {c.area}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full bg-paper-alt px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex gap-1.5">
                    {c.slots.map((s) => (
                      <span key={s} className="rounded-full bg-panel px-2 py-1 text-[11px] font-semibold tabular-nums text-ink">
                        {s}
                      </span>
                    ))}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-ink-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import { Container } from "./ui/Container";
import { featuredCities, cities } from "@/lib/cities";
import type { SiteContent } from "@/lib/content/types";

export function BrowseByCity({ content }: { content: SiteContent["browsebycity"] }) {
  return (
    <section className="bg-paper-alt py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{content.featured_label}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {featuredCities.map((city) => (
              <Link
                key={city}
                href={`/kereses?city=${encodeURIComponent(city)}`}
                className="shadow-card flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-lg text-ink transition-all duration-200 hover:-translate-y-0.5"
              >
                <MapPin className="h-4 w-4 text-ink" strokeWidth={1.75} />
                {city}
              </Link>
            ))}
          </div>
        </div>

        <details className="group mt-8">
          <summary className="shadow-card flex cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 [&::-webkit-details-marker]:hidden">
            {content.expand_label}
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="mt-6 columns-2 gap-x-8 sm:columns-3 lg:columns-4">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/kereses?city=${encodeURIComponent(city)}`}
                className="block border-b border-line/70 py-2 text-[15px] text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                {city}
              </Link>
            ))}
          </div>
        </details>
      </Container>
    </section>
  );
}

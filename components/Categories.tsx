"use client";

import Image from "next/image";
import { Container } from "./ui/Container";
import { categoryIconBySlug } from "@/lib/categories";
import type { SiteContent } from "@/lib/content/types";
import type { ResolvedCategory } from "@/lib/content/resolveCategories";

export function Categories({
  content,
  categories,
}: {
  content: SiteContent["categories"];
  categories: ResolvedCategory[];
}) {
  const featured = categories.filter((c) => c.photo);
  const rest = categories.filter((c) => !c.photo);

  return (
    <section id="kategoriak" className="scroll-mt-24 bg-paper py-14 lg:py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{content.intro}</p>
        </div>

        {featured.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((c) => (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
              >
                <Image
                  src={c.photo!}
                  alt={c.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="photo-grade object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-xl text-paper">{c.name}</p>
                  <p className="mt-0.5 text-xs text-paper/70">{c.items.slice(0, 2).join(" · ")}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {rest.map((c) => {
            const Icon = categoryIconBySlug[c.slug];
            return (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                className="shadow-card group flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel text-ink transition-colors duration-200 group-hover:bg-line">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-ink">{c.name}</span>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

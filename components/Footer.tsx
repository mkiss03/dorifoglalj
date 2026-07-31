"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./ui/Container";
import { Logo } from "./Logo";
import { FacebookGlyph, InstagramGlyph } from "./icons/BrandIcons";
import { featuredCities } from "@/lib/cities";
import type { SiteContent } from "@/lib/content/types";
import type { ResolvedCategory } from "@/lib/content/resolveCategories";

export function Footer({
  content,
  categories,
}: {
  content: SiteContent["footer"];
  categories: ResolvedCategory[];
}) {
  return (
    <footer className="bg-paper pt-14 pb-10">
      <Container>
        <div className="grid gap-10 border-b border-line pb-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              {content.popular_categories_label}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`#${c.slug}`}
                  className="shadow-card rounded-full bg-paper-alt px-3 py-1.5 text-xs font-medium text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              {content.popular_cities_label}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {featuredCities.map((city) => (
                <Link
                  key={city}
                  href="#kereses"
                  className="shadow-card rounded-full bg-paper-alt px-3 py-1.5 text-xs font-medium text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.2fr_2fr_1.1fr]">
          <div>
            <Link href="/">
              <Logo className="text-lg" />
            </Link>
            <p className="mt-4 max-w-[26ch] text-sm italic text-ink-soft">{content.tagline}</p>
            <div className="mt-6 flex gap-2">
              <a
                href={content.facebook_url}
                aria-label="Facebook"
                className="shadow-card flex h-9 w-9 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:text-accent-dark"
              >
                <FacebookGlyph className="h-4 w-4" />
              </a>
              <a
                href={content.instagram_url}
                aria-label="Instagram"
                className="shadow-card flex h-9 w-9 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:text-accent-dark"
              >
                <InstagramGlyph className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {content.columns.map((col) => (
              <div key={col.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={l.href}
                        className="text-sm text-ink-soft hover:text-ink transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
              {content.newsletter_heading}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{content.newsletter_subtext}</p>
            <form className="shadow-card mt-4 flex items-center gap-2 rounded-full bg-paper-alt p-1.5 pl-4">
              <input
                type="email"
                placeholder="E-mail címed"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
              />
              <button
                type="submit"
                aria-label="Feliratkozás"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors hover:bg-ink/90"
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row">
          <p>
            © {new Date().getFullYear()} {content.copyright_suffix}
          </p>
          <p>{content.bottom_note}</p>
        </div>
      </Container>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { Container } from "./ui/Container";
import { Logo } from "./Logo";
import { FacebookGlyph, InstagramGlyph } from "./icons/BrandIcons";
import { PoweredByWelisse } from "./PoweredByWelisse";
import { featuredCities } from "@/lib/cities";
import type { SiteContent } from "@/lib/content/types";
import type { ResolvedCategory } from "@/lib/content/resolveCategories";

/** "#" a séma default helyőrzője, amíg nincs valódi social link megadva a
 * szerkesztőben — addig inkább ne jelenjen meg egy sehova sem mutató ikon. */
function isRealUrl(url: string) {
  return url.trim().length > 0 && url.trim() !== "#";
}

export function Footer({
  content,
  categories,
}: {
  content: SiteContent["footer"];
  categories: ResolvedCategory[];
}) {
  const hasSocial = isRealUrl(content.facebook_url) || isRealUrl(content.instagram_url);

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
                  href={`/kereses?category=${c.slug}`}
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
                  href={`/kereses?city=${encodeURIComponent(city)}`}
                  className="shadow-card rounded-full bg-paper-alt px-3 py-1.5 text-xs font-medium text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/">
              <Logo className="text-lg" />
            </Link>
            <p className="mt-4 max-w-[26ch] text-sm italic text-ink-soft">{content.tagline}</p>
            {hasSocial && (
              <div className="mt-6 flex gap-2">
                {isRealUrl(content.facebook_url) && (
                  <a
                    href={content.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="shadow-card flex h-9 w-9 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:text-accent-dark"
                  >
                    <FacebookGlyph className="h-4 w-4" />
                  </a>
                )}
                {isRealUrl(content.instagram_url) && (
                  <a
                    href={content.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="shadow-card flex h-9 w-9 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:text-accent-dark"
                  >
                    <InstagramGlyph className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
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
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row">
          <p>
            © {new Date().getFullYear()} {content.copyright_suffix}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <p>{content.bottom_note}</p>
            <PoweredByWelisse theme="light" utm="idopontneked.hu" />
          </div>
        </div>
      </Container>
    </footer>
  );
}

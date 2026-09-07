"use client";

import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { Container } from "./ui/Container";
import type { SiteContent } from "@/lib/content/types";

export function FinalCta({ content }: { content: SiteContent["finalcta"] }) {
  return (
    <section className="bg-ink py-16 lg:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl tracking-tight text-paper sm:text-4xl">
            {content.heading}
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-paper/10 bg-paper/5 p-6">
            <p className="font-display text-xl text-paper">{content.guest_title}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{content.guest_text}</p>
          </div>
          <div className="rounded-2xl border border-paper/10 bg-paper/5 p-6">
            <p className="font-display text-xl text-paper">{content.provider_title}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">{content.provider_text}</p>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <a
            href="#kereses"
            className="flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-paper px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-paper/90 sm:flex-1"
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
            {content.guest_cta_label}
          </a>
          <Link
            href="/regisztracio"
            className="flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-paper px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-200 hover:bg-paper/90 sm:flex-1"
          >
            {content.provider_cta_label}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

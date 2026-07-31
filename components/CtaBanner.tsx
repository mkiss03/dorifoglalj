"use client";

import { ArrowRight } from "lucide-react";
import { Container } from "./ui/Container";
import { Collage } from "./ui/Collage";
import type { SiteContent } from "@/lib/content/types";

export function CtaBanner({ content }: { content: SiteContent["ctabanner"] }) {
  const segmentByid = Object.fromEntries(content.heading_segments.map((s) => [s.id, s.text]));

  return (
    <section className="bg-ink py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">{content.eyebrow}</p>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-paper sm:text-5xl">
              {segmentByid.lead}
              <span className="text-accent">{segmentByid.accent}</span>
              {segmentByid.tail}
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-paper/60">{content.paragraph}</p>

            <a
              href="#kereses"
              className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-accent-dark px-8 py-4 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-accent"
            >
              {content.cta_label}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative hidden lg:block">
            <Collage image={content.image} alt={content.image_alt} letter="F" />
          </div>
        </div>
      </Container>
    </section>
  );
}

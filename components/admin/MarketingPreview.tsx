"use client";

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedProviders } from "@/components/FeaturedProviders";
import { HowItWorks } from "@/components/HowItWorks";
import { Comparison } from "@/components/Comparison";
import { WhyUs } from "@/components/WhyUs";
import { BrowseByCity } from "@/components/BrowseByCity";
import { ForProviders } from "@/components/ForProviders";
import { CtaBanner } from "@/components/CtaBanner";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { resolveCategories } from "@/lib/content/resolveCategories";
import type { SectionId, SiteContent } from "@/lib/content/types";

/** A `data-preview-section` a kattintás-feloldó (ContentEditor) számára
 * jelöli, melyik szekcióhoz ugorjon a bal oldali formban, ha a kattintott
 * szövegre nincs pontos egyezés az indexben. */
function Section({ id, children }: { id: SectionId; children: React.ReactNode }) {
  return <div data-preview-section={id}>{children}</div>;
}

/** A valódi marketing-komponensek kézzel összeállított sorozata, draft
 * állapotból táplálva — NEM az egész app/(marketing)/layout.tsx, mert
 * annak SmoothScroll-ja (Lenis) globálisan felülírná a szerkesztő saját
 * scrollját. Emiatt itt nincs sticky Header, se MobileStickyCta. */
export function MarketingPreview({ content }: { content: SiteContent }) {
  const resolvedCategories = resolveCategories(content);

  return (
    <div className="origin-top-left" style={{ colorScheme: "light" }}>
      <Section id="header">
        <Header content={content.header} categories={resolvedCategories} />
      </Section>
      <main>
        <Section id="hero">
          <Hero content={content.hero} categories={resolvedCategories} />
        </Section>
        <Section id="categories">
          <Categories content={content.categories} categories={resolvedCategories} />
        </Section>
        <Section id="featuredproviders">
          <FeaturedProviders content={content.featuredproviders} />
        </Section>
        <Section id="howitworks">
          <HowItWorks content={content.howitworks} />
        </Section>
        <Section id="comparison">
          <Comparison content={content.comparison} />
        </Section>
        <Section id="whyus">
          <WhyUs content={content.whyus} />
        </Section>
        <Section id="browsebycity">
          <BrowseByCity content={content.browsebycity} />
        </Section>
        <Section id="forproviders">
          <ForProviders content={content.forproviders} />
        </Section>
        <Section id="ctabanner">
          <CtaBanner content={content.ctabanner} />
        </Section>
        <Section id="faq">
          <Faq content={content.faq} />
        </Section>
      </main>
      <Section id="footer">
        <Footer content={content.footer} categories={resolvedCategories} />
      </Section>
    </div>
  );
}

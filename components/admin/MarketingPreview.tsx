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
import type { SiteContent } from "@/lib/content/types";

/** A valódi marketing-komponensek kézzel összeállított sorozata, draft
 * állapotból táplálva — NEM az egész app/(marketing)/layout.tsx, mert
 * annak SmoothScroll-ja (Lenis) globálisan felülírná a szerkesztő saját
 * scrollját. Emiatt itt nincs sticky Header, se MobileStickyCta. */
export function MarketingPreview({ content }: { content: SiteContent }) {
  const resolvedCategories = resolveCategories(content);

  return (
    <div className="origin-top-left" style={{ colorScheme: "light" }}>
      <Header content={content.header} categories={resolvedCategories} />
      <main>
        <Hero content={content.hero} categories={resolvedCategories} />
        <Categories content={content.categories} categories={resolvedCategories} />
        <FeaturedProviders content={content.featuredproviders} />
        <HowItWorks content={content.howitworks} />
        <Comparison content={content.comparison} />
        <WhyUs content={content.whyus} />
        <BrowseByCity content={content.browsebycity} />
        <ForProviders content={content.forproviders} />
        <CtaBanner content={content.ctabanner} />
        <Faq content={content.faq} />
      </main>
      <Footer content={content.footer} categories={resolvedCategories} />
    </div>
  );
}

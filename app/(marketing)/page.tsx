import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedProviders } from "@/components/FeaturedProviders";
import { HowItWorks } from "@/components/HowItWorks";
import { Comparison } from "@/components/Comparison";
import { WhyUs } from "@/components/WhyUs";
import { ForProviders } from "@/components/ForProviders";
import { CtaBanner } from "@/components/CtaBanner";
import { Faq } from "@/components/Faq";
import { getSiteContent } from "@/lib/content/get-site-content";
import { resolveCategories } from "@/lib/content/resolveCategories";
import { getCountyCities } from "@/lib/supabase/countyCities";
import { getFeaturedProviders } from "@/lib/supabase/featuredProviders";

export default async function Home() {
  const [content, countyCities, featuredProviders] = await Promise.all([
    getSiteContent(),
    getCountyCities(),
    getFeaturedProviders(),
  ]);
  const categories = resolveCategories(content);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.replace(/\n\n/g, " "),
      },
    })),
  };

  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: categories.map((c, i) => ({
      "@type": "Service",
      position: i + 1,
      name: c.name,
      serviceType: c.items.join(", "),
      provider: { "@type": "Organization", name: "IttFoglalj.hu" },
      areaServed: "HU",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <Hero content={content.hero} categories={categories} countyCities={countyCities} />
      <Categories content={content.categories} categories={categories} />
      {featuredProviders.length > 0 && (
        <FeaturedProviders content={content.featuredproviders} providers={featuredProviders} />
      )}
      <HowItWorks content={content.howitworks} />
      <Comparison content={content.comparison} />
      <WhyUs content={content.whyus} />
      <ForProviders content={content.forproviders} />
      <CtaBanner content={content.ctabanner} />
      <Faq content={content.faq} />
    </>
  );
}

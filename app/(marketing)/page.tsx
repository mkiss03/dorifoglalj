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
import { categories } from "@/lib/categories";
import { faqItems } from "@/lib/faq";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
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

export default function Home() {
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
      <Hero />
      <Categories />
      <FeaturedProviders />
      <HowItWorks />
      <Comparison />
      <WhyUs />
      <BrowseByCity />
      <ForProviders />
      <CtaBanner />
      <Faq />
    </>
  );
}

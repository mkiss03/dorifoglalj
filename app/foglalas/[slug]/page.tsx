import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, Link2, MapPin, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/categories";
import { BookingWidget } from "./BookingWidget";
import { TAG_LABELS, type PublicProvider } from "@/lib/supabase/types";

function formatHuf(n: number) {
  return new Intl.NumberFormat("hu-HU").format(n) + " Ft";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_provider", { p_slug: slug });
  if (!data) return { title: "Szolgáltató nem található" };

  const provider = data as PublicProvider;
  const categoryName = categories.find((c) => c.slug === provider.category)?.name;
  const title = `${provider.business_name} · Időpontfoglalás`;
  const description = provider.description
    ? provider.description.slice(0, 160)
    : `${provider.business_name} online időpontfoglalás (${categoryName ?? "szolgáltató"}, ${provider.city ?? "Magyarország"}). Foglalj szabad időpontot online.`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://idopontneked.hu";
  const url = `${siteUrl}/foglalas/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: provider.cover_url || provider.logo_url ? [{ url: provider.cover_url || provider.logo_url! }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_provider", { p_slug: slug });

  if (error || !data) notFound();

  const provider = data as PublicProvider;
  const categoryName = categories.find((c) => c.slug === provider.category)?.name;
  const initial = provider.business_name.trim().charAt(0).toUpperCase() || "?";
  const locationLine = [provider.address, provider.city].filter(Boolean).join(", ");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://idopontneked.hu";

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: provider.business_name,
    description: provider.description || `${categoryName ?? "Szépségipari"} szolgáltató: ${provider.business_name}`,
    url: `${siteUrl}/foglalas/${slug}`,
    telephone: provider.phone || undefined,
    address: provider.city || provider.address ? {
      "@type": "PostalAddress",
      addressLocality: provider.city || undefined,
      streetAddress: provider.address || undefined,
      addressCountry: "HU",
    } : undefined,
    image: provider.cover_url || provider.logo_url || undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Szolgáltatások",
      itemListElement: provider.services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.description || undefined,
        },
        price: s.price_huf,
        priceCurrency: "HUF",
      })),
    },
  };

  return (
    <section className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <div className="h-36 w-full overflow-hidden sm:h-52">
        {provider.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={provider.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-light to-panel" />
        )}
      </div>

      <Container className="max-w-3xl">
        <div className="-mt-10 h-20 w-20 overflow-hidden rounded-full border-4 border-paper-alt bg-accent-light shadow-card sm:-mt-12 sm:h-24 sm:w-24">
          {provider.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-accent-dark">
              {initial}
            </div>
          )}
        </div>

        <div className="mt-4">
          {categoryName && (
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{categoryName}</p>
          )}
          <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {provider.business_name}
          </h1>

          {provider.tags && provider.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {provider.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-dark"
                >
                  {TAG_LABELS[tag]}
                </span>
              ))}
            </div>
          )}

          {locationLine && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-ink-soft">
              <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
              {locationLine}
            </p>
          )}

          {(provider.phone || provider.website || provider.facebook_url || provider.instagram_url) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
              {provider.phone && (
                <a href={`tel:${provider.phone}`} className="flex items-center gap-1.5 hover:text-ink">
                  <Phone className="h-3.5 w-3.5" strokeWidth={2.25} />
                  {provider.phone}
                </a>
              )}
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <Globe className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Weboldal
                </a>
              )}
              {provider.facebook_url && (
                <a
                  href={provider.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <Link2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Facebook
                </a>
              )}
              {provider.instagram_url && (
                <a
                  href={provider.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-ink"
                >
                  <Link2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Instagram
                </a>
              )}
            </div>
          )}

          {provider.description && (
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{provider.description}</p>
          )}
        </div>

        {provider.services.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Szolgáltatások</p>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {provider.services.map((s) => (
                <div
                  key={s.id}
                  className="shadow-card w-56 shrink-0 rounded-2xl bg-white p-4"
                >
                  <p className="font-medium text-ink">{s.name}</p>
                  {s.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{s.description}</p>
                  )}
                  <p className="mt-2 text-sm text-ink-soft">
                    {formatHuf(s.price_huf)} · {s.duration_minutes} perc
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <BookingWidget provider={provider} />
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft">
          Foglalási oldal ·{" "}
          <Link href="/" className="font-semibold text-ink hover:text-accent-dark">
            IdőpontNeked.hu
          </Link>
        </p>
      </Container>
    </section>
  );
}

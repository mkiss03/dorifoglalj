import Link from "next/link";
import { MapPin } from "lucide-react";
import { categories } from "@/lib/categories";
import { TAG_LABELS, type SearchProvider } from "@/lib/supabase/types";

export function ProviderCard({ provider }: { provider: SearchProvider }) {
  const categoryName = categories.find((c) => c.slug === provider.category)?.name ?? provider.category;
  const initial = provider.business_name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={`/foglalas/${provider.slug}`}
      className="shadow-card group flex flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:-translate-y-1"
    >
      {/* Nincs overflow-hidden ezen a dobozon: a logó "-bottom-5"-tel lóg ki
          belőle, hogy a fehér tartalom-sávra lógjon át — a kártya külső
          overflow-hidden-je csak a kártya saját sarkait vágja, ezt nem. */}
      <div className="relative h-32 w-full shrink-0">
        {provider.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={provider.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent-light to-panel" />
        )}
        <div className="shadow-card absolute -bottom-5 left-4 h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-accent-light">
          {provider.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-lg text-accent-dark">
              {initial}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 pt-8">
        {categoryName && (
          <p className="text-[11px] font-bold uppercase tracking-wide text-accent-dark">{categoryName}</p>
        )}
        <p className="mt-1 font-display text-lg text-ink">{provider.business_name}</p>
        {provider.city && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin className="h-3 w-3" strokeWidth={1.75} />
            {provider.city}
          </p>
        )}
        {provider.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {provider.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-paper-alt px-2.5 py-0.5 text-[11px] font-medium text-ink-soft"
              >
                {TAG_LABELS[tag]}
              </span>
            ))}
          </div>
        )}
        <span className="mt-4 inline-flex items-center justify-center self-start rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors duration-200 group-hover:bg-ink/90">
          Foglalás
        </span>
      </div>
    </Link>
  );
}

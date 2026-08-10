import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/search/SearchBar";
import { categories } from "@/lib/categories";
import { PROVIDER_TAGS, TAG_LABELS, type ProviderTag, type SearchProvider } from "@/lib/supabase/types";

type SearchParams = {
  category?: string;
  city?: string;
  date?: string;
  tags?: string | string[];
  q?: string;
};

function normalizeTags(raw: string | string[] | undefined): ProviderTag[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : raw.split(",");
  const known = new Set<string>(PROVIDER_TAGS);
  return list.map((t) => t.trim()).filter((t): t is ProviderTag => known.has(t));
}

function ProviderCard({ provider }: { provider: SearchProvider }) {
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

export default async function KeresesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = sp.category?.trim() || "";
  const city = sp.city?.trim() || "";
  const date = sp.date?.trim() || "";
  const query = sp.q?.trim() || "";
  const selectedTags = normalizeTags(sp.tags);

  const supabase = await createClient();
  const { data } = await supabase.rpc("search_providers", {
    p_category: category || null,
    p_city: city || null,
    p_date: date || null,
    p_tags: selectedTags.length > 0 ? selectedTags : null,
    p_query: query || null,
  });

  const results = (data ?? []) as SearchProvider[];

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Kereső</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Találd meg a tökéletes szolgáltatót
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-ink-soft">
          Keress kulcsszóra (pl. mandula köröm), vagy szűrj kategória, település, dátum és alkalom szerint.
        </p>

        <div className="mt-8">
          <SearchBar
            initialQuery={query}
            initialCategory={category}
            initialCity={city}
            initialDate={date}
            initialTags={selectedTags}
          />
        </div>

        <div className="mt-10">
          {results.length === 0 ? (
            <p className="shadow-card rounded-2xl bg-white p-10 text-center text-[15px] text-ink-soft">
              Nincs találat a megadott feltételekkel — próbálj tágabb keresést.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

import { createPublicClient } from "@/lib/supabase/public";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/search/SearchBar";
import { ProviderCard } from "@/components/search/ProviderCard";
import { PROVIDER_TAGS, type ProviderTag, type SearchProvider } from "@/lib/supabase/types";

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

  // A keresési találatok publikus adatok, nincs szükség a cookie-alapú
  // (auth-os) kliensre — ez a cookie-mentes változat nem kényszeríti ki a
  // dinamikus renderelést feleslegesen egy auth-ellenőrzéssel.
  const supabase = createPublicClient();
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

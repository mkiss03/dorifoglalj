import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { PROVIDER_TAGS, TAG_LABELS, type ProviderTag, type SearchProvider } from "@/lib/supabase/types";

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

type SearchParams = {
  category?: string;
  city?: string;
  date?: string;
  tags?: string | string[];
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
      <div className="relative h-32 w-full overflow-hidden">
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
  const selectedTags = normalizeTags(sp.tags);

  const supabase = await createClient();
  const { data } = await supabase.rpc("search_providers", {
    p_category: category || null,
    p_city: city || null,
    p_date: date || null,
    p_tags: selectedTags.length > 0 ? selectedTags : null,
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
          Szűrj kategória, település, dátum vagy alkalom szerint — regisztráció nélkül, azonnal foglalhatsz.
        </p>

        <form method="get" className="shadow-sheet mt-8 rounded-3xl bg-white p-5 lg:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="category" className={labelClass}>
                Kategória
              </label>
              <select id="category" name="category" defaultValue={category} className={inputClass}>
                <option value="">Összes kategória</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className={labelClass}>
                Település
              </label>
              <input
                id="city"
                name="city"
                list="cities-list"
                defaultValue={city}
                placeholder="pl. Budapest"
                className={inputClass}
                autoComplete="off"
              />
              <datalist id="cities-list">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="date" className={labelClass}>
                Dátum
              </label>
              <input id="date" name="date" type="date" defaultValue={date} className={inputClass} />
            </div>
          </div>

          <div className="mt-4">
            <p className={labelClass}>Alkalom</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {PROVIDER_TAGS.map((tag) => (
                <label key={tag} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag}
                    defaultChecked={selectedTags.includes(tag)}
                    className="peer sr-only"
                  />
                  <span className="inline-block rounded-full border border-line bg-paper-alt px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 peer-checked:border-accent-dark peer-checked:bg-accent-dark peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-accent-light">
                    {TAG_LABELS[tag]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 sm:w-auto"
          >
            Keresés
          </button>
        </form>

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

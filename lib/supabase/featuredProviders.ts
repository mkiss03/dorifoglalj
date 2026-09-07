import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { SearchProvider } from "@/lib/supabase/types";

const FEATURED_COUNT = 4;

/** Ameddig nincs legalább ennyi éles (nem teszt) szolgáltató, a "Már
 * nálunk foglalható" szekció egyáltalán nem jelenik meg a főoldalon —
 * pár db szolgáltatóval még nem hiteles a "kiemelt szolgáltatók" ígérete.
 * Env-változóval felülírható, kódba égetett szám helyett. */
const MIN_PROVIDERS_TO_SHOW_SECTION = Number(process.env.MIN_PROVIDERS_TO_SHOW_SECTION ?? 5);

/** A "Kiemelt szolgáltatók" szekció adatforrása — a meglévő `search_providers`
 * RPC-t hívja szűrők nélkül (ami már úgyis a fotóval rendelkező, aktív,
 * nem-teszt szolgáltatókat rendezi előre — ld. supabase/schema_v17.sql),
 * és az első néhányat adja vissza. Nincs kitalált csillag/időpont — csak
 * azt mutatjuk, ami valódi. Cache-elve, a `lib/supabase/countyCities.ts`
 * mintáját követve. */
export const getFeaturedProviders = unstable_cache(
  async (): Promise<SearchProvider[]> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return [];
    }
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("search_providers", {
        p_category: null,
        p_city: null,
        p_date: null,
        p_tags: null,
        p_query: null,
      });
      if (error) return [];
      const providers = (data ?? []) as SearchProvider[];
      if (providers.length < MIN_PROVIDERS_TO_SHOW_SECTION) return [];
      return providers.slice(0, FEATURED_COUNT);
    } catch {
      return [];
    }
  },
  ["featured-providers"],
  { tags: ["featured-providers"], revalidate: 300 }
);

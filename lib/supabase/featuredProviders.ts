import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { SearchProvider } from "@/lib/supabase/types";

const FEATURED_COUNT = 4;

/** A "Kiemelt szolgáltatók" szekció adatforrása — a meglévő `search_providers`
 * RPC-t hívja szűrők nélkül (ami már úgyis a fotóval rendelkező, aktív
 * szolgáltatókat rendezi előre), és az első néhányat adja vissza. Nincs
 * kitalált csillag/időpont — csak azt mutatjuk, ami valódi. Cache-elve, a
 * `lib/supabase/countyCities.ts` mintáját követve. */
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
      return ((data ?? []) as SearchProvider[]).slice(0, FEATURED_COUNT);
    } catch {
      return [];
    }
  },
  ["featured-providers"],
  { tags: ["featured-providers"], revalidate: 300 }
);

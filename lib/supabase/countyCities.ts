import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { CountyCityCount } from "@/lib/supabase/types";

/** A HungaryMap dinamikus, megyénkénti város-popupjának adatforrása — a
 * `lib/supabase/server.ts` kliens `cookies()`-t olvas, ami a főoldalt
 * kényszerűen dinamikussá tenné; ehelyett a cookie-mentes publikus
 * klienssel, cache-elve kérjük le (a lista pár perces késleltetéssel is
 * teljesen megfelelő, nem kell kérésenként újra lekérdezni). */
export const getCountyCities = unstable_cache(
  async (): Promise<CountyCityCount[]> => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return [];
    }
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.rpc("list_active_cities_by_county");
      if (error) return [];
      return (data ?? []) as CountyCityCount[];
    } catch {
      return [];
    }
  },
  ["county-cities"],
  { tags: ["county-cities"], revalidate: 300 }
);

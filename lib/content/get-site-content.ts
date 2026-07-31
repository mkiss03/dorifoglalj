import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { resolveContent } from "./resolve";
import type { SiteContent } from "./types";

const fetchRows = unstable_cache(
  async () => {
    // Amíg nincs beállítva a Supabase projekt (.env.local) — vagy a
    // site_content tábla még nincs migrálva —, ne dőljön el emiatt az
    // egész marketing oldal: a séma defaultjai önmagukban is a jelenlegi
    // (kódba égetett) tartalmat adják vissza, lásd resolveContent().
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
      return [];
    }
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) return [];
      return data ?? [];
    } catch {
      return [];
    }
  },
  ["site-content"],
  { tags: ["site-content"], revalidate: 3600 }
);

/** A marketing oldal (és annak layout-ja) ezt hívja — a `cache()` és a Next
 * request-memoizáció miatt kérésenként ténylegesen egyszer fut le. Mindig
 * teljesen kitöltött objektumot ad vissza (hiányzó DB-sor = a séma default
 * értéke), a komponenseknek soha nem kell "nincs adat" ágat kezelniük. */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const rows = await fetchRows();
  return resolveContent(rows);
});

import { categories as codeCategories } from "@/lib/categories";
import type { SiteContent } from "./types";

/** A kód-oldali kategória (slug — stabil kulcs, RLS-ek/RPC-k/dashboard is
 * erre hivatkozik) összefésülve a szerkeszthető tartalommal (name/items/
 * photo). Szándékosan NEM tartalmaz ikon-referenciát: ez server→client
 * propként utazik, egy LucideIcon függvényreferencia pedig nem
 * szerializálható azon a határon át — az ikont a kliens-komponensek a
 * `categoryIconBySlug` map-ből, slug alapján olvassák ki maguk. A slug-ok
 * sorrendje és listája kód-vezérelt marad — a szerkesztő nem tud kategóriát
 * hozzáadni/törölni, csak a meglévők szövegét/fotóját módosítani. */
export type ResolvedCategory = {
  slug: string;
  name: string;
  items: string[];
  photo: string | null;
};

export function resolveCategories(content: SiteContent): ResolvedCategory[] {
  const overrides = new Map(content.categories.items.map((c) => [c.id, c]));

  return codeCategories.map((c) => {
    const o = overrides.get(c.slug);
    return {
      slug: c.slug,
      name: o?.name ?? c.name,
      items: o?.items ?? c.items,
      photo: o?.photo ?? null,
    };
  });
}

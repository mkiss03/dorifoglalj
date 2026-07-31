import { CONTENT_SCHEMA } from "./schema";
import { fieldKey } from "./resolve";
import { itemAnchor, subItemAnchor } from "./anchors";
import type { SiteContent } from "./types";

const MIN_LENGTH = 3;

/** Draft tartalomból épített (megjelenő szöveg → form-mező anchor) index —
 * ezt használja az élő előnézet kattintás-feloldója, hogy a kattintott
 * szöveghez tartozó mezőre ugorjon a form-ban. A RevealText-tel (szavankénti
 * animáció) renderelt szegmenseknél ez nem talál pontos egyezést — ott a
 * kattintás a szekció-szintű esésre esik vissza, ez tudatos kompromisszum. */
export function buildTextIndex(draft: SiteContent): Map<string, string> {
  const index = new Map<string, string>();

  function register(value: unknown, anchor: string) {
    if (typeof value !== "string") return;
    const text = value.trim();
    if (text.length < MIN_LENGTH) return;
    if (!index.has(text)) index.set(text, anchor);
  }

  for (const entry of CONTENT_SCHEMA) {
    const field = fieldKey(entry.key);
    const sectionData = draft[entry.section] as unknown as Record<string, unknown>;
    const value = sectionData[field];

    if (entry.kind !== "list") {
      if (entry.kind === "stringlist") {
        for (const v of (value as string[]) ?? []) register(v, entry.key);
      } else if (entry.kind !== "image") {
        // text / textarea / richtext — a kép URL-je nem "kattintható szöveg"
        register(value, entry.key);
      }
      continue;
    }

    for (const item of (value as Record<string, unknown>[]) ?? []) {
      const itemId = String(item.id ?? "");
      for (const f of entry.fields) {
        const anchor = itemAnchor(entry.key, itemId, f.key);
        if (f.kind === "stringlist") {
          for (const v of (item[f.key] as string[]) ?? []) register(v, anchor);
        } else if (f.kind === "sublist") {
          for (const sub of (item[f.key] as Record<string, unknown>[]) ?? []) {
            const subId = String(sub.id ?? "");
            for (const sf of f.fields) {
              if (sf.kind === "stringlist" || sf.kind === "sublist") continue; // legfeljebb 2 szint
              register(sub[sf.key], subItemAnchor(entry.key, itemId, f.key, subId, sf.key));
            }
          }
        } else if (f.kind !== "image") {
          register(item[f.key], anchor);
        }
      }
    }
  }

  return index;
}

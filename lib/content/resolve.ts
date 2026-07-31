import { CONTENT_SCHEMA } from "./schema";
import type { SiteContent } from "./types";

export function fieldKey(entryKey: string): string {
  const dot = entryKey.indexOf(".");
  return entryKey.slice(dot + 1);
}

/** A séma default-jaiból épített, mindig teljes tartalom-fa — ez látszik
 * üres site_content táblával, tehát ennek pontosan a jelenlegi kódba
 * égetett szöveggel kell megegyeznie. */
export function buildDefaultContent(): SiteContent {
  const result: Record<string, Record<string, unknown>> = {};
  for (const entry of CONTENT_SCHEMA) {
    result[entry.section] ??= {};
    result[entry.section][fieldKey(entry.key)] = entry.default;
  }
  return result as unknown as SiteContent;
}

/** DB-sorok (key/value) ráfésülése a defaultokra — hiányzó vagy null kulcs
 * esetén a default marad érvényben. */
export function resolveContent(rows: { key: string; value: unknown }[]): SiteContent {
  const content = buildDefaultContent() as unknown as Record<string, Record<string, unknown>>;
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  for (const entry of CONTENT_SCHEMA) {
    const value = byKey.get(entry.key);
    if (value !== undefined && value !== null) {
      content[entry.section][fieldKey(entry.key)] = value;
    }
  }

  return content as unknown as SiteContent;
}

/** A teljes tartalom-fa visszaalakítása {key, value} sorokká mentéshez. */
export function flattenContent(content: SiteContent): { key: string; value: unknown }[] {
  const flat = content as unknown as Record<string, Record<string, unknown>>;
  return CONTENT_SCHEMA.map((entry) => ({
    key: entry.key,
    value: flat[entry.section][fieldKey(entry.key)],
  }));
}

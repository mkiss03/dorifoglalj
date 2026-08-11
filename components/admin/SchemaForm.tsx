"use client";

import { CONTENT_SCHEMA } from "@/lib/content/schema";
import { fieldKey } from "@/lib/content/resolve";
import { domId } from "@/lib/content/anchors";
import { SECTION_LABELS, type SectionId, type SiteContent } from "@/lib/content/types";
import { ScalarControl, StringListField, RepeaterField, labelClass, type RepeaterItem } from "./fields";

export const MARKETING_SECTION_ORDER: SectionId[] = [
  "hero",
  "header",
  "footer",
  "ctabanner",
  "faq",
  "categories",
  "whyus",
  "comparison",
  "howitworks",
  "forproviders",
  "featuredproviders",
  "mobilestickycta",
];

export const LEGAL_SECTION_ORDER: SectionId[] = ["legal"];
export const ASZF_SECTION_ORDER: SectionId[] = ["aszf"];
export const ADATKEZELES_SECTION_ORDER: SectionId[] = ["adatkezeles"];
export const IMPRESSZUM_SECTION_ORDER: SectionId[] = ["impresszum"];

function entriesBySection() {
  const map = new Map<SectionId, typeof CONTENT_SCHEMA>();
  for (const entry of CONTENT_SCHEMA) {
    if (!map.has(entry.section)) map.set(entry.section, []);
    map.get(entry.section)!.push(entry);
  }
  return map;
}

export function SchemaForm({
  draft,
  onFieldChange,
  sections,
}: {
  draft: SiteContent;
  onFieldChange: (section: SectionId, field: string, value: unknown) => void;
  sections: SectionId[];
}) {
  const bySection = entriesBySection();

  return (
    <div className="space-y-10">
      {sections.map((section) => {
        const entries = bySection.get(section) ?? [];
        return (
          <section key={section} id={`admin-section-${section}`} className="scroll-mt-24">
            <h2 className="font-display text-xl text-ink">{SECTION_LABELS[section]}</h2>
            <div className="shadow-sheet mt-3 space-y-6 rounded-3xl bg-white p-5">
              {entries.map((entry) => {
                const field = fieldKey(entry.key);
                const value = (draft[section] as unknown as Record<string, unknown>)[field];

                if (entry.kind === "list") {
                  return (
                    <div key={entry.key} id={domId(entry.key)}>
                      <p className={labelClass}>{entry.label}</p>
                      <RepeaterField
                        mode={entry.mode}
                        itemLabel={entry.itemLabel}
                        fields={entry.fields}
                        items={value as RepeaterItem[]}
                        onChange={(items) => onFieldChange(section, field, items)}
                        contentKeyPrefix={entry.key}
                      />
                    </div>
                  );
                }

                if (entry.kind === "stringlist") {
                  return (
                    <StringListField
                      key={entry.key}
                      label={entry.label}
                      itemLabel={entry.itemLabel}
                      items={value as string[]}
                      onChange={(items) => onFieldChange(section, field, items)}
                      anchor={entry.key}
                    />
                  );
                }

                return (
                  <ScalarControl
                    key={entry.key}
                    kind={entry.kind}
                    label={entry.label}
                    value={value as string}
                    onChange={(v) => onFieldChange(section, field, v)}
                    contentKey={entry.key}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function SectionJumpNav({ sections }: { sections: SectionId[] }) {
  return (
    <nav className="flex flex-wrap gap-1.5 pb-2">
      {sections.map((section) => (
        <a
          key={section}
          href={`#admin-section-${section}`}
          className="shrink-0 rounded-full bg-paper-alt px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-panel hover:text-ink"
        >
          {SECTION_LABELS[section]}
        </a>
      ))}
    </nav>
  );
}

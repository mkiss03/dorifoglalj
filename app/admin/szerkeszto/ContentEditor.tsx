"use client";

import { useMemo, useState, useTransition } from "react";
import { SchemaForm, SectionJumpNav } from "@/components/admin/SchemaForm";
import { MarketingPreview } from "@/components/admin/MarketingPreview";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { buildTextIndex } from "@/lib/content/reverseIndex";
import { domId } from "@/lib/content/anchors";
import { saveSiteContentAction, type SaveContentState } from "./actions";
import type { SectionId, SiteContent } from "@/lib/content/types";

const initialSaveState: SaveContentState = { status: "idle" };

// A pontos konstansok itt kellenek, hogy a Tailwind build lássa és
// legenerálja őket — classList.add-dal adjuk hozzá, nem className-nel.
const HIGHLIGHT_CLASSES = ["ring-2", "ring-accent-dark", "ring-offset-2", "rounded-2xl", "transition-shadow"];

function jumpToDomId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add(...HIGHLIGHT_CLASSES);
  window.setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1400);
}

const MAX_WALK_DEPTH = 6;
const MIN_TEXT_LENGTH = 3;

export function ContentEditor({ initialContent }: { initialContent: SiteContent }) {
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<SaveContentState>(initialSaveState);

  const textIndex = useMemo(() => buildTextIndex(draft), [draft]);

  function handleFieldChange(section: SectionId, field: string, value: unknown) {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown>), [field]: value },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveSiteContentAction(draft);
      setState(result);
    });
  }

  // Az élő előnézetben soha nem szabad ténylegesen navigálni (sem link-re
  // kattintva, sem egy form beküldésével — pl. a Hero keresője router.push-
  // sal navigálna) — ez kilépne a szerkesztőből, elveszítve a mentetlen
  // draft-ot. Ehelyett a kattintott szöveghez tartozó form-mezőre ugrunk,
  // vagy ha nincs pontos egyezés, a szekció tetejére.
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;

    const navTrigger = target.closest("a, button[type='submit'], input[type='submit']");
    if (navTrigger) {
      e.preventDefault();
    }

    // 1) Pontos szöveg-egyezés — ez a legpontosabb, ezért ez nyer akkor is,
    // ha a kattintott elem egy szélesebb data-field-anchor-ral rendelkező
    // dobozon (pl. egy kép-kártyán) belül van, de a kattintás egy konkrét,
    // külön mezőhöz tartozó szövegen történt (pl. a kártya neve a fotója
    // felett/mellett).
    let el: HTMLElement | null = target;
    for (let depth = 0; el && depth < MAX_WALK_DEPTH; depth++, el = el.parentElement) {
      const text = el.textContent?.trim();
      if (text && text.length >= MIN_TEXT_LENGTH) {
        const anchor = textIndex.get(text);
        if (anchor) {
          jumpToDomId(domId(anchor));
          return;
        }
      }
    }

    // 2) Explicit anchor — képeknél és a szavankénti reveal-animációval
    // renderelt Hero-főcímnél, ahol nincs egyetlen elem sem, aminek a
    // szövege pontosan egyezne egy mezővel.
    const explicitEl = target.closest("[data-field-anchor]");
    const explicitAnchor = explicitEl?.getAttribute("data-field-anchor");
    if (explicitAnchor) {
      jumpToDomId(domId(explicitAnchor));
      return;
    }

    // 3) Szekció-szintű esés vissza — mindig működik.
    const sectionEl = target.closest("[data-preview-section]");
    const sectionId = sectionEl?.getAttribute("data-preview-section");
    if (sectionId) {
      jumpToDomId(`admin-section-${sectionId}`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Oldal-szerkesztő</h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            Szerkeszd a nyitóoldal szövegeit és képeit — kattints bármire jobbra, hogy a hozzá tartozó mezőre ugorj, vagy
            írj a bal oldali mezőkbe és nézd élőben a változást. Mentéskor azonnal élesbe kerül.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="shrink-0 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p className={`mt-2 text-sm ${state.status === "error" ? "text-red-700" : "text-accent-dark"}`}>{state.message}</p>
      )}

      <div className="mt-4">
        <SectionJumpNav />
      </div>

      <div className="mt-2 grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
        <div className="min-w-0">
          <SchemaForm draft={draft} onFieldChange={handleFieldChange} />
        </div>
        <div className="shadow-sheet min-w-0 rounded-3xl bg-paper-alt p-3 lg:sticky lg:top-8">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Élő előnézet</p>
            <p className="text-[11px] text-ink-soft">Kattints egy elemre a szerkesztéshez</p>
          </div>
          <div
            className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl bg-white"
            onClickCapture={handlePreviewClick}
          >
            <DevicePreview>
              <MarketingPreview content={draft} />
            </DevicePreview>
          </div>
        </div>
      </div>
    </div>
  );
}

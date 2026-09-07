"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  SchemaForm,
  SectionJumpNav,
  MARKETING_SECTION_ORDER,
  LEGAL_SECTION_ORDER,
  ASZF_SECTION_ORDER,
  ADATKEZELES_SECTION_ORDER,
  IMPRESSZUM_SECTION_ORDER,
} from "@/components/admin/SchemaForm";
import { MarketingPreview, Section } from "@/components/admin/MarketingPreview";
import { DevicePreview } from "@/components/admin/DevicePreview";
import { AszfContent } from "@/components/legal/AszfContent";
import { AdatkezelesContent } from "@/components/legal/AdatkezelesContent";
import { ImpresszumContent } from "@/components/legal/ImpresszumContent";
import { buildTextIndex } from "@/lib/content/reverseIndex";
import { domId } from "@/lib/content/anchors";
import { saveSiteContentAction, type SaveContentState } from "./actions";
import type { SectionId, SiteContent } from "@/lib/content/types";

const initialSaveState: SaveContentState = { status: "idle" };

type PageId = "marketing" | "legal" | "aszf" | "adatkezeles" | "impresszum";

const PAGES: { id: PageId; label: string }[] = [
  { id: "marketing", label: "Főoldal" },
  { id: "legal", label: "Cégadatok" },
  { id: "aszf", label: "ÁSZF" },
  { id: "adatkezeles", label: "Adatkezelés" },
  { id: "impresszum", label: "Impresszum" },
];

const SECTIONS_BY_PAGE: Record<PageId, SectionId[]> = {
  marketing: MARKETING_SECTION_ORDER,
  legal: LEGAL_SECTION_ORDER,
  aszf: ASZF_SECTION_ORDER,
  adatkezeles: ADATKEZELES_SECTION_ORDER,
  impresszum: IMPRESSZUM_SECTION_ORDER,
};

// Melyik lapon (tab) van a form-mezője egy adott szekciónak — ez kell, mert
// pl. a "legal" (Cégadatok) mezői az ÁSZF/Adatkezelés/Impresszum ELŐNÉZETÉBEN
// is megjelennek (a cégnév stb. mindhárom jogi oldalon kiírva), de a FORM
// csak a "Cégadatok" fülön rendereli őket. Kattintás-feloldónál emiatt előbb
// lapot kell váltani, különben a jumpToDomId semmit nem talál (az elem
// egyszerűen nincs a DOM-ban, amíg más fülön állunk).
const PAGE_BY_SECTION: Partial<Record<SectionId, PageId>> = Object.fromEntries(
  (Object.entries(SECTIONS_BY_PAGE) as [PageId, SectionId[]][]).flatMap(([page, sections]) =>
    sections.map((section) => [section, page])
  )
);

function sectionOfAnchor(anchorKey: string): SectionId {
  return anchorKey.slice(0, anchorKey.indexOf(".")) as SectionId;
}

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
  const [activePage, setActivePage] = useState<PageId>("marketing");
  const activeSections = SECTIONS_BY_PAGE[activePage];
  // Lapváltás után ide ugrunk, amint az új lap form-ja megrenderelt — ref,
  // nem state, mert az effektben csak beolvassuk/töröljük, nem indítunk vele
  // újabb renderelést.
  const pendingDomIdRef = useRef<string | null>(null);

  const textIndex = useMemo(() => buildTextIndex(draft), [draft]);

  useEffect(() => {
    const id = pendingDomIdRef.current;
    if (!id) return;
    pendingDomIdRef.current = null;
    jumpToDomId(id);
  }, [activePage]);

  // Egy mező (vagy szekció) DOM id-jára ugrik — ha a hozzá tartozó szekció
  // egy másik lapon van, előbb átvált rá, és a lapváltás utáni renderre
  // bízza a tényleges ugrást (lásd a fenti useEffect-et).
  function goToDomId(id: string, section: SectionId) {
    const targetPage = PAGE_BY_SECTION[section];
    if (targetPage && targetPage !== activePage) {
      pendingDomIdRef.current = id;
      setActivePage(targetPage);
    } else {
      jumpToDomId(id);
    }
  }

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
          goToDomId(domId(anchor), sectionOfAnchor(anchor));
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
      goToDomId(domId(explicitAnchor), sectionOfAnchor(explicitAnchor));
      return;
    }

    // 3) Szekció-szintű esés vissza — mindig működik.
    const sectionEl = target.closest("[data-preview-section]");
    const sectionId = sectionEl?.getAttribute("data-preview-section") as SectionId | null;
    if (sectionId) {
      goToDomId(`admin-section-${sectionId}`, sectionId);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Oldal-szerkesztő</h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            Válaszd ki lent, melyik oldalt szerkeszted. Kattints bármire jobbra, hogy a hozzá tartozó mezőre ugorj, vagy
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

      <div className="mt-4 flex flex-wrap gap-1.5 border-b border-line pb-4">
        {PAGES.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => setActivePage(page.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activePage === page.id ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <SectionJumpNav sections={activeSections} />
      </div>

      <div className="mt-2 grid gap-6 lg:grid-cols-[420px_1fr] lg:items-start">
        <div className="min-w-0">
          <SchemaForm draft={draft} onFieldChange={handleFieldChange} sections={activeSections} />
        </div>
        <div className="shadow-sheet min-w-0 rounded-3xl bg-paper-alt p-3 lg:sticky lg:top-8">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Élő előnézet</p>
            <p className="text-[11px] text-ink-soft">Kattints egy elemre a szerkesztéshez</p>
          </div>
          {activePage === "legal" && (
            <p className="mb-2 px-1 text-[11px] text-ink-soft">
              Ez az adat mindhárom jogi oldalon (ÁSZF, Adatkezelés, Impresszum) megjelenik, itt az Impresszumon
              látszik, mert az mutatja mind az 5 mezőt.
            </p>
          )}
          <div
            className="max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl bg-white"
            onClickCapture={handlePreviewClick}
          >
            <DevicePreview>
              {activePage === "marketing" && <MarketingPreview content={draft} />}
              {activePage === "legal" && (
                <Section id="legal">
                  <ImpresszumContent legal={draft.legal} impresszum={draft.impresszum} />
                </Section>
              )}
              {activePage === "aszf" && (
                <Section id="aszf">
                  <AszfContent legal={draft.legal} aszf={draft.aszf} />
                </Section>
              )}
              {activePage === "adatkezeles" && (
                <Section id="adatkezeles">
                  <AdatkezelesContent legal={draft.legal} adatkezeles={draft.adatkezeles} />
                </Section>
              )}
              {activePage === "impresszum" && (
                <Section id="impresszum">
                  <ImpresszumContent legal={draft.legal} impresszum={draft.impresszum} />
                </Section>
              )}
            </DevicePreview>
          </div>
        </div>
      </div>
    </div>
  );
}

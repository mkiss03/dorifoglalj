"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  MapPin,
  Search,
  X,
  LayoutGrid,
  Wallet,
  Clock3,
  RefreshCcw,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Container } from "./ui/Container";
import { RevealText } from "./ui/RevealText";
import { MiniCalendar } from "./ui/MiniCalendar";
import { HungaryMap } from "./HungaryMap";
import { ProviderCard } from "./search/ProviderCard";
import { cities } from "@/lib/cities";
import { categoryIconBySlug } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import {
  PROVIDER_TAGS,
  TAG_LABELS,
  type CountyCityCount,
  type ProviderTag,
  type SearchProvider,
} from "@/lib/supabase/types";
import type { SiteContent } from "@/lib/content/types";
import type { ResolvedCategory } from "@/lib/content/resolveCategories";

const STAT_ICONS: Record<string, LucideIcon> = {
  categories: LayoutGrid,
  free: Wallet,
  hours: Clock3,
  sync: RefreshCcw,
};

function toDateParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

function CategoryField({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: ResolvedCategory[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left"
      >
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Kategória
          </span>
          <span className="block text-[15px] font-medium text-ink">{value}</span>
        </span>
        <ChevronDown className={clsx("h-4 w-4 shrink-0 text-ink-soft transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="shadow-card absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl bg-white p-1.5"
          >
            {categories.map((c) => {
              const Icon = categoryIconBySlug[c.slug];
              return (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => {
                    onChange(c.name);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-panel"
                >
                  <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                  {c.name}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CityField({
  value,
  onChange,
  highlighted,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Rövid ideig igaz, miután a térképről (nem gépeléssel) érkezett a
   * változás — így akkor is nyilvánvaló a térkép↔mező szinkron, ha a
   * mező épp nem esik a látótérbe (mobilon a térkép lejjebb van). */
  highlighted?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  // Kontrollált mező (nincs saját lokális `query`) — enélkül egy külső
  // állapotváltozás (pl. a térkép kattintása) nem tudna látszani a
  // mezőben, csak a submitnál elküldött értékben.
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    const list = q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
    return list.slice(0, 6);
  }, [value]);

  return (
    <div ref={ref} className="relative flex-1">
      <div
        className={clsx(
          "rounded-xl px-5 py-3 transition-shadow duration-300",
          highlighted && "ring-2 ring-accent-dark ring-inset"
        )}
      >
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Település
        </label>
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Válassz települést"
          className="block w-full bg-transparent text-[15px] font-medium text-ink outline-none placeholder:text-ink-soft/50"
        />
      </div>
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="shadow-card absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl bg-white p-1.5"
          >
            {filtered.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-panel"
              >
                <MapPin className="h-3.5 w-3.5 text-ink" strokeWidth={1.75} />
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DateField({ onChange }: { onChange: (v: string) => void }) {
  const [mode, setMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  // A választott mód/dátum ISO ("YYYY-MM-DD") stringgé alakítva mindig
  // felmegy a szülőbe — korábban ez a mező pusztán vizuális volt, a
  // submit sosem olvasta ki.
  useEffect(() => {
    if (mode === "today") {
      onChange(toDateParam(new Date()));
    } else if (mode === "tomorrow") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      onChange(toDateParam(d));
    } else if (mode === "custom" && customDate) {
      onChange(toDateParam(customDate));
    }
  }, [mode, customDate, onChange]);

  const customLabel = customDate
    ? customDate.toLocaleDateString("hu-HU", { month: "short", day: "numeric" })
    : "Dátum…";

  return (
    <div ref={ref} className="relative flex-1">
      <div className="px-5 py-3">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Mikor
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(["today", "tomorrow"] as const).map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m);
                setOpen(false);
              }}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                mode === m
                  ? "border-accent-dark bg-accent-dark text-paper"
                  : "border-line text-ink-soft hover:bg-paper-alt"
              )}
            >
              {m === "today" ? "Ma" : "Holnap"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              mode === "custom"
                ? "border-accent-dark bg-accent-dark text-paper"
                : "border-line text-ink-soft hover:bg-paper-alt"
            )}
          >
            {mode === "custom" ? customLabel : "Dátum…"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-20 mt-2"
          >
            <MiniCalendar
              selected={customDate}
              onSelect={(d) => {
                setCustomDate(d);
                setMode("custom");
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RESULTS_VISIBLE_CAP = 6;

function ResultsPanel({
  searching,
  error,
  results,
  viewAllHref,
  onClose,
}: {
  searching: boolean;
  error: boolean;
  results: SearchProvider[];
  viewAllHref: string;
  onClose: () => void;
}) {
  const visibleResults = results.slice(0, RESULTS_VISIBLE_CAP);
  const hiddenCount = results.length - visibleResults.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="shadow-card absolute left-0 right-0 top-full z-20 mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-white p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {searching ? "Keresés…" : error ? "Hiba történt" : `${results.length} találat`}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Találatok bezárása"
          className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-paper-alt hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {searching ? (
        <p className="py-6 text-center text-sm text-ink-soft">Keresés folyamatban…</p>
      ) : error ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          Hiba történt a keresés során, próbáld újra.
        </p>
      ) : results.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          Nincs találat a megadott feltételekkel, próbálj tágabb keresést.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleResults.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <Link
              href={viewAllHref}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-paper-alt py-3 text-sm font-semibold text-accent-dark transition-colors hover:bg-panel"
            >
              Mind a {results.length} találat megtekintése →
            </Link>
          )}
        </>
      )}
    </motion.div>
  );
}

export function Hero({
  content,
  categories,
  countyCities,
}: {
  content: SiteContent["hero"];
  categories: ResolvedCategory[];
  countyCities: CountyCityCount[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[1]?.name ?? categories[0]?.name ?? "");
  const [city, setCity] = useState("");
  const [cityJustPicked, setCityJustPicked] = useState(false);
  const [date, setDate] = useState(() => toDateParam(new Date()));
  const [tags, setTags] = useState<ProviderTag[]>([]);

  const [results, setResults] = useState<SearchProvider[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const searchAreaRef = useClickOutside(() => setResultsOpen(false));
  const searchInputRef = useRef<HTMLInputElement>(null);

  // A hero-beli "Időpontot keresek" gomb nem navigál sehova — a kereső már
  // ott van a szekcióban, csak legörgetünk hozzá és rá is fókuszálunk.
  function focusSearch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => searchInputRef.current?.focus(), 350);
  }

  // Escape zárja a találati panelt — ugyanaz a minta, mint a HungaryMap
  // rögzített tooltipjénél.
  useEffect(() => {
    if (!resultsOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setResultsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [resultsOpen]);

  function toggleTag(tag: ProviderTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  // A térképről (nem gépeléssel) érkező városválasztás — ez tölti a mezőt
  // ÉS villantja meg röviden, hogy a szinkron nyilvánvaló legyen.
  function handleMapSelectCity(name: string) {
    setCity(name);
    setCityJustPicked(true);
    window.setTimeout(() => setCityJustPicked(false), 1200);
  }

  // A /kereses-hez tartozó paraméterek — a "Mind a N találat" linkhez kell,
  // a teljes, dedikált oldalra mutatva ugyanazokkal a szűrőkkel.
  function buildSearchParams() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const categorySlug = categories.find((c) => c.name === category)?.slug;
    if (categorySlug) params.set("category", categorySlug);
    if (city.trim()) params.set("city", city.trim());
    if (date) params.set("date", date);
    for (const tag of tags) params.append("tags", tag);
    return params;
  }

  // Nem navigálunk el a /kereses oldalra — a találatok itt, a főoldalon,
  // egy lebegő panelben jelennek meg (kliens-oldali RPC-hívással), hogy a
  // lejjebb lévő szekciók ne csússzanak el. A /kereses oldal a "Mind a N
  // találat" linken keresztül továbbra is elérhető, megosztható marad.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResultsOpen(true);
    setSearching(true);
    setSearchError(false);
    const categorySlug = categories.find((c) => c.name === category)?.slug ?? null;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("search_providers", {
      p_category: categorySlug,
      p_city: city.trim() || null,
      p_date: date || null,
      p_tags: tags.length > 0 ? tags : null,
      p_query: query.trim() || null,
    });
    setSearching(false);
    if (error) {
      setSearchError(true);
      return;
    }
    setResults((data ?? []) as SearchProvider[]);
  }

  const segmentByid = Object.fromEntries(content.heading_segments.map((s) => [s.id, s.text]));
  const searchParamsString = buildSearchParams().toString();
  const viewAllHref = `/kereses${searchParamsString ? `?${searchParamsString}` : ""}`;

  return (
    <section
      className="scroll-mt-16 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,_var(--accent-light)_0%,_var(--paper-alt)_55%)] py-8 lg:scroll-mt-20 lg:py-16"
    >
      <Container>
        <div className="grid gap-10 pb-8 lg:grid-cols-2 lg:items-center lg:pb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">{content.eyebrow}</p>

            <RevealText
              as="h1"
              className="mt-4 text-balance text-[1.75rem] leading-[1.08] tracking-tight font-display text-ink sm:text-[clamp(2.25rem,4vw,3.75rem)]"
              fieldAnchor="hero.heading_segments"
              segments={[
                { text: segmentByid.lead ?? "" },
                { text: segmentByid.accent ?? "", className: "text-accent-dark" },
                { text: segmentByid.tail ?? "" },
              ]}
            />

            <p className="mt-3 text-base leading-relaxed text-ink lg:mt-5 lg:text-lg">{content.paragraph}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-8">
              <a
                href="#kereses"
                onClick={focusSearch}
                className="flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 sm:flex-1"
              >
                <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
                {content.guest_cta_label}
              </a>
              <Link
                href="/regisztracio"
                className="flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-ink/15 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink shadow-card transition-colors duration-200 hover:bg-paper-alt sm:flex-1"
              >
                {content.provider_cta_label}
                <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2} />
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div aria-hidden className="absolute -inset-10 -z-10 rounded-full bg-accent-light blur-2xl" />
            <div
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden"
              style={{
                WebkitMaskImage: "radial-gradient(58% 58% at 50% 42%, black 60%, transparent 100%)",
                maskImage: "radial-gradient(58% 58% at 50% 42%, black 60%, transparent 100%)",
              }}
              data-field-anchor="hero.collage_image"
            >
              <Image
                src={content.collage_image}
                alt={content.collage_alt}
                fill
                sizes="(min-width: 1024px) 40vw, 0px"
                className="photo-grade object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 50% 42%, transparent 55%, var(--accent-light) 100%)",
                  mixBlendMode: "multiply",
                  opacity: 0.35,
                }}
              />
            </div>
          </div>
        </div>

        <div className="shadow-sheet relative rounded-3xl bg-white p-5 lg:p-12">
          <div id="kereses" className="relative z-10 scroll-mt-24">
            {content.search_prompt && (
              <p className="mb-4 font-display text-xl text-ink sm:text-2xl">{content.search_prompt}</p>
            )}
            <div ref={searchAreaRef} className="relative">
              <form onSubmit={handleSubmit} className="shadow-card rounded-2xl bg-white">
                <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                  <Search className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={2} />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Mit keresel? pl. mandula köröm, balayage, gél lakk…"
                    className="w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-soft/50"
                  />
                </div>

                <div className="flex flex-col divide-y divide-line sm:flex-row sm:divide-x sm:divide-y-0">
                  <CategoryField value={category} onChange={setCategory} categories={categories} />
                  <CityField value={city} onChange={setCity} highlighted={cityJustPicked} />
                  <DateField onChange={setDate} />
                  <div className="p-2 sm:flex sm:items-center">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 sm:w-auto"
                    >
                      <Search className="h-4 w-4" strokeWidth={2} />
                      {content.search_button_label}
                    </button>
                  </div>
                </div>
              </form>

              <AnimatePresence>
                {resultsOpen && (
                  <ResultsPanel
                    searching={searching}
                    error={searchError}
                    results={results}
                    viewAllHref={viewAllHref}
                    onClose={() => setResultsOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5 lg:mt-4">
              {categories.map((c) => {
                const active = category === c.name;
                const Icon = categoryIconBySlug[c.slug];
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={clsx(
                      "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                      active ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Alkalom</p>
              <div className="flex flex-wrap gap-2">
                {PROVIDER_TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      aria-pressed={active}
                      className={clsx(
                        "flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200",
                        active ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel"
                      )}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <HungaryMap
                bare
                heading="Vagy válassz megyét a térképen"
                selectedCity={city}
                onSelectCity={handleMapSelectCity}
                countyCities={countyCities}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
            {content.stats.map((s) => {
              const Icon = STAT_ICONS[s.id] ?? LayoutGrid;
              return (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                  <p className="font-display text-2xl text-ink">{s.value}</p>
                  <p className="text-xs leading-snug text-ink-soft">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

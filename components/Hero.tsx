"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search, LayoutGrid, Wallet, Clock3, RefreshCcw, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Container } from "./ui/Container";
import { RevealText } from "./ui/RevealText";
import { MiniCalendar } from "./ui/MiniCalendar";
import { HungaryMap } from "./HungaryMap";
import { cities } from "@/lib/cities";
import { categoryIconBySlug } from "@/lib/categories";
import { PROVIDER_TAGS, TAG_LABELS, type ProviderTag } from "@/lib/supabase/types";
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

function CityField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
      <div className="px-5 py-3">
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

export function Hero({
  content,
  categories,
}: {
  content: SiteContent["hero"];
  categories: ResolvedCategory[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState(categories[1]?.name ?? categories[0]?.name ?? "");
  const [city, setCity] = useState("");
  const [date, setDate] = useState(() => toDateParam(new Date()));
  const [tags, setTags] = useState<ProviderTag[]>([]);

  function toggleTag(tag: ProviderTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    const categorySlug = categories.find((c) => c.name === category)?.slug;
    if (categorySlug) params.set("category", categorySlug);
    if (city.trim()) params.set("city", city.trim());
    if (date) params.set("date", date);
    for (const tag of tags) params.append("tags", tag);
    router.push(`/kereses${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const segmentByid = Object.fromEntries(content.heading_segments.map((s) => [s.id, s.text]));

  return (
    <section
      id="kereses"
      className="scroll-mt-16 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,_var(--accent-light)_0%,_var(--paper-alt)_55%)] py-8 lg:scroll-mt-20 lg:py-16"
    >
      <Container>
        <div className="shadow-sheet relative rounded-3xl bg-white p-5 lg:p-12">
          <div className="max-w-2xl">
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
          </div>

          <div className="relative z-10 mt-6 lg:mt-10">
            <form onSubmit={handleSubmit} className="shadow-card rounded-2xl bg-white">
              <div className="flex flex-col divide-y divide-line sm:flex-row sm:divide-x sm:divide-y-0">
                <CategoryField value={category} onChange={setCategory} categories={categories} />
                <CityField value={city} onChange={setCity} />
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

            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-4">
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
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                        active
                          ? "border-accent-dark bg-accent-dark text-paper"
                          : "border-line bg-paper-alt text-ink-soft hover:bg-panel"
                      )}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Vagy válassz megyét a térképen
              </p>
              <div className="mt-3">
                <HungaryMap bare onSelectCity={(name) => setCity(name)} />
              </div>
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

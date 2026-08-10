"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { PROVIDER_TAGS, TAG_LABELS, type ProviderTag } from "@/lib/supabase/types";

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

// Ugyanaz az animált, "felugró" dropdown minta, mint a nyitóoldali Hero
// keresőjében — hogy a /kereses ne hasson egy teljesen más keresőnek.
function CategoryField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const selected = categories.find((c) => c.slug === value);

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl bg-paper-alt px-5 py-3 text-left"
      >
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Kategória</span>
          <span className="block text-[15px] font-medium text-ink">{selected?.name ?? "Összes kategória"}</span>
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
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-panel"
            >
              Összes kategória
            </button>
            {categories.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => {
                  onChange(c.slug);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-panel"
              >
                <c.icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                {c.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CityField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
    return list.slice(0, 6);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1">
      <div className="rounded-2xl bg-paper-alt px-5 py-3">
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Település</label>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Összes település"
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
                  setQuery(c);
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

export function SearchBar({
  initialQuery,
  initialCategory,
  initialCity,
  initialDate,
  initialTags,
}: {
  initialQuery: string;
  initialCategory: string;
  initialCity: string;
  initialDate: string;
  initialTags: ProviderTag[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [date, setDate] = useState(initialDate);
  const [tags, setTags] = useState<ProviderTag[]>(initialTags);

  function toggleTag(tag: ProviderTag) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (city.trim()) params.set("city", city.trim());
    if (date) params.set("date", date);
    for (const tag of tags) params.append("tags", tag);
    router.push(`/kereses${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} className="shadow-sheet rounded-3xl bg-white p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-paper-alt px-5 py-3">
        <Search className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Mit keresel? pl. mandula köröm, balayage, gél lakk…"
          className="w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-soft/50"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CategoryField value={category} onChange={setCategory} />
        <CityField value={city} onChange={setCity} />
        <div className="flex-1 rounded-2xl bg-paper-alt px-5 py-3">
          <label htmlFor="date" className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Dátum
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full bg-transparent text-[15px] font-medium text-ink outline-none [color-scheme:light]"
          />
        </div>
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

      <button
        type="submit"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 sm:w-auto"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        Keresés
      </button>
    </form>
  );
}

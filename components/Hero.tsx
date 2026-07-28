"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Search, LayoutGrid, Wallet, Clock3, RefreshCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { Container } from "./ui/Container";
import { RevealText } from "./ui/RevealText";
import { MiniCalendar } from "./ui/MiniCalendar";
import { Collage } from "./ui/Collage";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import collageImg from "@/public/images/hair-styling.jpg";

const stats = [
  { icon: LayoutGrid, value: "10", label: "fő kategória, 50+ szolgáltatástípus" },
  { icon: Wallet, value: "0 Ft", label: "regisztrációs és foglalási díj" },
  { icon: Clock3, value: "0–24", label: "non-stop online időpontfoglalás" },
  { icon: RefreshCcw, value: "1 naptár", label: "web és Facebook szinkronban" },
];

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

function CategoryField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
            {categories.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => {
                  onChange(c.name);
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
      <div className="px-5 py-3">
        <label className="block text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          Település
        </label>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
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

function DateField() {
  const [mode, setMode] = useState<"today" | "tomorrow" | "custom">("today");
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

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

export function Hero() {
  const [category, setCategory] = useState(categories[1].name);
  const [city, setCity] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    document.getElementById("kategoriak")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="kereses"
      className="scroll-mt-16 bg-[radial-gradient(ellipse_120%_100%_at_50%_0%,_var(--accent-light)_0%,_var(--paper-alt)_55%)] py-8 lg:scroll-mt-20 lg:py-16"
    >
      <Container>
        <div className="shadow-sheet relative rounded-3xl bg-white p-5 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">
                Foglalás 0–24 órában, online
              </p>

              <RevealText
                as="h1"
                className="mt-4 text-balance text-[1.75rem] leading-[1.08] tracking-tight font-display text-ink sm:text-[clamp(2.25rem,4vw,3.75rem)]"
                segments={[
                  { text: "Fodrász, körmös, kozmetikus — időpont " },
                  { text: "30 másodperc alatt,", className: "text-accent-dark" },
                  { text: " telefon nélkül." },
                ]}
              />

              <p className="mt-3 text-base leading-relaxed text-ink lg:mt-5 lg:text-lg">
                Az IttFoglalj.hu összeköti a vendégeket és a szépségipari
                szolgáltatókat — böngéssz kategória vagy település szerint,
                nézd meg a valós szabad időpontokat, és foglalj regisztráció
                nélkül.
              </p>
            </div>

            <div className="relative hidden lg:block">
              <Collage image={collageImg} alt="Fodrász munka közben, meleg fényben" />
            </div>
          </div>

          <div className="relative z-10 mt-6 lg:mt-10">
            <form
              onSubmit={handleSubmit}
              className="shadow-card rounded-2xl bg-white"
            >
              <div className="flex flex-col divide-y divide-line sm:flex-row sm:divide-x sm:divide-y-0">
                <CategoryField value={category} onChange={setCategory} />
                <CityField value={city} onChange={setCity} />
                <DateField />
                <div className="p-2 sm:flex sm:items-center">
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 sm:w-auto"
                  >
                    <Search className="h-4 w-4" strokeWidth={2} />
                    Keresés
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-4">
              {categories.map((c) => {
                const active = category === c.name;
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
                    <c.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <s.icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
                <p className="font-display text-2xl text-ink">{s.value}</p>
                <p className="text-xs leading-snug text-ink-soft">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

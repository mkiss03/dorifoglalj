"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { HUNGARY_REGIONS, HUNGARY_VIEWBOX } from "@/lib/hungaryMap";

const [VIEW_W, VIEW_H] = HUNGARY_VIEWBOX.split(" ").slice(2).map(Number);

function regionKindLabel(id: string) {
  return id === "HU-BU" ? "Főváros" : "Megye";
}

export function HungaryMap({
  onSelectCity,
  bare = false,
}: {
  /** Ha meg van adva, a tooltip város-sorai navigálás helyett ezt hívják
   * (a Hero beágyazott térképe így csak kitölti a Település mezőt, nem
   * ugrik el azonnal) — enélkül (BrowseByCity) a jelenlegi Link-es,
   * azonnal navigáló viselkedés marad. */
  onSelectCity?: (city: string) => void;
  /** Ha igaz, a saját fehér kártya-keret (shadow-sheet/bg-white/padding/
   * scroll-reveal animáció) elmarad — a Hero saját kártyájába ágyazva
   * használjuk, nem akarunk kártyát a kártyában. */
  bare?: boolean;
} = {}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const displayedId = pinnedId ?? hoverId;
  const displayed = HUNGARY_REGIONS.find((r) => r.id === displayedId) ?? null;

  // Kattintás a térképen kívülre / Escape zárja a rögzített tooltipet —
  // ez teszi lehetővé, hogy érintőképernyőn is használható legyen (nincs
  // hover), és hogy a tooltip ne ragadjon nyitva véletlenül.
  useEffect(() => {
    if (!pinnedId) return;
    function handlePointerDown(e: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPinnedId(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPinnedId(null);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pinnedId]);

  function togglePin(id: string) {
    setPinnedId((current) => (current === id ? null : id));
    setHoverId(id);
  }

  const anchorXPct = displayed ? (displayed.anchorX / VIEW_W) * 100 : 0;
  const anchorYPct = displayed ? (displayed.anchorY / VIEW_H) * 100 : 0;
  const alignX = anchorXPct < 30 ? "left" : anchorXPct > 70 ? "right" : "center";
  const alignY = anchorYPct < 25 ? "below" : "above";

  return (
    <motion.div
      initial={bare ? false : { opacity: 0, y: 16 }}
      whileInView={bare ? undefined : { opacity: 1, y: 0 }}
      viewport={bare ? undefined : { once: true, margin: "-60px" }}
      transition={bare ? undefined : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(!bare && "shadow-sheet rounded-3xl bg-white p-4 sm:p-6")}
    >
      <div className="overflow-x-auto">
        <div ref={wrapperRef} className="relative mx-auto w-full min-w-[420px] max-w-2xl">
          <svg
            viewBox={HUNGARY_VIEWBOX}
            className="block w-full"
            role="img"
            aria-label="Magyarország térkép, megyénként böngészhető"
          >
            {HUNGARY_REGIONS.map((region) => {
              const isDisplayed = region.id === displayedId;
              return (
                <g key={region.id}>
                  <path
                    d={region.d}
                    tabIndex={0}
                    role="button"
                    aria-label={`${region.title}: ${region.cities.map((c) => c.name).join(", ")}`}
                    aria-expanded={isDisplayed}
                    onMouseEnter={() => setHoverId(region.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(region.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={() => togglePin(region.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        togglePin(region.id);
                      }
                    }}
                    stroke="#fff"
                    strokeWidth={isDisplayed ? 2 : 1.4}
                    strokeLinejoin="round"
                    className={clsx(
                      "cursor-pointer outline-none transition-[fill,stroke-width] duration-200",
                      isDisplayed ? "fill-accent-light" : "fill-paper-alt hover:fill-accent-light"
                    )}
                  />
                  {region.cities.map((city) =>
                    city.enclaveD ? (
                      <path
                        key={city.name}
                        d={city.enclaveD}
                        pointerEvents="none"
                        className={clsx("transition-colors duration-200", isDisplayed ? "fill-accent-dark" : "fill-ink/25")}
                      />
                    ) : (
                      <circle
                        key={city.name}
                        cx={city.markerX}
                        cy={city.markerY}
                        r={3}
                        pointerEvents="none"
                        className={clsx("transition-colors duration-200", isDisplayed ? "fill-accent-dark" : "fill-ink/25")}
                      />
                    )
                  )}
                </g>
              );
            })}
          </svg>

          <AnimatePresence>
            {displayed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  left: `${anchorXPct}%`,
                  top: `${anchorYPct}%`,
                  transform: `translate(${alignX === "left" ? "0%" : alignX === "right" ? "-100%" : "-50%"}, ${
                    alignY === "above" ? "calc(-100% - 10px)" : "10px"
                  })`,
                }}
                className="shadow-card pointer-events-none absolute z-10 min-w-[9.5rem] rounded-2xl border border-line bg-white px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  {regionKindLabel(displayed.id)}
                  {displayed.id !== "HU-BU" && <> · {displayed.title}</>}
                </p>
                <ul className="mt-1">
                  {displayed.cities.map((city) => {
                    const linkClassName =
                      "pointer-events-auto flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-sm font-semibold text-ink transition-colors hover:bg-accent-light hover:text-accent-dark";
                    const inner = (
                      <>
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-dark" strokeWidth={2} />
                        {city.name}
                      </>
                    );
                    return (
                      <li key={city.name}>
                        {onSelectCity ? (
                          <button
                            type="button"
                            className={linkClassName}
                            onClick={() => {
                              onSelectCity(city.name);
                              setPinnedId(null);
                            }}
                          >
                            {inner}
                          </button>
                        ) : (
                          <Link href={`/kereses?city=${encodeURIComponent(city.name)}`} className={linkClassName}>
                            {inner}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-soft sm:hidden">Koppints egy megyére a városok megjelenítéséhez</p>
    </motion.div>
  );
}

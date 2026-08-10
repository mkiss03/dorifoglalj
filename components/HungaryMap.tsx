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
  heading,
  selectedCity,
  countyCities,
}: {
  /** Ha meg van adva, a tooltip város-sorai navigálás helyett ezt hívják
   * (a Hero beágyazott térképe így csak kitölti a Település mezőt, nem
   * ugrik el azonnal) — enélkül (BrowseByCity) a jelenlegi Link-es,
   * azonnal navigáló viselkedés marad. */
  onSelectCity?: (city: string) => void;
  /** Ha igaz, a saját kártya-keret visszafogottabb (paper-alt, nem fehér
   * shadow-sheet) és nincs scroll-reveal animáció — egy már látható,
   * fehér szülő-kártyába (Hero) ágyazva ez ad kontrasztot anélkül, hogy
   * "kártyát a kártyában" hatást keltene. */
  bare?: boolean;
  /** Opcionális cím a térkép fölött, a saját kártyáján belül — így cím+
   * térkép egy vizuális egységként jelenik meg. */
  heading?: string;
  /** A jelenleg kiválasztott város (pl. egy külső Település mező
   * állapota) — a hozzá tartozó megye TARTÓSAN kiemelve marad, nem csak
   * hoverre/pinre, hogy a térkép és a mező ténylegesen egy rendszernek
   * hasson. */
  selectedCity?: string;
  /** Megyénkénti, aktív szolgáltatókkal rendelkező városok (a
   * `list_active_cities_by_county` RPC-ből) — ha van rá adat, a tooltip
   * ebből építi a város-listát a statikus, csak megyeszékhelyeket
   * tartalmazó `region.cities` helyett. A térkép pöttyei/enclave-alakzatai
   * ettől függetlenül csak az ismert megyeszékhelyeket rajzolják ki, mert
   * más településhez nincs koordinátánk. */
  countyCities?: { county: string; city: string; provider_count: number }[];
} = {}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const displayedId = pinnedId ?? hoverId;
  const displayed = HUNGARY_REGIONS.find((r) => r.id === displayedId) ?? null;

  // A "kibontva" állapotot vissza kell állítani, ha másik megyére vált a
  // tooltip — render közben igazítjuk (React "adjusting state when a prop
  // changes" mintája), nem effektben, hogy ne legyen extra render/villanás.
  const [prevDisplayedId, setPrevDisplayedId] = useState(displayedId);
  if (displayedId !== prevDisplayedId) {
    setPrevDisplayedId(displayedId);
    setExpanded(false);
  }

  function citiesForRegion(regionId: string): string[] {
    const dynamic = (countyCities ?? [])
      .filter((c) => c.county === regionId)
      .sort((a, b) => b.provider_count - a.provider_count)
      .map((c) => c.city);
    if (dynamic.length > 0) return dynamic;
    // Nincs még aktív szolgáltató ebben a megyében — a statikus
    // megyeszékhely-listára esünk vissza, hogy a popup ne legyen üres.
    return HUNGARY_REGIONS.find((r) => r.id === regionId)?.cities.map((c) => c.name) ?? [];
  }

  const selectedRegionId = selectedCity
    ? ((countyCities ?? []).find((c) => c.city === selectedCity)?.county ??
      HUNGARY_REGIONS.find((r) => r.cities.some((c) => c.name === selectedCity))?.id ??
      null)
    : null;

  function handleRegionClick(region: (typeof HUNGARY_REGIONS)[number]) {
    // Egyvárosos megyénél nincs valódi választás — egy kattintás elég,
    // nem kell a tooltip-en belüli város-gombra is kattintani.
    const regionCities = citiesForRegion(region.id);
    if (onSelectCity && regionCities.length === 1) {
      onSelectCity(regionCities[0]);
      setPinnedId(null);
      return;
    }
    togglePin(region.id);
  }

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
      className={clsx(
        "rounded-3xl p-4 sm:p-6",
        bare ? "bg-paper-alt" : "shadow-sheet bg-white"
      )}
    >
      {heading && <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">{heading}</p>}
      <div className="overflow-x-auto">
        <div ref={wrapperRef} className="relative w-full min-w-[420px]">
          <svg
            viewBox={HUNGARY_VIEWBOX}
            className="block w-full"
            role="img"
            aria-label="Magyarország térkép, megyénként böngészhető"
          >
            {HUNGARY_REGIONS.map((region) => {
              const isDisplayed = region.id === displayedId;
              const isSelected = region.id === selectedRegionId;
              const isActive = isDisplayed || isSelected;
              return (
                <g key={region.id}>
                  <path
                    d={region.d}
                    tabIndex={0}
                    role="button"
                    aria-label={`${region.title}: ${citiesForRegion(region.id).join(", ")}`}
                    aria-expanded={isDisplayed}
                    aria-pressed={isSelected}
                    onMouseEnter={() => setHoverId(region.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(region.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={() => handleRegionClick(region)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRegionClick(region);
                      }
                    }}
                    stroke={bare ? "var(--paper-alt)" : "#fff"}
                    strokeWidth={isActive ? 2 : 1.4}
                    strokeLinejoin="round"
                    className={clsx(
                      "cursor-pointer outline-none transition-[fill,stroke-width] duration-200",
                      isActive ? "fill-accent-light" : bare ? "fill-white hover:fill-accent-light" : "fill-paper-alt hover:fill-accent-light"
                    )}
                  />
                  {region.cities.map((city) => {
                    const isCityActive = isDisplayed || city.name === selectedCity;
                    return city.enclaveD ? (
                      // Az enclave-alakzat egy tényleges lyuk a megye path-jában
                      // (ellentétes körüljárású subpath, nonzero fill-rule) — enélkül
                      // a kézmutató itt a semmit találná el, kiesne a hoverből, és a
                      // megye kiemelése villogna (ez okozta a "kiugró térkép" hibát).
                      <path
                        key={city.name}
                        d={city.enclaveD}
                        onMouseEnter={() => setHoverId(region.id)}
                        onMouseLeave={() => setHoverId(null)}
                        onClick={() => handleRegionClick(region)}
                        className={clsx(
                          "cursor-pointer transition-colors duration-200",
                          isCityActive ? "fill-accent-dark" : "fill-ink/25"
                        )}
                      />
                    ) : (
                      <circle
                        key={city.name}
                        cx={city.markerX}
                        cy={city.markerY}
                        r={3}
                        pointerEvents="none"
                        className={clsx("transition-colors duration-200", isCityActive ? "fill-accent-dark" : "fill-ink/25")}
                      />
                    );
                  })}
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
                  // Az x/y-t (nem sima transform stringet) a motion maga
                  // komponálja össze a scale-lel — egy kézzel írt
                  // style.transform-ot felülírna minden animációs frame-en,
                  // emiatt az above/below igazítás soha nem érvényesült
                  // ténylegesen, és a tooltip mindig jobbra-lefelé lógott ki
                  // a horgonypontból (ez okozta, hogy alsó megyéknél, pl.
                  // Baranyánál, a tooltip kilógott a térkép-kártya aljából).
                  x: alignX === "left" ? "0%" : alignX === "right" ? "-100%" : "-50%",
                  y: alignY === "above" ? "calc(-100% - 10px)" : "10px",
                }}
                className="shadow-card pointer-events-none absolute z-10 min-w-[9.5rem] rounded-2xl border border-line bg-white px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                  {regionKindLabel(displayed.id)}
                  {displayed.id !== "HU-BU" && <> · {displayed.title}</>}
                </p>
                {(() => {
                  const allCityNames = citiesForRegion(displayed.id);
                  const VISIBLE_CAP = 6;
                  const visibleCityNames = expanded ? allCityNames : allCityNames.slice(0, VISIBLE_CAP);
                  const hiddenCount = allCityNames.length - visibleCityNames.length;
                  const linkClassName =
                    "pointer-events-auto flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-sm font-semibold text-ink transition-colors hover:bg-accent-light hover:text-accent-dark";
                  return (
                    <ul className={clsx("mt-1", expanded && "max-h-56 overflow-y-auto")}>
                      {visibleCityNames.map((cityName) => {
                        const inner = (
                          <>
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-dark" strokeWidth={2} />
                            {cityName}
                          </>
                        );
                        return (
                          <li key={cityName}>
                            {onSelectCity ? (
                              <button
                                type="button"
                                className={linkClassName}
                                onClick={() => {
                                  onSelectCity(cityName);
                                  setPinnedId(null);
                                }}
                              >
                                {inner}
                              </button>
                            ) : (
                              <Link href={`/kereses?city=${encodeURIComponent(cityName)}`} className={linkClassName}>
                                {inner}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                      {hiddenCount > 0 && (
                        <li>
                          <button
                            type="button"
                            className="pointer-events-auto w-full rounded-lg px-1.5 py-1 text-left text-xs font-semibold text-accent-dark transition-colors hover:bg-accent-light"
                            onClick={() => {
                              // A kibontás megnöveli a tooltip magasságát, ami
                              // (az "above" igazításnál a saját magasságtól
                              // függő y-eltolás miatt) elmozdítja a dobozt —
                              // enélkül az egér a régi helyén egy másik megye
                              // fölött maradhatna, és a tooltip átugorna oda.
                              // A rögzítés (pin) ezt zárja ki.
                              setPinnedId(displayed.id);
                              setExpanded(true);
                            }}
                          >
                            +{hiddenCount} további település
                          </button>
                        </li>
                      )}
                    </ul>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-soft sm:hidden">Koppints egy megyére a városok megjelenítéséhez</p>
    </motion.div>
  );
}

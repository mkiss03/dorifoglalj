"use client";

import { useId } from "react";

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-soft";

const unitClass =
  "pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-ink-soft";

/** Ár + időtartam mezőpár a szolgáltatás-űrlapokhoz (felvétel és
 * szerkesztés egyaránt). A mértékegység korábban csak placeholderként
 * látszott, ami gépelés közben eltűnt — itt állandó címke van a mező
 * fölött ÉS rögzített mértékegység-utótag a mezőn belül, így mindig
 * látszik, melyik mezőbe mit kell írni. A `name` értékek (`price_huf`,
 * `duration_minutes`) változatlanok. */
export function PriceDurationFields({
  defaultPrice,
  defaultDuration,
}: {
  defaultPrice?: number;
  defaultDuration?: number;
}) {
  const priceId = useId();
  const durationId = useId();

  return (
    <>
      <div className="w-0 min-w-[8rem] flex-1">
        <label htmlFor={priceId} className={labelClass}>
          Ár (Ft)
        </label>
        <div className="relative">
          <input
            id={priceId}
            name="price_huf"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            required
            defaultValue={defaultPrice}
            className={`${inputClass} pr-9`}
            placeholder="pl. 8000"
          />
          <span className={unitClass} aria-hidden>
            Ft
          </span>
        </div>
      </div>

      <div className="w-0 min-w-[8rem] flex-1">
        <label htmlFor={durationId} className={labelClass}>
          Időtartam (perc)
        </label>
        <div className="relative">
          <input
            id={durationId}
            name="duration_minutes"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            required
            defaultValue={defaultDuration}
            className={`${inputClass} pr-11`}
            placeholder="pl. 60"
          />
          <span className={unitClass} aria-hidden>
            perc
          </span>
        </div>
      </div>
    </>
  );
}

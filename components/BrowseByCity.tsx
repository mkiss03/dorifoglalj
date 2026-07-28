import { ChevronDown, MapPin } from "lucide-react";
import { Container } from "./ui/Container";
import { featuredCities, cities } from "@/lib/cities";

export function BrowseByCity() {
  return (
    <section className="bg-paper-alt py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
          Bárhol Magyarországon
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Böngéssz település szerint
        </h2>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Legnépszerűbb
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {featuredCities.map((city) => (
              <a
                key={city}
                href="#kereses"
                className="shadow-card flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-lg text-ink transition-all duration-200 hover:-translate-y-0.5"
              >
                <MapPin className="h-4 w-4 text-ink" strokeWidth={1.75} />
                {city}
              </a>
            ))}
          </div>
        </div>

        <details className="group mt-8">
          <summary className="shadow-card flex cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 [&::-webkit-details-marker]:hidden">
            Összes település megjelenítése
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="mt-6 columns-2 gap-x-8 sm:columns-3 lg:columns-4">
            {cities.map((city) => (
              <a
                key={city}
                href="#kereses"
                className="block border-b border-line/70 py-2 text-[15px] text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                {city}
              </a>
            ))}
          </div>
        </details>
      </Container>
    </section>
  );
}

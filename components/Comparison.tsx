import { X, Check } from "lucide-react";
import { Container } from "./ui/Container";

const oldWay = [
  "Telefonálás nyitvatartási időben",
  "Várakozás egy visszahívásra",
  "Bizonytalan, gyakran elavult szabad időpontok",
  "Könnyen elfelejtett, le nem írt időpontok",
];

const newWay = [
  "Foglalás 0–24 órában, pár kattintással",
  "Azonnali visszaigazolás e-mailben",
  "Mindig aktuális, valós szabad időpontok",
  "Automatikus emlékeztető az időpont előtt",
];

export function Comparison() {
  return (
    <section className="scroll-mt-24 bg-paper-alt py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
          A különbség
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          A régi módszer helyett
        </h2>

        <div className="shadow-sheet mt-10 rounded-3xl bg-white p-4 lg:p-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-paper-alt p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                A megszokott út
              </p>
              <ul className="mt-5 space-y-4">
                {oldWay.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-ink-soft">
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 text-[15px] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
                Az IttFoglalj módszer
              </p>
              <ul className="mt-5 space-y-4">
                {newWay.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-dark text-paper">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

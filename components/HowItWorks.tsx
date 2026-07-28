import Image from "next/image";
import { Search, CalendarCheck, CheckCircle2, Star, Clock } from "lucide-react";
import { Container } from "./ui/Container";
import nailsImg from "@/public/images/nails-closeup.jpg";
import hairImg from "@/public/images/hair-color.jpg";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Keresd meg",
    text: "Válaszd ki a számodra megfelelő szolgáltatót kategória, település vagy szolgáltatás alapján.",
  },
  {
    n: "02",
    icon: CalendarCheck,
    title: "Válaszd ki",
    text: "Nézd meg a szolgáltató szabad időpontjait, szolgáltatásait és referenciáit.",
  },
  {
    n: "03",
    icon: CheckCircle2,
    title: "Foglalj",
    text: "Foglalj időpontot néhány kattintással — gyorsan, egyszerűen, telefonálás nélkül.",
  },
];

const results = [
  { name: "Anna Nails Studio", area: "Budapest, XIII. ker.", image: nailsImg, rating: 5 },
  { name: "Aurum Hajszalon", area: "Budapest, VI. ker.", image: hairImg, rating: 4 },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < count ? "h-3 w-3 fill-ink text-ink" : "h-3 w-3 text-line"} />
      ))}
    </div>
  );
}

function StepMock({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-2.5 p-5">
        {results.map((r) => (
          <div key={r.name} className="shadow-card flex gap-3 rounded-2xl bg-white p-2.5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <Image src={r.image} alt={r.name} fill sizes="48px" className="photo-grade object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{r.name}</p>
              <Stars count={r.rating} />
              <p className="mt-0.5 truncate text-[11px] text-ink-soft">{r.area}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <Image src={nailsImg} alt="Anna Nails Studio" fill sizes="36px" className="photo-grade object-cover" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-ink">Anna Nails Studio</p>
            <p className="text-[11px] text-ink-soft">Gél lakk · kedd</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {["09:00", "11:00", "13:30", "14:30"].map((t, i) => (
            <span
              key={t}
              className={
                "flex items-center justify-center rounded-full py-2 text-xs font-semibold tabular-nums " +
                (i === 2 ? "bg-accent-dark text-paper" : "bg-paper-alt text-ink-soft")
              }
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col items-start justify-center p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dark text-paper">
        <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-ink">Foglalás visszaigazolva</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} />
        Kedd, 13:30 · Anna Nails Studio
      </p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="bg-paper py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
          Egyszerű folyamat
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Hogyan működik?
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="flex flex-col">
              <div className="shadow-sheet h-56 overflow-hidden rounded-3xl bg-white">
                <StepMock index={i} />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <s.icon className="h-4 w-4 text-accent-dark" strokeWidth={1.75} />
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {s.n}
                </p>
              </div>
              <h3 className="mt-2 font-display text-xl text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

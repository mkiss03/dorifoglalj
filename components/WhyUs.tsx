import { CalendarClock, MousePointerClick, ShieldCheck, Timer } from "lucide-react";
import { Container } from "./ui/Container";

const points = [
  {
    icon: CalendarClock,
    label: "Valós szabad időpontok",
    text: "Amit látsz, azt foglalhatod — nincs elavult naptár.",
    visual: "09:00 · 11:00 · 13:30",
  },
  {
    icon: MousePointerClick,
    label: "Egyszerű online foglalás",
    text: "Néhány kattintás, és kész is a helyed.",
    visual: "1 → 2 → 3 kattintás",
  },
  {
    icon: ShieldCheck,
    label: "Megbízható szolgáltatók",
    text: "Valódi adatlapok, referenciákkal, árakkal.",
    visual: "Ellenőrzött adatlap",
  },
  {
    icon: Timer,
    label: "Gyors, kényelmes",
    text: "Foglalás percek alatt, telefonálás nélkül.",
    visual: "Kevesebb, mint 60 mp",
  },
];

export function WhyUs() {
  return (
    <section className="bg-paper py-14 lg:py-20">
      <Container>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">
          Vendégeknek
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Miért az IttFoglalj?
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p.label} className="shadow-card flex flex-col rounded-2xl bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-panel text-ink">
                <p.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <p className="mt-4 font-display text-xl text-ink">{p.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{p.text}</p>
              <div className="mt-4 inline-flex w-fit items-center rounded-full bg-paper-alt px-3 py-1.5">
                <p className="text-xs font-semibold tabular-nums text-ink-soft">{p.visual}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

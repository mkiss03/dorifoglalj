import { ArrowRight } from "lucide-react";
import { Container } from "./ui/Container";
import { Collage } from "./ui/Collage";
import salonImg from "@/public/images/salon-interior.jpg";

export function CtaBanner() {
  return (
    <section className="bg-ink py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent">
              Miért érdemes minket választani?
            </p>
            <h2 className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-paper sm:text-5xl">
              Nem csupán egy időpontfoglaló rendszer —{" "}
              <span className="text-accent">közösség</span>, ahol
              vendégek és szolgáltatók egymásra találnak.
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-paper/60">
              Célunk, hogy a vendégek könnyedén megtalálják a számukra
              legmegfelelőbb szolgáltatókat, a szolgáltatók pedig egyszerűen és
              hatékonyan építhessék vállalkozásukat.
            </p>

            <a
              href="#kereses"
              className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-accent-dark px-8 py-4 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-accent"
            >
              Időpontot keresek
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="relative hidden lg:block">
            <Collage image={salonImg} alt="Modern szépségszalon belső tere" letter="F" />
          </div>
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SUPPORT_EMAIL } from "@/lib/contact";

export const metadata = { title: "Impresszum — IttFoglalj.hu" };

export default function ImpresszumPage() {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">Impresszum</h1>

        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Ez az oldal még véglegesítés alatt áll — a szögletes zárójelben szereplő adatok a szolgáltató cégbejegyzési
          adataival lesznek kitöltve. Kérdésed van addig is? Írj: <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">{SUPPORT_EMAIL}</a>.
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">A szolgáltató adatai</h2>
            <ul className="mt-2 space-y-1">
              <li>Név: [Cégnév]</li>
              <li>Székhely: [Székhely / levelezési cím]</li>
              <li>Cégjegyzékszám: [Cégjegyzékszám]</li>
              <li>Nyilvántartó hatóság: [Illetékes cégbíróság]</li>
              <li>Adószám: [Adószám]</li>
              <li>
                E-mail: <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">{SUPPORT_EMAIL}</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Tárhelyszolgáltató</h2>
            <p className="mt-2">
              Supabase, Inc. (adatbázis- és tárhelyszolgáltatás) · Vercel Inc. (alkalmazás-üzemeltetés) — az oldal
              tényleges infrastruktúra-szolgáltatóinak pontos, aktuális elérhetőségei itt kerülnek feltüntetésre.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Jogérvényesítési lehetőségek</h2>
            <p className="mt-2">
              Panasszal a Nemzeti Fogyasztóvédelmi Hatósághoz, illetve a lakóhely szerint illetékes békéltető
              testülethez fordulhatsz. Adatvédelmi kérdésekben a{" "}
              <Link href="/adatkezeles" className="text-ink underline underline-offset-2 hover:text-accent-dark">
                Adatkezelési tájékoztatóban
              </Link>{" "}
              találsz bővebb információt.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

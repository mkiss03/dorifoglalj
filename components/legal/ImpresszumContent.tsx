import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { RichText } from "./RichText";
import { SUPPORT_EMAIL } from "@/lib/contact";
import type { SiteContent } from "@/lib/content/types";

export function ImpresszumContent({
  legal,
  impresszum,
}: {
  legal: SiteContent["legal"];
  impresszum: SiteContent["impresszum"];
}) {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">Impresszum</h1>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">A szolgáltató adatai</h2>
            <ul className="mt-2 space-y-1">
              <li>Név: <span data-field-anchor="legal.company_name">{legal.company_name}</span></li>
              <li>Székhely: <span data-field-anchor="legal.company_address">{legal.company_address}</span></li>
              <li>
                Nyilvántartási szám:{" "}
                <span data-field-anchor="legal.registration_number">{legal.registration_number}</span>
              </li>
              <li>
                Nyilvántartó hatóság:{" "}
                <span data-field-anchor="legal.registering_court">{legal.registering_court}</span>
              </li>
              <li>Adószám: <span data-field-anchor="legal.tax_number">{legal.tax_number}</span></li>
              <li>
                E-mail:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Tárhelyszolgáltató</h2>
            <RichText text={impresszum.hosting_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Jogérvényesítési lehetőségek</h2>
            <RichText text={impresszum.enforcement_body} />
            <p className="mt-2">
              Adatvédelmi kérdésekben a{" "}
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

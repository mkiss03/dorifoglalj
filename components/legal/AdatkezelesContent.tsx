import { Container } from "@/components/ui/Container";
import { RichText } from "./RichText";
import { SUPPORT_EMAIL } from "@/lib/contact";
import type { SiteContent } from "@/lib/content/types";

export function AdatkezelesContent({
  legal,
  adatkezeles,
}: {
  legal: SiteContent["legal"];
  adatkezeles: SiteContent["adatkezeles"];
}) {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">Adatkezelési tájékoztató</h1>

        {adatkezeles.disclaimer && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            {adatkezeles.disclaimer} Kérdésed van addig is? Írj:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        )}

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">Az adatkezelő</h2>
            <p className="mt-2">
              Az IdőpontNeked.hu üzemeltetője {legal.company_name} ({legal.company_address}, adószám:{" "}
              {legal.tax_number}, e-mail:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                {SUPPORT_EMAIL}
              </a>
              ).
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Milyen adatokat kezelünk</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              {adatkezeles.data_categories.map((category) => (
                <li key={category.id}>
                  <strong className="text-ink">{category.label}</strong> {category.text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Az adatkezelés célja és jogalapja</h2>
            <RichText text={adatkezeles.purpose_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Kik férnek hozzá az adatokhoz</h2>
            <RichText text={adatkezeles.recipients_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Megőrzési idő</h2>
            <p className="mt-2">
              A foglalási adatokat a foglalás lezárultát követően {adatkezeles.retention_period} ideig őrizzük meg,
              ezt követően töröljük.
            </p>
            <RichText text={adatkezeles.retention_extra_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Jogaid</h2>
            <p className="mt-2">
              {adatkezeles.rights_body} Kérdésed van? Írj a{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
                {SUPPORT_EMAIL}
              </a>{" "}
              címre.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/ui/Container";
import { RichText } from "./RichText";
import { SUPPORT_EMAIL } from "@/lib/contact";
import type { SiteContent } from "@/lib/content/types";

export function AszfContent({
  legal,
  aszf,
}: {
  legal: SiteContent["legal"];
  aszf: SiteContent["aszf"];
}) {
  return (
    <section className="py-14 lg:py-20">
      <Container className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">Jogi információk</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Általános Szerződési Feltételek
        </h1>

        {aszf.disclaimer && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            {aszf.disclaimer} Kérdésed van addig is? Írj:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        )}

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
          <div>
            <h2 className="font-display text-xl text-ink">A szolgáltatás</h2>
            <p className="mt-2 text-sm font-semibold text-ink">
              Üzemeltető: {legal.company_name} · {legal.company_address}
            </p>
            <RichText text={aszf.service_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Vendégeknek</h2>
            <RichText text={aszf.guests_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Szolgáltatóknak</h2>
            <RichText text={aszf.providers_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Felelősség</h2>
            <RichText text={aszf.liability_body} />
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Módosítás</h2>
            <p className="mt-2">
              {aszf.modification_body} Kérdés vagy észrevétel esetén írj a{" "}
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

import { Container } from "./ui/Container";
import { ProviderCard } from "./search/ProviderCard";
import type { SiteContent } from "@/lib/content/types";
import type { SearchProvider } from "@/lib/supabase/types";

export function FeaturedProviders({
  content,
  providers,
}: {
  content: SiteContent["featuredproviders"];
  providers: SearchProvider[];
}) {
  return (
    <section className="bg-paper-alt py-14 lg:py-20">
      <Container>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{content.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-ink sm:text-4xl">{content.heading}</h2>
        </div>

        {providers.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm italic text-ink-soft">
            Élesben az első aktív, foglalható szolgáltatók jelennek meg itt automatikusan.
          </p>
        )}
      </Container>
    </section>
  );
}

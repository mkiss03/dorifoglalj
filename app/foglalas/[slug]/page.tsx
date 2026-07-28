import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { categories } from "@/lib/categories";
import { BookingWidget } from "./BookingWidget";
import type { PublicProvider } from "@/lib/supabase/types";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_provider", { p_slug: slug });

  if (error || !data) notFound();

  const provider = data as PublicProvider;
  const categoryName = categories.find((c) => c.slug === provider.category)?.name;

  return (
    <section className="py-10 lg:py-16">
      <Container className="max-w-2xl">
        {categoryName && (
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent-dark">{categoryName}</p>
        )}
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {provider.business_name}
        </h1>
        {provider.city && <p className="mt-1 text-[15px] text-ink-soft">{provider.city}</p>}
        {provider.description && (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{provider.description}</p>
        )}

        <div className="mt-8">
          <BookingWidget provider={provider} />
        </div>
      </Container>
    </section>
  );
}

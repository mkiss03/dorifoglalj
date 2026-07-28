import { getUser, createClient } from "@/lib/supabase/server";
import type { Provider, ProviderService } from "@/lib/supabase/types";
import { Container } from "@/components/ui/Container";
import { ProfileForm } from "./ProfileForm";
import { ServicesSection } from "./ServicesSection";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [{ data: provider }, { data: services }] = await Promise.all([
    supabase.from("providers").select("*").eq("id", user!.id).single(),
    supabase.from("provider_services").select("*").eq("provider_id", user!.id).order("created_at"),
  ]);

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <h1 className="font-display text-3xl text-ink">Irányítópult</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Itt szerkesztheted a szolgáltatói profilodat és a szolgáltatásaidat.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ProfileForm provider={provider as Provider | null} />
          <ServicesSection services={(services ?? []) as ProviderService[]} />
        </div>
      </Container>
    </section>
  );
}

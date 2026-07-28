import { getUser, createClient } from "@/lib/supabase/server";
import type { ProviderService } from "@/lib/supabase/types";
import { ServicesSection } from "../ServicesSection";

export default async function DashboardServicesPage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("provider_services")
    .select("*")
    .eq("provider_id", user!.id)
    .order("created_at");

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Szolgáltatások</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Az „Aktív” kapcsolóval ideiglenesen elrejthetsz egy szolgáltatást a foglalási oldaladról törlés nélkül.
      </p>

      <div className="mt-6">
        <ServicesSection services={(services ?? []) as ProviderService[]} />
      </div>
    </section>
  );
}

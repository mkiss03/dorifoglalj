import { getUser, createClient } from "@/lib/supabase/server";
import type { ProviderService } from "@/lib/supabase/types";
import { StaffSection } from "../StaffSection";
import { getStaffWithServices } from "../staffData";

export default async function DashboardStaffPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [staff, { data: services }] = await Promise.all([
    getStaffWithServices(supabase, user!.id),
    supabase.from("provider_services").select("*").eq("provider_id", user!.id).order("created_at"),
  ]);

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Csapat</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        Ha többen dolgoztok (pl. körmös és pillás), vegyétek fel őket itt. Mindenki saját nyitvatartást és
        naptárat kap, a vendégek pedig foglaláskor kiválaszthatják, kihez szeretnének menni.
      </p>

      <div className="mt-6">
        <StaffSection staff={staff} services={(services ?? []) as ProviderService[]} />
      </div>
    </section>
  );
}

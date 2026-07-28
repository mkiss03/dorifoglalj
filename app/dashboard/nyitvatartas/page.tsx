import { getUser, createClient } from "@/lib/supabase/server";
import type { Availability } from "@/lib/supabase/types";
import { AvailabilitySection } from "../AvailabilitySection";

export default async function DashboardAvailabilityPage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data: availability } = await supabase
    .from("provider_availability")
    .select("*")
    .eq("provider_id", user!.id)
    .order("weekday");

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Nyitvatartás</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        A heti nyitvatartásod szabja meg, mikor foglalhatnak a vendégeid a publikus oldaladon.
      </p>

      <div className="mt-6">
        <AvailabilitySection availability={(availability ?? []) as Availability[]} />
      </div>
    </section>
  );
}

import { getUser, createClient } from "@/lib/supabase/server";
import type { Availability, Provider } from "@/lib/supabase/types";
import { AvailabilitySection } from "../AvailabilitySection";
import { BufferSettingsCard } from "../BufferSettingsCard";

export default async function DashboardAvailabilityPage() {
  const user = await getUser();
  const supabase = await createClient();
  const [{ data: availability }, { data: provider }] = await Promise.all([
    supabase.from("provider_availability").select("*").eq("provider_id", user!.id).order("weekday"),
    supabase.from("providers").select("buffer_minutes").eq("id", user!.id).single(),
  ]);

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Nyitvatartás</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        A heti nyitvatartásod szabja meg, mikor foglalhatnak a vendégeid a publikus oldaladon.
      </p>

      <div className="mt-6">
        <AvailabilitySection availability={(availability ?? []) as Availability[]} />
      </div>

      <BufferSettingsCard bufferMinutes={(provider as Pick<Provider, "buffer_minutes"> | null)?.buffer_minutes ?? 0} />
    </section>
  );
}

import { getUser, createClient } from "@/lib/supabase/server";
import type { Availability, Provider, ProviderBlock, StaffMember } from "@/lib/supabase/types";
import { StaffScheduleTabs } from "../StaffScheduleTabs";
import { BufferSettingsCard } from "../BufferSettingsCard";

export default async function DashboardAvailabilityPage() {
  const user = await getUser();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: staff }, { data: availability }, { data: provider }, { data: blocks }] = await Promise.all([
    supabase.from("staff_members").select("*").eq("provider_id", user!.id).order("created_at"),
    supabase.from("provider_availability").select("*").eq("provider_id", user!.id).order("weekday"),
    supabase.from("providers").select("buffer_minutes").eq("id", user!.id).single(),
    supabase
      .from("provider_blocks")
      .select("*")
      .eq("provider_id", user!.id)
      .gte("block_date", today)
      .order("block_date"),
  ]);

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Nyitvatartás</h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        A heti nyitvatartásod szabja meg, mikor foglalhatnak a vendégeid a publikus oldaladon.
      </p>

      <div className="mt-6">
        <StaffScheduleTabs
          staff={(staff ?? []) as StaffMember[]}
          availability={(availability ?? []) as Availability[]}
          blocks={(blocks ?? []) as ProviderBlock[]}
        />
      </div>

      <BufferSettingsCard bufferMinutes={(provider as Pick<Provider, "buffer_minutes"> | null)?.buffer_minutes ?? 0} />
    </section>
  );
}

import type { createClient } from "@/lib/supabase/server";
import type { StaffMemberWithServices } from "@/lib/supabase/types";

/** A szolgáltató munkatársai, mindegyikhez a hozzárendelt szolgáltatás-id-kkel
 * (`staff_services` join) — a Csapat oldalon és a kézi foglalás staff-választójában
 * egyaránt ez szolgál forrásul. */
export async function getStaffWithServices(
  supabase: Awaited<ReturnType<typeof createClient>>,
  providerId: string
): Promise<StaffMemberWithServices[]> {
  const { data } = await supabase
    .from("staff_members")
    .select("*, staff_services(service_id)")
    .eq("provider_id", providerId)
    .order("created_at");

  return (data ?? []).map((row) => {
    const { staff_services, ...rest } = row as StaffMemberWithServices & { staff_services: { service_id: string }[] };
    return { ...rest, service_ids: staff_services.map((s) => s.service_id) };
  });
}

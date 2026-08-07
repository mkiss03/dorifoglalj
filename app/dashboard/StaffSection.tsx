import { StaffCard } from "./StaffCard";
import { AddStaffForm } from "./AddStaffForm";
import type { ProviderService, StaffMemberWithServices } from "@/lib/supabase/types";

export function StaffSection({
  staff,
  services,
}: {
  staff: StaffMemberWithServices[];
  services: ProviderService[];
}) {
  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Munkatársak</h2>

      <div className="mt-5 space-y-3">
        {staff.map((s) => (
          <StaffCard key={s.id} staff={s} services={services} />
        ))}

        {staff.length === 0 && <p className="text-sm text-ink-soft">Még nincs felvett munkatársad.</p>}
      </div>

      <AddStaffForm services={services} />
    </div>
  );
}

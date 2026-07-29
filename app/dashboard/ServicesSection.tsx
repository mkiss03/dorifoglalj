import { ServiceRow } from "./ServiceRow";
import { AddServiceForm } from "./AddServiceForm";
import type { ProviderService } from "@/lib/supabase/types";

export function ServicesSection({ services }: { services: ProviderService[] }) {
  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Szolgáltatások</h2>

      <div className="mt-5 space-y-3">
        {services.map((s) => (
          <ServiceRow key={s.id} service={s} />
        ))}

        {services.length === 0 && (
          <p className="text-sm text-ink-soft">Még nincs felvett szolgáltatásod.</p>
        )}
      </div>

      <AddServiceForm />
    </div>
  );
}

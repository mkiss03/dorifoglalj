import { addServiceAction, deleteServiceAction, updateServiceAction } from "./actions";
import type { ProviderService } from "@/lib/supabase/types";

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function ServicesSection({ services }: { services: ProviderService[] }) {
  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Szolgáltatások</h2>

      <div className="mt-5 space-y-3">
        {services.map((s) => (
          <form
            key={s.id}
            action={updateServiceAction}
            className="shadow-card space-y-2 rounded-2xl bg-paper-alt/60 p-3"
          >
            <input type="hidden" name="id" value={s.id} />
            <input name="name" defaultValue={s.name} className={inputClass} placeholder="Szolgáltatás neve" />
            <textarea
              name="description"
              defaultValue={s.description ?? ""}
              rows={2}
              className={inputClass}
              placeholder="Rövid leírás (nem kötelező)"
            />
            <div className="flex flex-wrap items-center gap-2">
              <input
                name="price_huf"
                type="number"
                min={0}
                defaultValue={s.price_huf}
                className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
                placeholder="Ft"
              />
              <input
                name="duration_minutes"
                type="number"
                min={1}
                defaultValue={s.duration_minutes}
                className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
                placeholder="perc"
              />
              <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={s.active}
                  className="h-3.5 w-3.5 accent-accent-dark"
                />
                Aktív
              </label>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-paper transition-colors hover:bg-ink/90"
              >
                Mentés
              </button>
              <button
                type="submit"
                formAction={deleteServiceAction}
                className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                Törlés
              </button>
            </div>
          </form>
        ))}

        {services.length === 0 && (
          <p className="text-sm text-ink-soft">Még nincs felvett szolgáltatásod.</p>
        )}
      </div>

      <form action={addServiceAction} className="mt-4 space-y-2 border-t border-line pt-4">
        <input name="name" required className={inputClass} placeholder="Új szolgáltatás neve" />
        <textarea name="description" rows={2} className={inputClass} placeholder="Rövid leírás (nem kötelező)" />
        <div className="flex flex-wrap items-center gap-2">
          <input
            name="price_huf"
            type="number"
            min={0}
            required
            className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
            placeholder="Ft"
          />
          <input
            name="duration_minutes"
            type="number"
            min={1}
            required
            className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
            placeholder="perc"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-paper-alt px-3 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-panel"
          >
            + Hozzáadás
          </button>
        </div>
      </form>
    </div>
  );
}

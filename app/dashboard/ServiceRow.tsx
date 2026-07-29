"use client";

import { useActionState } from "react";
import { deleteServiceAction, updateServiceAction, type ServiceState } from "./actions";
import type { ProviderService } from "@/lib/supabase/types";

const initialState: ServiceState = { status: "idle" };

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function ServiceRow({ service }: { service: ProviderService }) {
  const [state, formAction, pending] = useActionState(updateServiceAction, initialState);

  return (
    <form action={formAction} className="shadow-card space-y-2 rounded-2xl bg-paper-alt/60 p-3">
      <input type="hidden" name="id" value={service.id} />
      <input name="name" defaultValue={service.name} className={inputClass} placeholder="Szolgáltatás neve" />
      <textarea
        name="description"
        defaultValue={service.description ?? ""}
        rows={2}
        className={inputClass}
        placeholder="Rövid leírás (nem kötelező)"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="price_huf"
          type="number"
          min={0}
          defaultValue={service.price_huf}
          className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
          placeholder="Ft"
        />
        <input
          name="duration_minutes"
          type="number"
          min={1}
          defaultValue={service.duration_minutes}
          className={`${inputClass} w-0 min-w-[4.5rem] flex-1`}
          placeholder="perc"
        />
        <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={service.active}
            className="h-3.5 w-3.5 accent-accent-dark"
          />
          Aktív
        </label>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-ink px-3 py-2 text-xs font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
        <button
          type="submit"
          formAction={deleteServiceAction}
          className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          Törlés
        </button>
      </div>
      {state.status !== "idle" && (
        <p className={"text-xs " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>
          {state.message}
        </p>
      )}
    </form>
  );
}

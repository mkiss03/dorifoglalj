"use client";

import { useActionState, useEffect, useRef } from "react";
import { addStaffAction, type StaffState } from "./actions";
import type { ProviderService } from "@/lib/supabase/types";

const initialState: StaffState = { status: "idle" };

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function AddStaffForm({ services }: { services: ProviderService[] }) {
  const [state, formAction, pending] = useActionState(addStaffAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-2 border-t border-line pt-4">
      <div className="flex flex-wrap gap-2">
        <input name="name" required className={`${inputClass} min-w-[8rem] flex-1`} placeholder="Új munkatárs neve" />
        <input name="specialty" className={`${inputClass} min-w-[8rem] flex-1`} placeholder="Specialitás (pl. Pillás)" />
      </div>

      {services.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <input type="checkbox" name="service_ids" value={s.id} className="h-3.5 w-3.5 accent-accent-dark" />
              {s.name}
            </label>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full bg-paper-alt px-3 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-panel disabled:opacity-60"
      >
        {pending ? "Mentés…" : "+ Munkatárs hozzáadása"}
      </button>

      {state.status !== "idle" && (
        <p className={"text-xs " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>{state.message}</p>
      )}
    </form>
  );
}

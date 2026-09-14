"use client";

import { useActionState, useEffect, useRef } from "react";
import { addServiceAction, type ServiceState } from "./actions";
import { PriceDurationFields } from "./PriceDurationFields";

const initialState: ServiceState = { status: "idle" };

const inputClass =
  "w-full rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function AddServiceForm() {
  const [state, formAction, pending] = useActionState(addServiceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Sikeres hozzáadás után ürítsük ki az űrlapot.
  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-2 border-t border-line pt-4">
      <input name="name" required className={inputClass} placeholder="Új szolgáltatás neve" />
      <textarea name="description" rows={2} className={inputClass} placeholder="Rövid leírás (nem kötelező)" />
      <div className="flex flex-wrap items-end gap-2">
        <PriceDurationFields />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-paper-alt px-3 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-panel disabled:opacity-60"
        >
          {pending ? "Mentés…" : "+ Hozzáadás"}
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

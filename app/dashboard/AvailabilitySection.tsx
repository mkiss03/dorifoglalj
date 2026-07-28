"use client";

import { useActionState } from "react";
import { updateAvailabilityAction, type AvailabilityState } from "./actions";
import type { Availability } from "@/lib/supabase/types";

const DAYS = [
  { weekday: 1, label: "Hétfő" },
  { weekday: 2, label: "Kedd" },
  { weekday: 3, label: "Szerda" },
  { weekday: 4, label: "Csütörtök" },
  { weekday: 5, label: "Péntek" },
  { weekday: 6, label: "Szombat" },
  { weekday: 7, label: "Vasárnap" },
];

const initialState: AvailabilityState = { status: "idle" };

export function AvailabilitySection({ availability }: { availability: Availability[] }) {
  const [state, formAction, pending] = useActionState(updateAvailabilityAction, initialState);
  const byWeekday = new Map(availability.map((a) => [a.weekday, a]));

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Nyitvatartás</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ez alapján tudnak majd időpontot foglalni a vendégeid a foglalási oldaladon.
      </p>

      <form action={formAction} className="mt-5 space-y-2">
        {DAYS.map((d) => {
          const existing = byWeekday.get(d.weekday);
          return (
            <div key={d.weekday} className="flex flex-wrap items-center gap-3 rounded-2xl bg-paper-alt px-4 py-2.5">
              <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  name={`day_${d.weekday}_enabled`}
                  defaultChecked={!!existing}
                  className="h-4 w-4 accent-accent-dark"
                />
                {d.label}
              </label>
              <input
                type="time"
                name={`day_${d.weekday}_start`}
                defaultValue={existing?.start_time?.slice(0, 5) ?? "09:00"}
                className="rounded-xl bg-white px-3 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
              />
              <span className="text-ink-soft">–</span>
              <input
                type="time"
                name={`day_${d.weekday}_end`}
                defaultValue={existing?.end_time?.slice(0, 5) ?? "17:00"}
                className="rounded-xl bg-white px-3 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
              />
            </div>
          );
        })}

        {state.status !== "idle" && (
          <p className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-accent-dark"}>
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
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

type DayRow = { enabled: boolean; start: string; end: string };

export function AvailabilitySection({ availability, staffId }: { availability: Availability[]; staffId: string }) {
  const [state, formAction, pending] = useActionState(updateAvailabilityAction, initialState);
  const byWeekday = new Map(availability.map((a) => [a.weekday, a]));

  const [rows, setRows] = useState<DayRow[]>(() =>
    DAYS.map((d) => {
      const existing = byWeekday.get(d.weekday);
      return {
        enabled: !!existing,
        start: existing?.start_time?.slice(0, 5) ?? "09:00",
        end: existing?.end_time?.slice(0, 5) ?? "17:00",
      };
    })
  );

  function updateRow(index: number, patch: Partial<DayRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function applyFirstToAll() {
    const { start, end } = rows[0];
    setRows((prev) => prev.map((r) => ({ ...r, start, end })));
  }

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Nyitvatartás</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Ez alapján tudnak majd időpontot foglalni a vendégeid a foglalási oldaladon.
          </p>
        </div>
        <button
          type="button"
          onClick={applyFirstToAll}
          className="shrink-0 rounded-full bg-paper-alt px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
        >
          Hétfői idő minden napra
        </button>
      </div>

      <form action={formAction} className="mt-5 space-y-2">
        <input type="hidden" name="staff_id" value={staffId} />
        {DAYS.map((d, index) => {
          const row = rows[index];
          return (
            <div key={d.weekday} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-2xl bg-paper-alt px-4 py-2.5">
              <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium text-ink cursor-pointer py-1">
                <input
                  type="checkbox"
                  name={`day_${d.weekday}_enabled`}
                  checked={row.enabled}
                  onChange={(e) => updateRow(index, { enabled: e.target.checked })}
                  className="h-4 w-4 accent-accent-dark"
                />
                {d.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  name={`day_${d.weekday}_start`}
                  value={row.start}
                  onChange={(e) => updateRow(index, { start: e.target.value })}
                  className="rounded-xl bg-white px-3 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
                />
                <span className="text-ink-soft">–</span>
                <input
                  type="time"
                  name={`day_${d.weekday}_end`}
                  value={row.end}
                  onChange={(e) => updateRow(index, { end: e.target.value })}
                  className="rounded-xl bg-white px-3 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
                />
              </div>
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

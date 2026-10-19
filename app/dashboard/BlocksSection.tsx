"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import { addBlockAction, deleteBlockAction, type BlockState } from "./actions";
import type { ProviderBlock, StaffMember } from "@/lib/supabase/types";

const initialState: BlockState = { status: "idle" };

function formatBlockDate(dateStr: string) {
  const label = new Intl.DateTimeFormat("hu-HU", { weekday: "long", month: "long", day: "numeric" }).format(
    new Date(`${dateStr}T00:00:00`)
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function BlocksSection({
  blocks,
  staffId,
  staff,
}: {
  blocks: ProviderBlock[];
  staffId: string;
  /** Az aktív munkatársak — ha több van, a kizárás többükre is felvehető egyszerre. */
  staff: Pick<StaffMember, "id" | "name">[];
}) {
  const [state, formAction, pending] = useActionState(addBlockAction, initialState);
  const [allDay, setAllDay] = useState(false);
  const [selected, setSelected] = useState<string[]>([staffId]);

  const multiStaff = staff.length > 1;
  const allSelected = staff.every((s) => selected.includes(s.id));
  const currentName = staff.find((s) => s.id === staffId)?.name ?? "";

  function toggleStaff(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const sorted = [...blocks].sort((a, b) => a.block_date.localeCompare(b.block_date));

  return (
    <div className="shadow-sheet mt-6 rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Eseti kizárások</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ha a heti nyitvatartásodon belül egy adott napon/időszakban mégsem érsz rá (pl. kedden
        8–9 között ügyet kell intézned), itt jelölheted ki. Ekkor a vendégek nem tudnak arra
        az időpontra foglalni.
      </p>

      {sorted.length > 0 && (
        <ul className="mt-4 space-y-2">
          {sorted.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper-alt px-4 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {formatBlockDate(b.block_date)}
                  <span className="ml-2 font-normal text-ink-soft">
                    {b.start_time && b.end_time
                      ? `${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}`
                      : "egész nap"}
                  </span>
                </p>
                {b.note && <p className="truncate text-xs text-ink-soft">{b.note}</p>}
              </div>
              <form action={deleteBlockAction}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  aria-label="Kizárás törlése"
                  title="Kizárás törlése"
                  className="shrink-0 rounded-full p-1.5 text-ink-soft/60 transition-colors hover:bg-panel hover:text-accent-dark"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {sorted.length === 0 && <p className="mt-4 text-sm text-ink-soft">Jelenleg nincs eseti kizárásod.</p>}

      <form action={formAction} className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5">
        {multiStaff ? (
          <div className="w-full">
            <p className="text-xs font-semibold text-ink-soft">Kikre vonatkozik?</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {staff.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={
                      "flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-accent-light " +
                      (on ? "bg-ink text-paper" : "bg-paper-alt text-ink-soft hover:bg-panel")
                    }
                  >
                    <input
                      type="checkbox"
                      name="staff_ids"
                      value={s.id}
                      checked={on}
                      onChange={() => toggleStaff(s.id)}
                      className="sr-only"
                    />
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                    {s.name}
                  </label>
                );
              })}
              <button
                type="button"
                onClick={() => setSelected(allSelected ? [staffId] : staff.map((s) => s.id))}
                className="px-1 text-xs font-semibold text-accent-dark hover:underline"
              >
                {allSelected ? `Csak ${currentName}` : "Mindenki"}
              </button>
            </div>
          </div>
        ) : (
          <input type="hidden" name="staff_ids" value={staffId} />
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-soft">Dátum</label>
          <input
            type="date"
            name="block_date"
            required
            min={todayIso()}
            className="rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
          />
        </div>

        <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-ink">
          <input
            type="checkbox"
            name="all_day"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-4 w-4 accent-accent-dark"
          />
          Egész nap
        </label>

        {!allDay && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft">Kezdés</label>
              <input
                type="time"
                name="start_time"
                required={!allDay}
                defaultValue="08:00"
                className="rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft">Vége</label>
              <input
                type="time"
                name="end_time"
                required={!allDay}
                defaultValue="09:00"
                className="rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
              />
            </div>
          </>
        )}

        <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-soft">Megjegyzés (opcionális)</label>
          <input
            type="text"
            name="note"
            placeholder="pl. kormányablak"
            maxLength={200}
            className="rounded-xl bg-paper-alt px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
          />
        </div>

        <button
          type="submit"
          disabled={pending || selected.length === 0}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Hozzáadás"}
        </button>
      </form>

      {state.status !== "idle" && (
        <p className={"mt-3 text-sm " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>
          {state.message}
        </p>
      )}
    </div>
  );
}

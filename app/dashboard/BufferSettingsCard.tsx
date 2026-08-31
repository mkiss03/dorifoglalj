"use client";

import { useActionState } from "react";
import { updateBufferAction, type BufferState } from "./actions";

const OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60];

const initialState: BufferState = { status: "idle" };

export function BufferSettingsCard({ bufferMinutes }: { bufferMinutes: number }) {
  const [state, formAction, pending] = useActionState(updateBufferAction, initialState);

  return (
    <div className="shadow-sheet mt-6 rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Szünet két időpont között</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ennyi időnek kell eltelnie egy foglalás vége és a következő kezdete között, így nem
        kezdődhet új időpont közvetlenül az előző után.
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
        <select
          name="buffer_minutes"
          defaultValue={bufferMinutes}
          className="rounded-2xl bg-paper-alt px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
        >
          {OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m === 0 ? "Nincs szünet" : `${m} perc`}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </form>
      {state.status !== "idle" && (
        <p className={"mt-2 text-sm " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>
          {state.message}
        </p>
      )}
    </div>
  );
}

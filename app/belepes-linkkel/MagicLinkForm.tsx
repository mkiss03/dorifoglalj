"use client";

import { useActionState } from "react";
import { magicLinkAction, type MagicLinkState } from "./actions";

const initialState: MagicLinkState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function MagicLinkForm() {
  const [state, formAction, pending] = useActionState(magicLinkAction, initialState);

  if (state.status === "success") {
    return (
      <p className="mt-6 rounded-2xl bg-paper-alt p-4 text-[15px] leading-relaxed text-ink">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          E-mail cím
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
          placeholder="te@vallalkozasod.hu"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Küldés…" : "Bejelentkező link küldése"}
      </button>
    </form>
  );
}

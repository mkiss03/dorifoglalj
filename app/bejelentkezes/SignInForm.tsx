"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

/** `action` opcionálisan felülírható — az admin belépő oldal (lásd
 * app/admin/bejelentkezes/page.tsx) egy másik server actiont ad át, ami
 * ugyanazt a hitelesítést végzi, csak sikeres belépés után máshova
 * irányít (is_admin()-tól függően). */
export function SignInForm({ action = signInAction }: { action?: typeof signInAction }) {
  const [state, formAction, pending] = useActionState(action, initialState);

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
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Jelszó
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
          placeholder="••••••••"
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
        {pending ? "Belépés…" : "Bejelentkezés"}
      </button>
    </form>
  );
}

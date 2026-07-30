"use client";

import { useActionState } from "react";
import { signUpAction, type SignUpState } from "./actions";

const initialState: SignUpState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  if (state.status === "success") {
    return (
      <div className="mt-6 space-y-3">
        <p className="rounded-2xl bg-paper-alt p-4 text-[15px] leading-relaxed text-ink">
          Elküldtük a megerősítő e-mailt — kattints a benne lévő linkre, utána
          bejelentkezhetsz.
        </p>
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[15px] leading-relaxed text-amber-900">
          Köszönjük a regisztrációt! Fiókod jóváhagyásra vár. Miután egyeztetünk veled
          emailben, aktiváljuk a profilod. Addig is állítsd be az adataidat a dashboardban.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="business_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Vállalkozás neve
        </label>
        <input
          id="business_name"
          name="business_name"
          type="text"
          autoComplete="organization"
          required
          className={inputClass}
          placeholder="Anna Nails Studio"
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Legalább 8 karakter"
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
        {pending ? "Küldés…" : "Regisztráció"}
      </button>
    </form>
  );
}

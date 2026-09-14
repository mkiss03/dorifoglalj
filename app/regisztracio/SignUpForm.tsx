"use client";

import { useActionState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
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
          Ha ez az e-mail cím még nem regisztrált nálunk, elküldtük rá a megerősítő linket.
          Nézd meg a postaládád (a spam mappát is), és kattints a linkre a folytatáshoz. Ha
          már van fiókod ezzel a címmel, egyszerűen{" "}
          <a href="/bejelentkezes" className="font-semibold underline underline-offset-2">
            jelentkezz be
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="hp_website">Ne töltsd ki ezt a mezőt</label>
        <input id="hp_website" name="hp_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Legalább 8 karakter"
        />
      </div>
      <div>
        <label
          htmlFor="password_confirm"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
        >
          Jelszó mégegyszer
        </label>
        <PasswordInput
          id="password_confirm"
          name="password_confirm"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
          placeholder="Írd be ugyanazt a jelszót"
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

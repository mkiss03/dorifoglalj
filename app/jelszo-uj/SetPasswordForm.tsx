"use client";

import { useActionState } from "react";
import Link from "next/link";
import { setPasswordAction, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPasswordAction, initialState);

  if (state.status === "success") {
    return (
      <div className="mt-6 space-y-4">
        <p className="rounded-2xl bg-paper-alt p-4 text-[15px] leading-relaxed text-ink">
          {state.message}
        </p>
        <Link
          href="/bejelentkezes"
          className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90"
        >
          Bejelentkezés
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Új jelszó
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
      <div>
        <label
          htmlFor="password_confirm"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft"
        >
          Új jelszó mégegyszer
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
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
        {pending ? "Mentés…" : "Jelszó beállítása"}
      </button>
    </form>
  );
}

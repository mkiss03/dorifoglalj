"use client";

import { useActionState } from "react";
import { updateEmailAction, updatePasswordAction, type AccountState } from "./actions";

const initialState: AccountState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(updateEmailAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className={labelClass}>
          Új e-mail cím
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={currentEmail}
          className={inputClass}
        />
      </div>

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
        {pending ? "Mentés…" : "E-mail cím módosítása"}
      </button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="password" className={labelClass}>
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
        <label htmlFor="password_confirm" className={labelClass}>
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
        {pending ? "Mentés…" : "Jelszó módosítása"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileState } from "./actions";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import type { Provider } from "@/lib/supabase/types";

const initialState: ProfileState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

export function ProfileForm({ provider }: { provider: Provider | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Profil</h2>
      <form action={formAction} className="mt-5 space-y-4">
        <div>
          <label htmlFor="business_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Vállalkozás neve
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            defaultValue={provider?.business_name ?? ""}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Kategória
            </label>
            <select
              id="category"
              name="category"
              defaultValue={provider?.category ?? ""}
              className={inputClass}
            >
              <option value="">Válassz…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="city" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Település
            </label>
            <select
              id="city"
              name="city"
              defaultValue={provider?.city ?? ""}
              className={inputClass}
            >
              <option value="">Válassz…</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Telefonszám
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={provider?.phone ?? ""}
            className={inputClass}
            placeholder="+36 20 123 4567"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Rövid bemutatkozás
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={provider?.description ?? ""}
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
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </form>
    </div>
  );
}

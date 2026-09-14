"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, type ProfileState } from "./actions";
import { categories, OTHER_CATEGORY_LABEL, OTHER_CATEGORY_SLUG } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { HUNGARY_REGIONS } from "@/lib/hungaryMap";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PROVIDER_TAGS,
  TAG_LABELS,
  type Provider,
} from "@/lib/supabase/types";

const initialState: ProfileState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft";

function stripProtocol(url: string | null) {
  return url?.replace(/^https?:\/\//i, "") ?? "";
}

export function ProfileForm({ provider }: { provider: Provider | null }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const [category, setCategory] = useState(provider?.category ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="business_name" className={labelClass}>
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
          <label htmlFor="category" className={labelClass}>
            Kategória
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Válassz…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            <option value={OTHER_CATEGORY_SLUG}>{OTHER_CATEGORY_LABEL}</option>
          </select>
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            Település
          </label>
          <input
            id="city"
            name="city"
            type="text"
            list="city-suggestions"
            defaultValue={provider?.city ?? ""}
            className={inputClass}
            placeholder="Írd be a településed"
          />
          <datalist id="city-suggestions">
            {cities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>
      </div>

      {category === OTHER_CATEGORY_SLUG && (
        <div className="rounded-2xl border border-accent-dark/20 bg-accent-light/30 p-4">
          <label htmlFor="category_other" className={labelClass}>
            Milyen megnevezést kérsz?
          </label>
          <input
            id="category_other"
            name="category_other"
            type="text"
            maxLength={60}
            defaultValue={provider?.category_other ?? ""}
            className={inputClass}
            placeholder="pl. Gyógytorna"
          />
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Írd be, hogyan nevezzük a szolgáltatásodat — megnézzük, és ha illik a kínálatba,
            felvesszük új kategóriaként. Addig a profilod „Egyéb” kategóriában marad.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="county" className={labelClass}>
          Megye
        </label>
        <select id="county" name="county" defaultValue={provider?.county ?? ""} className={inputClass}>
          <option value="">Válassz…</option>
          {HUNGARY_REGIONS.map((region) => (
            <option key={region.id} value={region.id}>
              {region.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>
          Cím (utca, házszám)
        </label>
        <input
          id="address"
          name="address"
          type="text"
          defaultValue={provider?.address ?? ""}
          className={inputClass}
          placeholder="Fő utca 12."
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
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
        <label htmlFor="description" className={labelClass}>
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

      <div className="border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Online jelenlét</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="website" className="mb-1 block text-xs text-ink-soft">
              Weboldal
            </label>
            <input
              id="website"
              name="website"
              type="text"
              defaultValue={stripProtocol(provider?.website ?? null)}
              className={inputClass}
              placeholder="pelda.hu"
            />
          </div>
          <div>
            <label htmlFor="facebook_url" className="mb-1 block text-xs text-ink-soft">
              Facebook
            </label>
            <input
              id="facebook_url"
              name="facebook_url"
              type="text"
              defaultValue={stripProtocol(provider?.facebook_url ?? null)}
              className={inputClass}
              placeholder="facebook.com/pelda"
            />
          </div>
          <div>
            <label htmlFor="instagram_url" className="mb-1 block text-xs text-ink-soft">
              Instagram
            </label>
            <input
              id="instagram_url"
              name="instagram_url"
              type="text"
              defaultValue={stripProtocol(provider?.instagram_url ?? null)}
              className={inputClass}
              placeholder="instagram.com/pelda"
            />
          </div>
          <div>
            <label htmlFor="tiktok_url" className="mb-1 block text-xs text-ink-soft">
              TikTok
            </label>
            <input
              id="tiktok_url"
              name="tiktok_url"
              type="text"
              defaultValue={stripProtocol(provider?.tiktok_url ?? null)}
              className={inputClass}
              placeholder="tiktok.com/@pelda"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className={labelClass}>Milyen fizetési módot fogadsz el?</p>
        <p className="mb-3 text-[13px] text-ink-soft">
          Jelöld be az összeset, amivel fizethetnek nálad — ez megjelenik a publikus
          foglalási oldaladon, hogy a vendégek előre lássák.
        </p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((method) => (
            <label key={method} className="cursor-pointer">
              <input
                type="checkbox"
                name="payment_methods"
                value={method}
                defaultChecked={
                  // Ha van már mentett lista, az dönt; ha még nincs (régi
                  // profil), a korábbi bankkártya-jelzőből indulunk ki.
                  (provider?.payment_methods?.length ?? 0) > 0
                    ? provider!.payment_methods.includes(method)
                    : method === "bankkartya" && (provider?.accepts_card_payment ?? false)
                }
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-line bg-paper-alt px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 peer-checked:border-accent-dark peer-checked:bg-accent-dark peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-accent-light">
                {PAYMENT_METHOD_LABELS[method]}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className={labelClass}>Milyen alkalmakra vállalsz munkát?</p>
        <p className="mb-3 text-[13px] text-ink-soft">
          Válassz legalább egyet, ez alapján tudnak majd rád szűrni a vendégek.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROVIDER_TAGS.map((tag) => (
            <label key={tag} className="cursor-pointer">
              <input
                type="checkbox"
                name="tags"
                value={tag}
                defaultChecked={provider?.tags?.includes(tag) ?? false}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-line bg-paper-alt px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 peer-checked:border-accent-dark peer-checked:bg-accent-dark peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-accent-light">
                {TAG_LABELS[tag]}
              </span>
            </label>
          ))}
        </div>
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
  );
}

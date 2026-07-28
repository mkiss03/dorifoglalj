"use client";

import { useActionState, useState } from "react";
import { Share2 } from "lucide-react";
import { updateBookingLinkAction, type BookingLinkState } from "./actions";
import type { Provider } from "@/lib/supabase/types";

const initialState: BookingLinkState = { status: "idle" };

export function BookingLinkCard({
  provider,
  siteUrl,
  qrDataUrl,
}: {
  provider: Provider;
  siteUrl: string;
  qrDataUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updateBookingLinkAction, initialState);
  const [copiedWhich, setCopiedWhich] = useState<"link" | "ics" | null>(null);

  const bookingUrl = `${siteUrl}/foglalas/${provider.slug}`;
  const icsUrl = `${siteUrl}/api/ics/${provider.ics_token}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingUrl)}`;

  function copy(text: string, which: "link" | "ics") {
    navigator.clipboard?.writeText(text);
    setCopiedWhich(which);
    setTimeout(() => setCopiedWhich(null), 1500);
  }

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6">
      <h2 className="font-display text-xl text-ink">Foglalási link</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Ezt a linket oszd meg (pl. a Facebook-oldaladon) — itt tudnak az ügyfeleid regisztráció nélkül foglalni.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-paper-alt p-2 pl-4">
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{bookingUrl}</span>
        <button
          type="button"
          onClick={() => copy(bookingUrl, "link")}
          className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-ink/90"
        >
          {copiedWhich === "link" ? "Másolva!" : "Másolás"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <a
          href={fbShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-paper-alt px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          Megosztás Facebookon
        </a>

        <div className="flex items-center gap-3 rounded-2xl bg-paper-alt p-2 pl-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR kód a foglalási linkhez" className="h-16 w-16 rounded-lg bg-white" />
          <a
            href={qrDataUrl}
            download="foglalasi-link-qr.png"
            className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-panel"
          >
            QR letöltése
          </a>
        </div>
      </div>

      <form action={formAction} className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Link vége (…/foglalas/…)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={provider.slug}
            className="w-full rounded-2xl bg-paper-alt px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent-light"
          />
        </div>
        <label className="mb-2 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="booking_enabled"
            defaultChecked={provider.booking_enabled}
            className="h-4 w-4 accent-accent-dark"
          />
          Foglalási oldal aktív
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-paper-alt px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-panel disabled:opacity-60"
        >
          {pending ? "Mentés…" : "Mentés"}
        </button>
      </form>
      {state.status !== "idle" && (
        <p className={"mt-2 text-sm " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>
          {state.message}
        </p>
      )}

      <div className="mt-6 border-t border-line pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Naptár-szinkron (Google / Apple)</p>
        <p className="mt-1 text-sm text-ink-soft">
          Told be ezt a linket a saját naptáradba („Feliratkozás URL alapján” / „Új naptár-előfizetés”) — az új
          foglalások automatikusan megjelennek benne.
        </p>
        <div className="mt-2 flex items-center gap-2 rounded-2xl bg-paper-alt p-2 pl-4">
          <span className="min-w-0 flex-1 truncate text-sm text-ink">{icsUrl}</span>
          <button
            type="button"
            onClick={() => copy(icsUrl, "ics")}
            className="shadow-card shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
          >
            {copiedWhich === "ics" ? "Másolva!" : "Másolás"}
          </button>
        </div>
      </div>
    </div>
  );
}

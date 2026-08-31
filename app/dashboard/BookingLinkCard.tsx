"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import { updateBookingLinkAction, type BookingLinkState } from "./actions";
import { FacebookGlyph, WhatsAppGlyph } from "@/components/icons/BrandIcons";
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
  const [editingSlug, setEditingSlug] = useState(false);

  const bookingUrl = `${siteUrl}/foglalas/${provider.slug}`;
  const icsUrl = `${siteUrl}/api/ics/${provider.ics_token}`;
  const shareText = `Foglalj nálam időpontot online, telefonhívás nélkül: ${provider.business_name}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingUrl)}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${bookingUrl}`)}`;
  const initial = provider.business_name.trim().charAt(0).toUpperCase() || "?";

  function copy(text: string, which: "link" | "ics") {
    navigator.clipboard?.writeText(text);
    setCopiedWhich(which);
    setTimeout(() => setCopiedWhich(null), 1500);
  }

  return (
    <div className="shadow-sheet overflow-hidden rounded-3xl bg-white">
      {/* Brandelt fejléc — a szolgáltató saját logójával/nevével, hogy a
          szekció ne egy generikus "itt a linked" doboznak hasson, hanem a
          saját, kiküldésre kész foglalási oldalának. */}
      <div className="flex items-center gap-3 bg-ink px-6 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
          {provider.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={provider.logo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-lg text-paper">{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg text-paper">{provider.business_name}</p>
          <p className="truncate text-xs text-paper/60">idopontneked.hu/foglalas/{provider.slug}</p>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm leading-relaxed text-ink-soft">
          Ez a saját foglalási oldalad. A <span className="font-semibold text-ink">meglévő vendégeid</span> is
          nyugodtan foglalhatnak rajta keresztül — nem kell hozzá regisztrálniuk, és téged sem kell közben
          hívniuk vagy üzenniük.
        </p>

        {provider.status === "pending" && (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            A link és a QR-kód már most elmenthető/kiosztható, de a foglalási oldal csak azután él, hogy a
            fiókodat jóváhagytuk — addig a vendégek 404-et kapnak rá.
          </p>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 rounded-2xl bg-paper-alt p-2 pl-4">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{bookingUrl}</span>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Foglalási oldal megnyitása új lapon"
                className="shrink-0 rounded-full p-2 text-ink-soft transition-colors hover:bg-panel hover:text-ink"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
              </a>
              <button
                type="button"
                onClick={() => copy(bookingUrl, "link")}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-ink/90"
              >
                {copiedWhich === "link" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />}
                {copiedWhich === "link" ? "Másolva" : "Másolás"}
              </button>
            </div>

            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Küldd ki a vendégeidnek
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-paper-alt px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
              >
                <WhatsAppGlyph className="h-3.5 w-3.5" />
                WhatsApp
              </a>
              <a
                href={fbShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-paper-alt px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
              >
                <FacebookGlyph className="h-3.5 w-3.5" />
                Facebook
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl bg-paper-alt p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR kód a foglalási linkhez" className="h-24 w-24 shrink-0 rounded-lg bg-white" />
            <div>
              <p className="text-xs font-semibold text-ink">QR-kód</p>
              <p className="mt-0.5 max-w-[9rem] text-[11px] leading-snug text-ink-soft">
                Tedd ki a szalonban, hogy helyben is le tudják olvasni.
              </p>
              <a
                href={qrDataUrl}
                download="foglalasi-link-qr.png"
                className="shadow-card mt-2 flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-panel"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                Letöltés
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          {editingSlug ? (
            <form action={formAction} className="flex flex-wrap items-end gap-3">
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
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
              >
                {pending ? "Mentés…" : "Mentés"}
              </button>
              <button
                type="button"
                onClick={() => setEditingSlug(false)}
                className="rounded-full bg-paper-alt px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-panel"
              >
                Mégse
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-soft">
                A link egyedi vége és a foglalási oldal be-/kikapcsolása itt módosítható.
              </p>
              <button
                type="button"
                onClick={() => setEditingSlug(true)}
                className="shrink-0 rounded-full bg-paper-alt px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
              >
                Link szerkesztése
              </button>
            </div>
          )}
          {state.status !== "idle" && (
            <p className={"mt-2 text-sm " + (state.status === "error" ? "text-red-700" : "text-accent-dark")}>
              {state.message}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-4">
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
              className="shadow-card flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel"
            >
              {copiedWhich === "ics" ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />}
              {copiedWhich === "ics" ? "Másolva" : "Másolás"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

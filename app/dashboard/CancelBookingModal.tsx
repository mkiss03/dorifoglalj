"use client";

import { useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { cancelBookingAction, type CancelBookingState } from "./actions";
import type { Booking } from "@/lib/supabase/types";

const initialState: CancelBookingState = { status: "idle" };

function formatDateTime(iso: string) {
  const formatted = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function CancelBookingModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(cancelBookingAction, initialState);

  useEffect(() => {
    if (state.status !== "success") return;
    const timer = setTimeout(onClose, 2200);
    return () => clearTimeout(timer);
  }, [state.status, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" onClick={onClose}>
      <div className="shadow-sheet w-full max-w-md rounded-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl text-ink">Foglalás lemondása</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bezárás"
            className="text-ink-soft/60 transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="mt-3 rounded-2xl bg-paper-alt px-4 py-3 text-sm">
          <p className="font-semibold text-ink">{booking.customer_name}</p>
          <p className="text-ink-soft">{booking.service_name}</p>
          <p className="text-ink-soft">{formatDateTime(booking.starts_at)}</p>
        </div>

        {state.status === "success" ? (
          <p className="mt-4 text-sm text-accent-dark">{state.message}</p>
        ) : (
          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="id" value={booking.id} />
            <div>
              <label className="text-xs font-semibold text-ink-soft">
                Üzenet a vendégnek (opcionális, bekerül az értesítő emailbe)
              </label>
              <textarea
                name="reason"
                rows={3}
                maxLength={500}
                placeholder="pl. sajnos közbejött valami, elnézést a kellemetlenségért"
                className="mt-1.5 w-full rounded-2xl bg-paper-alt px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light"
              />
            </div>

            {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-paper-alt px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-panel"
              >
                Mégse
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
              >
                {pending ? "Lemondás…" : "Foglalás lemondása"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

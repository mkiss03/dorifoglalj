import { cancelBookingAction } from "./actions";
import type { Booking } from "@/lib/supabase/types";

function formatBookingDt(iso: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Budapest",
  }).format(new Date(iso));
}

export function BookingsSection({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="shadow-sheet rounded-3xl bg-white p-6 lg:col-span-2">
      <h2 className="font-display text-xl text-ink">Közelgő foglalások</h2>

      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">Még nincs foglalásod.</p>
      ) : (
        <div className="mt-5 space-y-2.5">
          {bookings.map((b) => (
            <form
              key={b.id}
              action={cancelBookingAction}
              className="shadow-card flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper-alt/60 p-3.5"
            >
              <input type="hidden" name="id" value={b.id} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{formatBookingDt(b.starts_at)}</p>
                <p className="text-sm text-ink-soft">
                  {b.service_name} · {b.customer_name} · {b.customer_phone}
                </p>
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                Lemondás
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

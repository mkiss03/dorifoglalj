"use client";

import { Phone, X } from "lucide-react";
import type { Booking, StaffMember } from "@/lib/supabase/types";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("hu-HU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Budapest" }).format(
    new Date(iso)
  );
}

function formatDayHeader(d: Date) {
  const label = new Intl.DateTimeFormat("hu-HU", { weekday: "long", month: "long", day: "numeric" }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Heti lista nézet: a kiválasztott hét (hétfő–vasárnap) foglalásai
 * napokra bontva, időrendben — gyors áttekintéshez, ha csak egy hétre
 * kíváncsi a szolgáltató. */
export function WeekBookingsList({
  weekStart,
  bookings,
  staff,
  todayKey,
  onCancel,
  onOpenDay,
}: {
  weekStart: Date;
  bookings: Booking[];
  staff: StaffMember[];
  /** A "ma" nap a kliens órája szerint; null az első renderelésnél (hydration). */
  todayKey: string | null;
  onCancel: (b: Booking) => void;
  onOpenDay: (d: Date) => void;
}) {
  const staffName = new Map(staff.map((s) => [s.id, s.name]));
  const showStaff = staff.length > 1;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekBookings = bookings
    .filter((b) => {
      const t = new Date(b.starts_at);
      return t >= weekStart && t < weekEnd;
    })
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  return (
    <div>
      <p className="text-sm text-ink-soft">
        {weekBookings.length > 0 ? (
          <>
            <span className="font-semibold text-ink">{weekBookings.length} foglalás</span> ezen a héten
          </>
        ) : (
          "Ezen a héten nincs foglalásod."
        )}
      </p>

      <div className="mt-4 space-y-4">
        {days.map((d) => {
          const list = weekBookings.filter((b) => sameDay(new Date(b.starts_at), d));
          const isToday = todayKey !== null && d.toDateString() === todayKey;
          return (
            <div key={d.toDateString()}>
              <div className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5">
                <button
                  type="button"
                  onClick={() => onOpenDay(d)}
                  title="Megnyitás napi nézetben"
                  className={
                    "text-left text-sm font-semibold transition-colors hover:text-accent-dark " +
                    (isToday ? "text-accent-dark" : "text-ink")
                  }
                >
                  {formatDayHeader(d)}
                  {isToday && <span className="ml-2 text-xs font-medium">(ma)</span>}
                </button>
                <span className="shrink-0 text-xs text-ink-soft">
                  {list.length > 0 ? `${list.length} foglalás` : "nincs foglalás"}
                </span>
              </div>

              {list.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {list.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 rounded-xl bg-paper-alt px-3 py-2">
                      <span className="w-[5.5rem] shrink-0 text-sm font-semibold tabular-nums text-ink">
                        {formatTime(b.starts_at)}–{formatTime(b.ends_at)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{b.customer_name}</p>
                        <p className="truncate text-xs text-ink-soft">
                          {b.service_name}
                          {showStaff && staffName.get(b.staff_id) ? ` · ${staffName.get(b.staff_id)}` : ""}
                        </p>
                      </div>
                      {b.customer_phone && (
                        <a
                          href={`tel:${b.customer_phone}`}
                          className="hidden shrink-0 items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink sm:flex"
                        >
                          <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                          {b.customer_phone}
                        </a>
                      )}
                      {b.customer_phone && (
                        <a
                          href={`tel:${b.customer_phone}`}
                          aria-label={`Hívás: ${b.customer_name}`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-panel hover:text-ink sm:hidden"
                        >
                          <Phone className="h-4 w-4" strokeWidth={2} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => onCancel(b)}
                        aria-label="Lemondás"
                        title="Lemondás"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft/60 transition-colors hover:bg-accent-light hover:text-accent-dark"
                      >
                        <X className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { cancelBookingAction } from "./actions";
import type { Availability, Booking } from "@/lib/supabase/types";

const PX_PER_HOUR = 64;
const DEFAULT_START = 8;
const DEFAULT_END = 18;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** ISO hétköznap: 1=hétfő … 7=vasárnap (a JS getDay() 0=vasárnappal indul). */
function isoWeekday(d: Date) {
  return ((d.getDay() + 6) % 7) + 1;
}

function decimalHour(iso: string) {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function formatDayHeader(d: Date) {
  const label = new Intl.DateTimeFormat("hu-HU", { weekday: "long", month: "long", day: "numeric" }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("hu-HU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Budapest" }).format(
    new Date(iso)
  );
}

export function BookingsSection({
  bookings,
  availability,
}: {
  bookings: Booking[];
  availability: Availability[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const dayBookings = useMemo(
    () => bookings.filter((b) => sameDay(new Date(b.starts_at), selectedDate)),
    [bookings, selectedDate]
  );

  const { dayStart, dayEnd } = useMemo(() => {
    const weekday = isoWeekday(selectedDate);
    const rows = availability.filter((a) => a.weekday === weekday);

    let start = rows.length
      ? Math.min(...rows.map((r) => parseInt(r.start_time.slice(0, 2), 10)))
      : DEFAULT_START;
    let end = rows.length
      ? Math.max(...rows.map((r) => parseInt(r.end_time.slice(0, 2), 10) + (r.end_time.slice(3, 5) !== "00" ? 1 : 0)))
      : DEFAULT_END;

    // Ha egy foglalás a nyitvatartáson kívülre esne (pl. utólag módosított
    // nyitvatartás miatt), a rács ne vágja le — bővítsük ki érte.
    dayBookings.forEach((b) => {
      start = Math.min(start, Math.floor(decimalHour(b.starts_at)));
      end = Math.max(end, Math.ceil(decimalHour(b.ends_at)));
    });

    return { dayStart: start, dayEnd: Math.max(end, start + 1) };
  }, [availability, selectedDate, dayBookings]);

  const hours = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => dayStart + i);
  const gridHeight = (dayEnd - dayStart) * PX_PER_HOUR;

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p className="font-display text-lg text-ink">{formatDayHeader(selectedDate)}</p>
        <button
          type="button"
          onClick={() => setSelectedDate(new Date())}
          className="rounded-full bg-paper-alt px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-panel"
        >
          Ma
        </button>
      </div>

      <div className="flex gap-6 pt-4">
        <div className="hidden shrink-0 md:block md:w-44">
          <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} compact />
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative flex" style={{ height: gridHeight }}>
            <div style={{ width: 44 }} className="relative shrink-0">
              {hours.map((h) => (
                <span
                  key={h}
                  className="absolute left-0 -translate-y-1/2 text-[11px] font-medium tabular-nums text-ink-soft"
                  style={{ top: (h - dayStart) * PX_PER_HOUR }}
                >
                  {h}:00
                </span>
              ))}
            </div>
            <div className="relative flex-1 border-l border-line">
              {hours.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-line/70"
                  style={{ top: (h - dayStart) * PX_PER_HOUR }}
                />
              ))}
              {dayBookings.map((b) => {
                const start = decimalHour(b.starts_at);
                const end = decimalHour(b.ends_at);
                return (
                  <form
                    key={b.id}
                    action={cancelBookingAction}
                    className="shadow-card absolute inset-x-1 overflow-hidden rounded-xl border border-accent-dark/20 bg-accent-light/30 px-2.5 py-1.5 text-[11px] leading-tight"
                    style={{ top: (start - dayStart) * PX_PER_HOUR, height: Math.max((end - start) * PX_PER_HOUR, 30) }}
                  >
                    <input type="hidden" name="id" value={b.id} />
                    <p className="truncate pr-4 font-semibold text-ink">{b.customer_name}</p>
                    <p className="truncate pr-4 text-ink-soft">
                      {b.service_name} · {formatTime(b.starts_at)}
                    </p>
                    <button
                      type="submit"
                      aria-label="Lemondás"
                      title="Lemondás"
                      className="absolute right-1.5 top-1.5 text-ink-soft/60 transition-colors hover:text-accent-dark"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </form>
                );
              })}
            </div>
          </div>

          {dayBookings.length === 0 && (
            <p className="mt-4 text-sm text-ink-soft">Ezen a napon nincs foglalásod.</p>
          )}
        </div>
      </div>
    </div>
  );
}

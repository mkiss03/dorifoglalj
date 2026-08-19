"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { CancelBookingModal } from "./CancelBookingModal";
import type { Availability, Booking, StaffMember } from "@/lib/supabase/types";

const PX_PER_HOUR = 72;
const DEFAULT_START = 8;
const DEFAULT_END = 18;
// A rács ennél magasabbra nem nő — utána belül görgethető, hogy a fejléc
// (nap-váltó, mini naptár) mindig látható maradjon, ne "lógjon ki" semmi.
const MAX_TIMELINE_HEIGHT = 520;

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

function decimalHourNow() {
  const d = new Date();
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

const MIN_COLUMN_WIDTH = 200;

export function BookingsSection({
  bookings,
  availability,
  staff,
}: {
  bookings: Booking[];
  availability: Availability[];
  staff: StaffMember[];
}) {
  const columns = staff.length > 1 ? staff : null;

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [nowHour, setNowHour] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isToday = sameDay(selectedDate, new Date());

  // Csak kliens-oldalon állítjuk be (a szerver-renderelt "most" eltérne a
  // böngésző óráitól, ez hydration-mismatchet okozna), és percenként frissül.
  useEffect(() => {
    const tick = () => setNowHour(decimalHourNow());
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 60_000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

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
  const halfHours = hours.slice(0, -1).map((h) => h + 0.5);
  const gridHeight = (dayEnd - dayStart) * PX_PER_HOUR;

  // Nyitáskor/nap-váltáskor görgessünk a releváns időszakra (ma: a
  // jelenlegi órára, más napon: az első foglalásra), hogy semmi ne
  // maradjon "kilógva" a görgethető ablak fölött/alatt.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = isToday
      ? decimalHourNow()
      : dayBookings.length > 0
        ? Math.min(...dayBookings.map((b) => decimalHour(b.starts_at)))
        : dayStart;
    const clamped = Math.min(Math.max(target, dayStart), dayEnd);
    el.scrollTop = Math.max((clamped - dayStart) * PX_PER_HOUR - PX_PER_HOUR, 0);
  }, [selectedDate, dayStart, dayEnd, isToday, dayBookings]);

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 1);
              setSelectedDate(prev);
            }}
            aria-label="Előző nap"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:bg-panel hover:text-ink md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-display text-lg text-ink">{formatDayHeader(selectedDate)}</p>
          <button
            type="button"
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 1);
              setSelectedDate(next);
            }}
            aria-label="Következő nap"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:bg-panel hover:text-ink md:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMobileCalendar((v) => !v)}
            aria-label="Dátumválasztó"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-alt text-ink-soft transition-colors hover:bg-panel hover:text-ink md:hidden"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="rounded-full bg-paper-alt px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-panel"
          >
            Ma
          </button>
        </div>
      </div>

      {showMobileCalendar && (
        <div className="mt-3 border-b border-line pb-4 md:hidden">
          <MiniCalendar
            compact
            selected={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setShowMobileCalendar(false);
            }}
          />
        </div>
      )}

      <div className="flex gap-6 pt-4">
        <div className="hidden shrink-0 md:block md:w-72">
          <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          {columns && (
            <div className="flex" style={{ minWidth: columns.length * MIN_COLUMN_WIDTH + 44 }}>
              <div style={{ width: 44 }} className="shrink-0" />
              {columns.map((s) => (
                <div
                  key={s.id}
                  className="flex-1 truncate px-2 pb-2 text-center text-xs font-semibold text-ink"
                  style={{ minWidth: MIN_COLUMN_WIDTH }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}

          <div
            ref={scrollRef}
            className="overflow-y-auto overscroll-contain [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin]"
            style={{ maxHeight: Math.min(gridHeight, MAX_TIMELINE_HEIGHT) }}
          >
            <div
              className="relative flex"
              style={{ height: gridHeight, minWidth: columns ? columns.length * MIN_COLUMN_WIDTH + 44 : undefined }}
            >
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

              {(columns ?? [null]).map((s) => {
                const columnBookings = s ? dayBookings.filter((b) => b.staff_id === s.id) : dayBookings;
                return (
                  <div
                    key={s?.id ?? "solo"}
                    className="relative flex-1 border-l border-line"
                    style={{ minWidth: columns ? MIN_COLUMN_WIDTH : undefined }}
                  >
                    {halfHours.map((h) => (
                      <div
                        key={h}
                        className="absolute inset-x-0 border-t border-dashed border-line/40"
                        style={{ top: (h - dayStart) * PX_PER_HOUR }}
                      />
                    ))}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="absolute inset-x-0 border-t border-line/70"
                        style={{ top: (h - dayStart) * PX_PER_HOUR }}
                      />
                    ))}
                    {isToday && nowHour !== null && nowHour >= dayStart && nowHour <= dayEnd && (
                      <div
                        className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                        style={{ top: (nowHour - dayStart) * PX_PER_HOUR }}
                      >
                        <span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-accent-dark" />
                        <span className="h-px flex-1 bg-accent-dark" />
                      </div>
                    )}
                    {columnBookings.map((b) => {
                      const start = decimalHour(b.starts_at);
                      const end = decimalHour(b.ends_at);
                      return (
                        <div
                          key={b.id}
                          title={`${b.customer_name} · ${formatTime(b.starts_at)}–${formatTime(b.ends_at)}`}
                          className="shadow-card absolute inset-x-1 overflow-hidden rounded-xl border border-accent-dark/20 bg-accent-light/30 px-2.5 py-1.5 text-[11px] leading-tight transition-shadow hover:shadow-md"
                          style={{
                            top: (start - dayStart) * PX_PER_HOUR,
                            height: Math.max((end - start) * PX_PER_HOUR, 30),
                          }}
                        >
                          <p className="truncate pr-4 font-semibold text-ink">{b.customer_name}</p>
                          <p className="truncate pr-4 text-ink-soft">
                            {b.service_name} · {formatTime(b.starts_at)}–{formatTime(b.ends_at)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setCancelTarget(b)}
                            aria-label="Lemondás"
                            title="Lemondás"
                            className="absolute right-0.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full text-ink-soft/60 transition-colors hover:bg-accent-light hover:text-accent-dark active:scale-95"
                          >
                            <X className="h-4 w-4" strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {dayBookings.length === 0 && (
            <p className="mt-4 text-sm text-ink-soft">Ezen a napon nincs foglalásod.</p>
          )}
        </div>
      </div>

      {cancelTarget && <CancelBookingModal booking={cancelTarget} onClose={() => setCancelTarget(null)} />}
    </div>
  );
}

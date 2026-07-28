"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

const WEEKDAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const MONTH_NAMES = [
  "január", "február", "március", "április", "május", "június",
  "július", "augusztus", "szeptember", "október", "november", "december",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function MiniCalendar({
  selected,
  onSelect,
  compact = false,
}: {
  selected: Date | null;
  onSelect?: (d: Date) => void;
  compact?: boolean;
}) {
  const today = startOfDay(new Date());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const canGoPrev = new Date(viewYear, viewMonth, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className={clsx("shadow-card rounded-2xl bg-white", compact ? "w-full p-3" : "w-72 p-4")}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="flex h-6 w-6 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:opacity-25"
          aria-label="Előző hónap"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <p className={clsx("font-semibold text-ink", compact ? "text-xs" : "text-sm")}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-6 w-6 items-center justify-center text-ink-soft transition-colors hover:text-ink"
          aria-label="Következő hónap"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        className={clsx(
          "mt-2 grid grid-cols-7 text-center font-semibold text-ink-soft/70",
          compact ? "text-[9px]" : "text-[11px]"
        )}
      >
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">
            {compact ? w.slice(0, 1) : w}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const disabled = d < today;
          const isSelected = selected && startOfDay(selected).getTime() === d.getTime();
          return (
            <button
              type="button"
              key={i}
              disabled={disabled}
              onClick={() => onSelect?.(d)}
              className={clsx(
                "flex items-center justify-center rounded-full transition-colors duration-150",
                compact ? "h-6 text-[11px]" : "h-8 text-sm",
                disabled && "text-ink-soft/25",
                !disabled && !isSelected && "text-ink hover:bg-panel",
                isSelected && "bg-accent-dark text-paper"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { createBookingAction, type BookingFormState } from "./actions";
import type { CreateBookingResult, PublicProvider } from "@/lib/supabase/types";

const initialState: BookingFormState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

function formatHuf(n: number) {
  return new Intl.NumberFormat("hu-HU").format(n) + " Ft";
}

function formatSlotTime(iso: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Budapest",
  }).format(new Date(iso));
}

function toDateParam(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildIcsDataUri(opts: { title: string; start: string; end: string; description: string }) {
  const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IttFoglalj.hu//Booking//HU",
    "BEGIN:VEVENT",
    `UID:${uid}@ittfoglalj.hu`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(opts.start)}`,
    `DTEND:${dt(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(lines);
}

function BookingConfirmation({
  provider,
  result,
}: {
  provider: PublicProvider;
  result: Extract<CreateBookingResult, { ok: true }>;
}) {
  const icsHref = buildIcsDataUri({
    title: `${result.service_name} — ${provider.business_name}`,
    start: result.starts_at,
    end: result.ends_at,
    description: `Foglalás itt: ${provider.business_name}`,
  });

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-dark text-paper">
        <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
      </span>
      <h2 className="mt-4 font-display text-2xl text-ink">Foglalás visszaigazolva</h2>
      <p className="mt-2 text-ink-soft">
        {result.service_name} —{" "}
        {new Intl.DateTimeFormat("hu-HU", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Europe/Budapest",
        }).format(new Date(result.starts_at))}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{provider.business_name}</p>
      <a
        href={icsHref}
        download="foglalas.ics"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-ink/90"
      >
        Hozzáadás a naptárhoz
      </a>
    </div>
  );
}

export function BookingWidget({ provider }: { provider: PublicProvider }) {
  const [serviceId, setServiceId] = useState<string | null>(provider.services[0]?.id ?? null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<string[]>([]);
  // A `slotsKey`-hez tartozik a `slots` tartalma. Amíg a jelenlegi kérés
  // kulcsa nem egyezik ezzel, "töltés alatt" van — nincs külön setState
  // szükséges a betöltés-jelzéshez, renderelés közben derül ki.
  const [slotsKey, setSlotsKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(createBookingAction, initialState);

  const requestKey = serviceId ? `${serviceId}|${toDateParam(date)}` : null;
  const loadingSlots = requestKey !== null && requestKey !== slotsKey;

  useEffect(() => {
    // Ha nincs kiválasztott szolgáltatás, a szabad-időpont blokk (lentebb)
    // amúgy sincs kirenderelve — nincs mit lekérni.
    if (!serviceId) return;

    let cancelled = false;
    const key = `${serviceId}|${toDateParam(date)}`;
    const supabase = createClient();
    supabase
      .rpc("get_available_slots", {
        p_slug: provider.slug,
        p_service_id: serviceId,
        p_date: toDateParam(date),
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        setSlots(error || !data ? [] : (data as string[]));
        setSlotsKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date, provider.slug]);

  const selectedService = useMemo(
    () => provider.services.find((s) => s.id === serviceId) ?? null,
    [provider.services, serviceId]
  );

  if (state.status === "success" && state.result) {
    return <BookingConfirmation provider={provider} result={state.result} />;
  }

  if (provider.services.length === 0) {
    return (
      <div className="shadow-sheet rounded-3xl bg-white p-8 text-center text-[15px] text-ink-soft">
        Ez a szolgáltató még nem állított be foglalható szolgáltatást.
      </div>
    );
  }

  return (
    <div className="shadow-sheet rounded-3xl bg-white p-5 lg:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Szolgáltatás</p>
        <div className="mt-3 flex flex-col gap-2">
          {provider.services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setSelectedSlot(null);
              }}
              className={
                "flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors duration-200 " +
                (serviceId === s.id ? "bg-ink text-paper" : "bg-paper-alt text-ink hover:bg-panel")
              }
            >
              <span className="font-medium">{s.name}</span>
              <span className={"text-sm " + (serviceId === s.id ? "text-paper/70" : "text-ink-soft")}>
                {formatHuf(s.price_huf)} · {s.duration_minutes} perc
              </span>
            </button>
          ))}
        </div>
      </div>

      {serviceId && (
        <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-[auto_1fr]">
          <MiniCalendar
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setSelectedSlot(null);
            }}
            compact
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Szabad időpontok</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {loadingSlots && <p className="col-span-full text-sm text-ink-soft">Betöltés…</p>}
              {!loadingSlots && slots.length === 0 && (
                <p className="col-span-full text-sm text-ink-soft">Ezen a napon nincs szabad időpont.</p>
              )}
              {!loadingSlots &&
                slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={
                      "rounded-full py-2 text-sm font-semibold tabular-nums transition-colors duration-200 " +
                      (selectedSlot === slot
                        ? "bg-accent-dark text-paper"
                        : "bg-paper-alt text-ink-soft hover:bg-panel")
                    }
                  >
                    {formatSlotTime(slot)}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {selectedSlot && selectedService && (
        <form action={formAction} className="mt-6 space-y-3 border-t border-line pt-6">
          <input type="hidden" name="slug" value={provider.slug} />
          <input type="hidden" name="service_id" value={selectedService.id} />
          <input type="hidden" name="starts_at" value={selectedSlot} />

          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Foglalás véglegesítése</p>
          <input name="customer_name" required placeholder="Neved" className={inputClass} />
          <input name="customer_phone" required placeholder="Telefonszámod" className={inputClass} />
          <input name="customer_email" type="email" placeholder="E-mail címed (nem kötelező)" className={inputClass} />

          {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-ink/90 disabled:opacity-60"
          >
            {pending ? "Foglalás…" : `Foglalás — ${formatHuf(selectedService.price_huf)}`}
          </button>
        </form>
      )}
    </div>
  );
}

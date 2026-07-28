"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { createManualBookingAction, type ManualBookingState } from "./actions";
import type { ProviderService } from "@/lib/supabase/types";

const initialState: ManualBookingState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

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

function ManualBookingForm({ services, onDone }: { services: ProviderService[]; onDone: () => void }) {
  const [serviceId, setServiceId] = useState<string | null>(services[0]?.id ?? null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsKey, setSlotsKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(createManualBookingAction, initialState);

  // Render-idejű állapotváltás-figyelés (nem effect): amint a submit
  // sikeressé válik, zárjuk a panelt — a naptár a revalidatePath miatt
  // úgyis frissül.
  const [lastStatus, setLastStatus] = useState(state.status);
  if (state.status !== lastStatus) {
    setLastStatus(state.status);
    if (state.status === "success") onDone();
  }

  const requestKey = serviceId ? `${serviceId}|${toDateParam(date)}` : null;
  const loadingSlots = requestKey !== null && requestKey !== slotsKey;

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    const key = `${serviceId}|${toDateParam(date)}`;
    const supabase = createClient();
    supabase
      .rpc("get_own_available_slots", { p_service_id: serviceId, p_date: toDateParam(date) })
      .then(({ data, error }) => {
        if (cancelled) return;
        setSlots(error || !data ? [] : (data as string[]));
        setSlotsKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date]);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;

  return (
    <div className="shadow-card mt-3 rounded-2xl bg-paper-alt/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Szolgáltatás</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setServiceId(s.id);
              setSelectedSlot(null);
            }}
            className={
              "rounded-full px-3.5 py-2 text-sm font-medium transition-colors " +
              (serviceId === s.id ? "bg-ink text-paper" : "bg-white text-ink hover:bg-panel")
            }
          >
            {s.name} · {formatHuf(s.price_huf)}
          </button>
        ))}
      </div>

      {serviceId && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-[auto_1fr]">
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
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                      "rounded-full py-2 text-sm font-semibold tabular-nums transition-colors " +
                      (selectedSlot === slot ? "bg-accent-dark text-paper" : "bg-white text-ink-soft hover:bg-panel")
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
        <form action={formAction} className="mt-4 space-y-2 border-t border-line pt-4">
          <input type="hidden" name="service_id" value={selectedService.id} />
          <input type="hidden" name="starts_at" value={selectedSlot} />

          <div className="flex flex-wrap gap-2">
            <input name="customer_name" required placeholder="Vendég neve" className={`${inputClass} min-w-[10rem] flex-1`} />
            <input name="customer_phone" required placeholder="Telefonszám" className={`${inputClass} min-w-[10rem] flex-1`} />
          </div>
          <input name="customer_email" type="email" placeholder="E-mail (nem kötelező)" className={inputClass} />

          {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
          >
            {pending ? "Mentés…" : "Foglalás felvétele"}
          </button>
        </form>
      )}
    </div>
  );
}

export function ManualBookingPanel({ services }: { services: ProviderService[] }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const activeServices = services.filter((s) => s.active);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-ink/90"
      >
        {open ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
        Új időpont
      </button>

      {open && activeServices.length === 0 && (
        <p className="mt-3 text-sm text-ink-soft">
          Nincs aktív szolgáltatásod — vegyél fel egyet a Szolgáltatások fülön.
        </p>
      )}

      {open && activeServices.length > 0 && (
        <ManualBookingForm
          key={formKey}
          services={activeServices}
          onDone={() => {
            setOpen(false);
            setFormKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}

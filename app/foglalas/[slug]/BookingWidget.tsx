"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { createBookingAction, type BookingFormState } from "./actions";
import type { CreateBookingResult, CreateHoldResult, PublicProvider } from "@/lib/supabase/types";

const initialState: BookingFormState = { status: "idle" };

const inputClass =
  "w-full rounded-2xl bg-paper-alt px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-accent-light";

const HOLD_ERROR_MESSAGES: Record<string, string> = {
  provider_not_found: "Ez a foglalási oldal jelenleg nem elérhető.",
  service_not_found: "Ez a szolgáltatás nem található.",
  staff_not_found: "Ez a munkatárs nem érhető el.",
  staff_not_eligible: "Ez a munkatárs nem végzi ezt a szolgáltatást.",
  in_past: "Ez az időpont már elmúlt — válassz másikat.",
  outside_hours: "Ez az időpont már nem elérhető — válassz másikat.",
  slot_blocked: "Ez az időpont már nem elérhető — válassz másikat.",
  slot_taken: "Ezt az időpontot időközben lefoglalták — válassz másikat.",
};

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

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function releaseHoldReliably(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;
  // `keepalive: true` kell ide — a supabase-js kliens sima fetch-hívása
  // megszakadna, ha a felhasználó épp ekkor zárja be a fület vagy tölti
  // újra az oldalt (a böngésző lő eldobja a navigáció alatt induló, nem
  // "keepalive" kéréseket), így a zárolás phantom módon a lejáratáig
  // (5 percig) állva maradna.
  void fetch(`${url}/rest/v1/rpc/release_hold`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ p_hold_token: token }),
  }).catch(() => {});
}

function buildIcsDataUri(opts: { title: string; start: string; end: string; description: string }) {
  const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const uid = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IdőpontNeked.hu//Booking//HU",
    "BEGIN:VEVENT",
    `UID:${uid}@idopontneked.hu`,
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
  const [staffId, setStaffId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(() => new Date());
  const [slots, setSlots] = useState<string[]>([]);
  // A `slotsKey`-hez tartozik a `slots` tartalma. Amíg a jelenlegi kérés
  // kulcsa nem egyezik ezzel, "töltés alatt" van — nincs külön setState
  // szükséges a betöltés-jelzéshez, renderelés közben derül ki.
  const [slotsKey, setSlotsKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Amint a vendég rákattint egy sávra, a rendszer rövid időre ténylegesen
  // lezárolja neki (create_hold RPC) — így amíg az űrlapot tölti ki, más
  // nem kaphatja meg ugyanazt/átfedő időpontot.
  const [holding, setHolding] = useState(false);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const [state, formAction, pending] = useActionState(createBookingAction, initialState);

  const selectedService = useMemo(
    () => provider.services.find((s) => s.id === serviceId) ?? null,
    [provider.services, serviceId]
  );
  // Csak azok a munkatársak, akik a kiválasztott szolgáltatást végzik.
  // Ha pontosan 1 ilyen van, csendben őt választjuk — a választó csak
  // akkor jelenik meg, ha valódi döntés van (több jogosult munkatárs).
  const eligibleStaff = useMemo(
    () => (selectedService ? provider.staff.filter((s) => selectedService.staff_ids.includes(s.id)) : []),
    [provider.staff, selectedService]
  );
  const effectiveStaffId = staffId ?? (eligibleStaff.length === 1 ? eligibleStaff[0].id : null);

  const requestKey =
    serviceId && effectiveStaffId ? `${serviceId}|${effectiveStaffId}|${toDateParam(date)}` : null;
  const loadingSlots = requestKey !== null && requestKey !== slotsKey;

  useEffect(() => {
    // Amíg nincs kiválasztott szolgáltatás ÉS munkatárs, a szabad-időpont
    // blokk (lentebb) amúgy sincs kirenderelve — nincs mit lekérni.
    if (!serviceId || !effectiveStaffId) return;

    let cancelled = false;
    const key = `${serviceId}|${effectiveStaffId}|${toDateParam(date)}`;
    const supabase = createClient();
    supabase
      .rpc("get_available_slots", {
        p_slug: provider.slug,
        p_service_id: serviceId,
        p_staff_id: effectiveStaffId,
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
  }, [serviceId, effectiveStaffId, date, provider.slug]);

  // A korábbi zárolást mindig feloldjuk, amint másikra váltunk (vagy a
  // widget elhagyásakor) — a cleanup a `holdToken` MINDEN változásakor
  // lefut, nem csak unmountkor, így ez az egyetlen hely, ahol a release
  // hívás történik.
  useEffect(() => {
    if (!holdToken) return;
    const token = holdToken;
    return () => {
      releaseHoldReliably(token);
    };
  }, [holdToken]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  const holdRemainingMs = holdExpiresAt ? new Date(holdExpiresAt).getTime() - nowTick : 0;
  const holdExpired = holdToken !== null && holdRemainingMs <= 0;

  async function selectSlot(slot: string) {
    if (!selectedService || !effectiveStaffId || holding) return;

    const previousToken = holdToken;
    setSelectedSlot(null);
    setHoldError(null);
    setHolding(true);

    const supabase = createClient();

    // Ha volt aktív zárolásunk (ugyanerre vagy egy másik sávra), előbb
    // MEGVÁRVA szabadítjuk fel, mielőtt újat kérnénk. Enélkül a két hívás
    // versenyezne: ha a create_hold a szerveren előbb futna le, mint a
    // release_hold törlése, a saját (még nem törölt) korábbi zárolásunkba
    // ütközne — pont ez okozta, hogy egy szabad sávra kattintva időnként
    // "már lefoglalták" hibát kaptunk.
    if (previousToken) {
      await supabase.rpc("release_hold", { p_hold_token: previousToken });
    }

    const { data, error } = await supabase.rpc("create_hold", {
      p_slug: provider.slug,
      p_service_id: selectedService.id,
      p_staff_id: effectiveStaffId,
      p_starts_at: slot,
    });

    setHolding(false);

    if (error || !data) {
      setHoldToken(null);
      setHoldExpiresAt(null);
      setHoldError("Nem sikerült lefoglalni ezt az időpontot. Próbáld újra.");
      return;
    }

    const result = data as CreateHoldResult;
    if (!result.ok) {
      setHoldToken(null);
      setHoldExpiresAt(null);
      setHoldError(HOLD_ERROR_MESSAGES[result.error] ?? "Nem sikerült lefoglalni ezt az időpontot.");
      setSlots((prev) => prev.filter((s) => s !== slot));
      return;
    }

    setHoldToken(result.hold_token);
    setHoldExpiresAt(result.expires_at);
    setSelectedSlot(slot);
  }

  function resetSelection() {
    setSelectedSlot(null);
    setHoldError(null);
    // Szándékosan NEM ürítjük itt a holdToken-t/holdExpiresAt-et: a
    // zárolás a háttérben tovább él (mást úgysem engedne be), és a
    // selectSlot majd megvárva szabadítja fel, amikor tényleg új sávot
    // választanak — így ez sem versenyezhet egy másik hívással. Ha a
    // vendég inkább elhagyja az oldalt, az unmount-effekt gondoskodik
    // a felszabadításról.
  }

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
                setStaffId(null);
                resetSelection();
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

      {serviceId && eligibleStaff.length === 0 && (
        <p className="mt-6 border-t border-line pt-6 text-sm text-ink-soft">
          Ehhez a szolgáltatáshoz jelenleg nincs elérhető munkatárs.
        </p>
      )}

      {serviceId && eligibleStaff.length > 1 && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Munkatárs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {eligibleStaff.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStaffId(s.id);
                  resetSelection();
                }}
                className={
                  "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-left transition-colors duration-200 " +
                  (effectiveStaffId === s.id ? "bg-ink text-paper" : "bg-paper-alt text-ink hover:bg-panel")
                }
              >
                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo_url} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent-dark">
                    {s.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                )}
                <span>
                  <span className="block text-sm font-medium">{s.name}</span>
                  {s.specialty && (
                    <span className={"block text-xs " + (effectiveStaffId === s.id ? "text-paper/70" : "text-ink-soft")}>
                      {s.specialty}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {serviceId && effectiveStaffId && (
        <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-[auto_1fr]">
          <MiniCalendar
            selected={date}
            onSelect={(d) => {
              setDate(d);
              resetSelection();
            }}
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
                    disabled={holding}
                    onClick={() => selectSlot(slot)}
                    className={
                      "rounded-full py-2 text-sm font-semibold tabular-nums transition-colors duration-200 disabled:opacity-50 " +
                      (selectedSlot === slot
                        ? "bg-accent-dark text-paper"
                        : "bg-paper-alt text-ink-soft hover:bg-panel")
                    }
                  >
                    {formatSlotTime(slot)}
                  </button>
                ))}
            </div>
            {holding && <p className="mt-2 text-sm text-ink-soft">Időpont rögzítése…</p>}
            {holdError && <p className="mt-2 text-sm text-red-700">{holdError}</p>}
          </div>
        </div>
      )}

      {selectedSlot && selectedService && effectiveStaffId && holdToken && !holdExpired && (
        <form action={formAction} className="mt-6 space-y-3 border-t border-line pt-6">
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="hp_website">Ne töltsd ki ezt a mezőt</label>
            <input id="hp_website" name="hp_website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <input type="hidden" name="slug" value={provider.slug} />
          <input type="hidden" name="service_id" value={selectedService.id} />
          <input type="hidden" name="staff_id" value={effectiveStaffId} />
          <input type="hidden" name="starts_at" value={selectedSlot} />
          <input type="hidden" name="hold_token" value={holdToken} />

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Foglalás véglegesítése</p>
            <p className="flex items-center gap-1 text-xs font-semibold tabular-nums text-accent-dark">
              <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
              {formatCountdown(holdRemainingMs)}
            </p>
          </div>
          <p className="text-xs text-ink-soft">Ennyi ideig tartjuk neked ezt az időpontot.</p>
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

      {holdExpired && (
        <div className="mt-6 border-t border-line pt-6">
          <p className="text-sm text-red-700">A foglalási idő lejárt — válaszd ki újra az időpontot.</p>
        </div>
      )}
    </div>
  );
}

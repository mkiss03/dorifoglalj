import Link from "next/link";
import { getUser, createClient } from "@/lib/supabase/server";
import type { Availability, Booking, Provider, ProviderService } from "@/lib/supabase/types";
import { BookingsSection } from "./BookingsSection";
import { ManualBookingPanel } from "./ManualBookingPanel";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default async function DashboardOverviewPage() {
  const user = await getUser();
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const in7Days = new Date(startOfToday);
  in7Days.setDate(in7Days.getDate() + 7);

  const [{ data: provider }, { data: services }, { data: availability }, { data: bookings }] = await Promise.all([
    supabase.from("providers").select("*").eq("id", user!.id).single(),
    supabase.from("provider_services").select("*").eq("provider_id", user!.id).order("created_at"),
    supabase.from("provider_availability").select("*").eq("provider_id", user!.id).order("weekday"),
    supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", user!.id)
      .eq("status", "confirmed")
      .gte("starts_at", startOfToday.toISOString())
      .order("starts_at"),
  ]);

  const typedProvider = provider as Provider | null;
  const typedServices = (services ?? []) as ProviderService[];
  const typedAvailability = (availability ?? []) as Availability[];
  const typedBookings = (bookings ?? []) as Booking[];

  const todayCount = typedBookings.filter((b) => sameDay(new Date(b.starts_at), startOfToday)).length;
  const weekCount = typedBookings.filter((b) => new Date(b.starts_at) < in7Days).length;
  const activeServiceCount = typedServices.filter((s) => s.active).length;
  const bookingActive = typedProvider?.booking_enabled ?? false;

  return (
    <section>
      <h1 className="font-display text-3xl text-ink">Áttekintés</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Napi és heti helyzetkép, plusz a teljes naptárad egy helyen.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="shadow-sheet rounded-3xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Mai foglalások</p>
          <p className="mt-1 font-display text-2xl text-ink">{todayCount}</p>
        </div>
        <div className="shadow-sheet rounded-3xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Heti foglalások</p>
          <p className="mt-1 font-display text-2xl text-ink">{weekCount}</p>
        </div>
        <div className="shadow-sheet rounded-3xl bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Aktív szolgáltatás</p>
          <p className="mt-1 font-display text-2xl text-ink">{activeServiceCount}</p>
        </div>
        <Link
          href="/dashboard/megosztas"
          className="shadow-sheet rounded-3xl bg-white p-4 transition-colors hover:bg-panel"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Foglalási oldal</p>
          <p
            className={
              "mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
              (bookingActive ? "bg-accent-light text-accent-dark" : "bg-paper-alt text-ink-soft")
            }
          >
            {bookingActive ? "Aktív" : "Inaktív"}
          </p>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">Naptár</h2>
        <ManualBookingPanel services={typedServices} />
      </div>

      <div className="mt-3">
        <BookingsSection bookings={typedBookings} availability={typedAvailability} />
      </div>
    </section>
  );
}

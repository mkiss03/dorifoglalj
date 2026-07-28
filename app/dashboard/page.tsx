import { headers } from "next/headers";
import { getUser, createClient } from "@/lib/supabase/server";
import type { Availability, Booking, Provider, ProviderService } from "@/lib/supabase/types";
import { Container } from "@/components/ui/Container";
import { ProfileForm } from "./ProfileForm";
import { ServicesSection } from "./ServicesSection";
import { AvailabilitySection } from "./AvailabilitySection";
import { BookingLinkCard } from "./BookingLinkCard";
import { BookingsSection } from "./BookingsSection";

export default async function DashboardPage() {
  const user = await getUser();
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

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

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const siteUrl = `${protocol}://${host}`;

  return (
    <section className="py-10 lg:py-14">
      <Container>
        <h1 className="font-display text-3xl text-ink">Irányítópult</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Itt szerkesztheted a szolgáltatói profilodat, a nyitvatartásodat és a foglalásaidat.
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ProfileForm provider={provider as Provider | null} />
          <ServicesSection services={(services ?? []) as ProviderService[]} />
          <AvailabilitySection availability={(availability ?? []) as Availability[]} />
          {provider && <BookingLinkCard provider={provider as Provider} siteUrl={siteUrl} />}
          <BookingsSection
            bookings={(bookings ?? []) as Booking[]}
            availability={(availability ?? []) as Availability[]}
          />
        </div>
      </Container>
    </section>
  );
}

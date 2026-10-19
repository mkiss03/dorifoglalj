import { createAdminClient } from "@/lib/supabase/admin";
import { sendProviderNewBookingEmail } from "@/lib/email/sendProviderNewBookingEmail";

type BookingRow = {
  provider_id: string;
  service_name: string;
  price_huf: number | null;
  starts_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  providers: { business_name: string } | null;
  staff_members: { name: string } | null;
};

/** A szolgáltató bejelentkezési e-mail-címe csak az auth sémában van, amit
 * a vendég (anon) munkamenete nem olvashat — ezért a titkos kulcsos
 * szerveroldali kliens kell hozzá. Kulcs nélkül csendben kimarad. */
export async function notifyProviderOfBooking(bookingId: string, siteUrl: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    console.warn("[notifyProviderOfBooking] SUPABASE_SECRET_KEY nincs beállítva, a szolgáltatói értesítő kimarad.");
    return;
  }

  const { data, error } = await admin
    .from("bookings")
    .select(
      "provider_id, service_name, price_huf, starts_at, customer_name, customer_phone, customer_email, providers(business_name), staff_members(name)"
    )
    .eq("id", bookingId)
    .single();
  if (error || !data) {
    console.error("[notifyProviderOfBooking] A foglalás nem olvasható:", error?.message);
    return;
  }
  const b = data as unknown as BookingRow;

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(b.provider_id);
  const to = userData?.user?.email;
  if (userError || !to) {
    console.error("[notifyProviderOfBooking] A szolgáltató e-mail-címe nem olvasható:", userError?.message);
    return;
  }

  const result = await sendProviderNewBookingEmail({
    to,
    providerName: b.providers?.business_name ?? "",
    serviceName: b.service_name,
    priceHuf: b.price_huf,
    startsAt: b.starts_at,
    staffName: b.staff_members?.name ?? null,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    customerEmail: b.customer_email,
    siteUrl,
  });
  if (!result.ok) {
    console.error("[notifyProviderOfBooking] Az értesítő nem ment ki:", result.error);
  }
}

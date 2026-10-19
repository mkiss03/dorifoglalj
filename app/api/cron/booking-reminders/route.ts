import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/resend";
import { buildBookingReminderEmail } from "@/lib/email/bookingReminderEmail";
import { budapestTomorrowRange } from "@/lib/time/budapest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ReminderRow = {
  id: string;
  starts_at: string;
  service_name: string;
  customer_name: string;
  customer_email: string;
  providers: { business_name: string; phone: string | null; address: string | null; city: string | null } | null;
  staff_members: { name: string } | null;
};

const BATCH_SIZE = 100; // a Resend batch API egy hívásban legfeljebb 100 levelet fogad

/** Naponta egyszer fut (vercel.json → crons). A holnapi (budapesti naptári
 * napra eső), érvényes foglalások vendégeinek küld emlékeztetőt, ha
 * megadtak e-mail-címet; a kiküldést a reminder_sent_at jelöli, így egy
 * újrafuttatás nem küld duplán. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const resend = getResendClient();
  if (!admin || !resend) {
    console.error("[booking-reminders] Hiányzó SUPABASE_SECRET_KEY vagy RESEND_API_KEY.");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const { day, start, end } = budapestTomorrowRange();
  const { data, error } = await admin
    .from("bookings")
    .select(
      "id, starts_at, service_name, customer_name, customer_email, providers(business_name, phone, address, city), staff_members(name)"
    )
    .eq("status", "confirmed")
    .not("customer_email", "is", null)
    .is("reminder_sent_at", null)
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString())
    .order("starts_at")
    .limit(1000);

  if (error) {
    console.error("[booking-reminders] Lekérdezési hiba:", error.message);
    return NextResponse.json({ ok: false, error: "query_failed" }, { status: 500 });
  }

  const rows = ((data ?? []) as unknown as ReminderRow[]).filter((r) => r.customer_email.trim());
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const emails = chunk.map((r) =>
      buildBookingReminderEmail({
        to: r.customer_email.trim(),
        customerName: r.customer_name,
        providerName: r.providers?.business_name ?? "a szolgáltató",
        providerPhone: r.providers?.phone ?? null,
        providerAddress: r.providers?.address ?? null,
        providerCity: r.providers?.city ?? null,
        serviceName: r.service_name,
        startsAt: r.starts_at,
        staffName: r.staff_members?.name ?? null,
      })
    );

    const { error: sendError } = await resend.batch.send(emails);
    if (sendError) {
      failed += chunk.length;
      console.error("[booking-reminders] Kiküldési hiba:", sendError.message);
      continue;
    }

    const { error: markError } = await admin
      .from("bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .in(
        "id",
        chunk.map((r) => r.id)
      );
    if (markError) console.error("[booking-reminders] Jelölési hiba:", markError.message);
    sent += chunk.length;
  }

  console.log(`[booking-reminders] ${day}: ${sent} elküldve, ${failed} sikertelen, ${rows.length} esedékes.`);
  return NextResponse.json({ ok: true, day, due: rows.length, sent, failed });
}

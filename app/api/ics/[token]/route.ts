import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type IcsBookingRow = {
  id: string;
  service_name: string;
  starts_at: string;
  ends_at: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatDt(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ics_bookings", { p_token: token });

  if (error) {
    return new NextResponse("Not found", { status: 404 });
  }

  const bookings = (data ?? []) as IcsBookingRow[];

  const events = bookings
    .map((b) =>
      [
        "BEGIN:VEVENT",
        `UID:${b.id}@idopontneked.hu`,
        `DTSTAMP:${formatDt(b.created_at)}`,
        `DTSTART:${formatDt(b.starts_at)}`,
        `DTEND:${formatDt(b.ends_at)}`,
        `SUMMARY:${escapeIcs(`${b.service_name} · ${b.customer_name}`)}`,
        `DESCRIPTION:${escapeIcs(`Tel: ${b.customer_phone}`)}`,
        "END:VEVENT",
      ].join("\r\n")
    )
    .join("\r\n");

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IdőpontNeked.hu//Bookings//HU",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:IdőpontNeked foglalások",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    events,
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="foglalasok.ics"',
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type IcsEvent = {
  id: string;
  service_name: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  /** null, ha a szolgáltató a naptárban elrejtette a vendég adatait. */
  customer_name: string | null;
  customer_phone: string | null;
  /** Csak a szolgáltató összesítő naptárában, több munkatárs esetén. */
  staff_name?: string | null;
};

type IcsFeed = { name: string; events: IcsEvent[] };

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatDt(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

async function loadFeed(token: string): Promise<IcsFeed | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ics_feed", { p_token: token });
  if (!error) return (data as IcsFeed | null) ?? null;

  // A schema_v24 lefuttatása előtt a get_ics_feed még nem létezik — addig a
  // régi, összesítő lekérdezéssel szolgálunk ki, hogy a meglévő naptár-
  // feliratkozások ne álljanak le.
  const legacy = await supabase.rpc("get_ics_bookings", { p_token: token });
  if (legacy.error) return null;
  return { name: "IdőpontNeked foglalások", events: (legacy.data ?? []) as IcsEvent[] };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const feed = await loadFeed(token);

  if (!feed) {
    return new NextResponse("Not found", { status: 404 });
  }

  const events = feed.events
    .map((b) => {
      const summary = [b.service_name, b.customer_name].filter(Boolean).join(" · ") + (b.staff_name ? ` (${b.staff_name})` : "");
      const description = [b.customer_phone ? `Tel: ${b.customer_phone}` : null, b.staff_name ? `Munkatárs: ${b.staff_name}` : null]
        .filter(Boolean)
        .join("\n");
      return [
        "BEGIN:VEVENT",
        `UID:${b.id}@idopontneked.hu`,
        `DTSTAMP:${formatDt(b.created_at)}`,
        `DTSTART:${formatDt(b.starts_at)}`,
        `DTEND:${formatDt(b.ends_at)}`,
        `SUMMARY:${escapeIcs(summary)}`,
        description ? `DESCRIPTION:${escapeIcs(description)}` : null,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IdőpontNeked.hu//Bookings//HU",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcs(feed.name)}`,
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

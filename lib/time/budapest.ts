const TZ = "Europe/Budapest";
const DAY_MS = 24 * 60 * 60 * 1000;

/** A budapesti naptári nap ("2026-10-20") egy adott pillanatban. */
export function budapestDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** A budapesti éjfél UTC-ben. Az eltolást 00:00 UTC-kor mérjük: az még a
 * hajnali (01:00 UTC-s) óraátállítás előtt van, így az éjfélkor érvényes
 * eltolást adja a váltás napján is. */
function budapestMidnightUtc(ymd: string): Date {
  const probe = new Date(`${ymd}T00:00:00Z`);
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = name?.match(/GMT([+-])(\d{2}):(\d{2})/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  return new Date(probe.getTime() - offsetMin * 60 * 1000);
}

function addDays(ymd: string, days: number): string {
  return new Date(Date.parse(`${ymd}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** A "holnap" (budapesti naptári nap) [kezdete, vége) UTC-ben. */
export function budapestTomorrowRange(now: Date = new Date()): { day: string; start: Date; end: Date } {
  const tomorrow = addDays(budapestDate(now), 1);
  return { day: tomorrow, start: budapestMidnightUtc(tomorrow), end: budapestMidnightUtc(addDays(tomorrow, 1)) };
}

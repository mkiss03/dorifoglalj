import { headers } from "next/headers";

type RateLimitRecord = {
  timestamps: number[];
};

const store = new Map<string, RateLimitRecord>();

/** Időszakos takarítás a memóriaszemét ellen (5 percenként). */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/** Lekéri a kliens IP-címét a HTTP fejlécekből (Vercel / reverse proxy mögött is megbízható). */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const xff = headersList.get("x-forwarded-for");
    if (xff) {
      const firstIp = xff.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) return realIp.trim();
  } catch {
    // Server Component/Action kontextuson kívül hívva nincs headers()
  }
  return "127.0.0.1";
}

/** Csúszóablakos (sliding window) rate limit ellenőrzés IP alapon. `success: true`
 * az engedélyezett korláton belül, `success: false` túllépés esetén. */
export async function checkRateLimit(
  actionKey: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): Promise<{ success: boolean; remaining: number }> {
  const ip = await getClientIp();
  const key = `${actionKey}:${ip}`;
  const now = Date.now();

  cleanupStaleEntries(windowMs);

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  return { success: true, remaining: limit - record.timestamps.length };
}

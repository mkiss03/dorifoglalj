import { headers } from "next/headers";

/** Az aktuális kérés abszolút origin-je (pl. "https://idopontneked.hu" vagy
 * "http://localhost:3000") — a `host` fejlécből számolva. Nem biztonsági
 * célra való (a `Host` fejléc elméletileg hamisítható) — kizárólag
 * megjelenítési célú linkekhez használjuk (pl. megosztható foglalási link,
 * QR-kód a dashboardon), ahol egy hamis érték legrosszabb esetben egy rossz
 * linket mutat a bejelentkezett szolgáltatónak, semmi érzékenyet nem árul
 * el és nem enged át. Auth-email redirecthez NE ezt használd — arra lásd
 * `getTrustedSiteUrl()`. */
export async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

/** Megbízható, fix origin auth-email redirect linkekhez (jelszó-
 * visszaállítás, magic link, email-cím módosítás) — ezeknél a `Host`
 * fejlécre hagyatkozni "password reset poisoning" kockázatot jelentene
 * (hamis `Host`-tal küldött kérés esetén a felhasználónak kiküldött email
 * egy támadó által irányított domainre mutató, de érvényes tokent
 * tartalmazó linket kapna). Ehelyett a `NEXT_PUBLIC_SITE_URL` env-
 * változót olvassuk — ezt kell beállítani a production/preview Vercel
 * környezetekben (pl. "https://idopontneked.hu"). Helyi fejlesztéshez,
 * ha nincs beállítva, visszaesünk a `Host` fejlécre. */
export async function getTrustedSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return getSiteUrl();
}

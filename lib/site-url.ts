import { headers } from "next/headers";

/** Az aktuális kérés abszolút origin-je a `host` fejlécből számolva.
 * Nem biztonsági célra való, csak megjelenítési linkekhez (pl. megosztható
 * foglalási link, QR-kód). Auth-email redirecthez használd inkább a
 * `getTrustedSiteUrl()`-t. */
export async function getSiteUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

/** Megbízható, fix origin auth-email redirectekhez (jelszó-visszaállítás,
 * magic link, email-cím módosítás). A `Host` fejlécre hagyatkozni itt
 * "password reset poisoning" kockázatot jelentene, ezért a
 * `NEXT_PUBLIC_SITE_URL` env-változót olvassuk; helyi fejlesztéshez, ha
 * nincs beállítva, visszaesünk a `Host` fejlécre. */
export async function getTrustedSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return getSiteUrl();
}

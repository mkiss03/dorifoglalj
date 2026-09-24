import { getResendClient, RESEND_FROM_EMAIL } from "./resend";
import { escapeHtml } from "./escapeHtml";
import { SUPPORT_EMAIL } from "@/lib/contact";

export type SendProviderApprovedEmailParams = {
  to: string;
  businessName: string;
  slug: string;
  siteUrl: string;
};

export type SendProviderApprovedEmailResult =
  | { ok: true }
  | { ok: false; error: "missing_api_key" | "send_failed" };

/** A szolgáltatónak megy ki, amikor az admin jóváhagyja a regisztrációját.
 * "Best effort": ha nincs `RESEND_API_KEY` vagy a küldés elhasal, a
 * jóváhagyás attól még megtörtént — a hívó elnyeli a hibát. */
export async function sendProviderApprovedEmail(
  params: SendProviderApprovedEmailParams
): Promise<SendProviderApprovedEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const base = params.siteUrl.replace(/\/$/, "");
  const dashboardUrl = `${base}/dashboard`;
  const bookingUrl = `${base}/foglalas/${encodeURIComponent(params.slug)}`;

  const text = `Szia!\n\nJóváhagytuk a(z) ${params.businessName} regisztrációját az IdőpontNeked.hu-n. A profilod mostantól megjelenik a keresőben, a vendégek pedig online foglalhatnak nálad.\n\nA foglalási oldalad: ${bookingUrl}\nA fiókod kezelése: ${dashboardUrl}\n\nHa még nem tetted meg, érdemes feltölteni a szolgáltatásaidat, a nyitvatartásodat és egy borítóképet, hogy a vendégek szabad időpontot is lássanak.\n\nKérdés esetén írj nekünk: ${SUPPORT_EMAIL}\n\nÜdv,\nIdőpontNeked.hu`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p>Szia!</p>
      <p>
        Jóváhagytuk a(z) <strong>${escapeHtml(params.businessName)}</strong> regisztrációját az IdőpontNeked.hu-n.
        A profilod mostantól megjelenik a keresőben, a vendégek pedig online foglalhatnak nálad.
      </p>
      <p>
        <a href="${dashboardUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 600;">
          Belépés a fiókomba
        </a>
      </p>
      <p>
        A foglalási oldalad, amit a vendégeidnek is elküldhetsz:<br />
        <a href="${bookingUrl}" style="color: #B2224C;">${bookingUrl}</a>
      </p>
      <p style="color: #6b6b6b; font-size: 13px;">
        Ha még nem tetted meg, érdemes feltölteni a szolgáltatásaidat, a nyitvatartásodat és egy borítóképet,
        hogy a vendégek szabad időpontot is lássanak. Kérdés esetén írj nekünk: ${SUPPORT_EMAIL}
      </p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    replyTo: SUPPORT_EMAIL,
    subject: "Jóváhagytuk a regisztrációdat – IdőpontNeked.hu",
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

import { getResendClient, RESEND_FROM_EMAIL } from "./resend";
import { escapeHtml } from "./escapeHtml";
import { ADMIN_NOTIFICATION_EMAIL } from "@/lib/contact";

export type SendProviderSignupNotificationEmailParams = {
  businessName: string;
  email: string;
  /** Az oldal megbízható origin-je — ebből épül a jóváhagyó panel linkje. */
  siteUrl: string;
};

export type SendProviderSignupNotificationEmailResult =
  | { ok: true }
  | { ok: false; error: "missing_api_key" | "send_failed" };

function formatNow(): string {
  const formatted = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Azonnali értesítő az adminnak minden új szolgáltatói regisztrációról,
 * hogy a jóváhagyás ne múljon azon, mikor nézi meg valaki a listát.
 * Szándékosan "best effort": ha nincs `RESEND_API_KEY`, vagy a küldés
 * elhasal, a regisztráció attól még sikeres — a hívó fél elnyeli a hibát. */
export async function sendProviderSignupNotificationEmail(
  params: SendProviderSignupNotificationEmailParams
): Promise<SendProviderSignupNotificationEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const adminUrl = `${params.siteUrl.replace(/\/$/, "")}/admin/szolgaltatok?status=pending`;
  const when = formatNow();

  const text = `Új szolgáltatói regisztráció érkezett.\n\nVállalkozás: ${params.businessName}\nE-mail: ${params.email}\nIdőpont: ${when}\n\nJóváhagyás: ${adminUrl}\n\n(A fiók addig 'jóváhagyásra vár' státuszban van, amíg nem aktiválod.)`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p>Új szolgáltatói regisztráció érkezett.</p>
      <p style="background: #f5f2ed; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <strong>Vállalkozás:</strong> ${escapeHtml(params.businessName)}<br />
        <strong>E-mail:</strong> ${escapeHtml(params.email)}<br />
        <strong>Időpont:</strong> ${when}
      </p>
      <p>
        <a href="${adminUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 600;">
          Jóváhagyás megnyitása
        </a>
      </p>
      <p style="color: #6b6b6b; font-size: 13px;">
        A fiók addig „jóváhagyásra vár” státuszban van, amíg nem aktiválod.
      </p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `Új regisztráció – ${params.businessName}`,
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

import { getResendClient, RESEND_FROM_EMAIL } from "./resend";

export type SendCancellationEmailParams = {
  to: string;
  customerName: string;
  providerName: string;
  providerPhone: string | null;
  serviceName: string;
  startsAt: string;
  reason?: string | null;
};

export type SendCancellationEmailResult = { ok: true } | { ok: false; error: "missing_api_key" | "send_failed" };

function formatStartsAt(iso: string): string {
  const formatted = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export async function sendCancellationEmail(
  params: SendCancellationEmailParams
): Promise<SendCancellationEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const when = formatStartsAt(params.startsAt);
  const reasonLine = params.reason ? `\n\nA szolgáltató üzenete: ${params.reason}` : "";
  const contactLine = params.providerPhone
    ? `Ha kérdésed van, keresd ${params.providerName} vállalkozást telefonon: ${params.providerPhone}.`
    : `Ha kérdésed van, keresd ${params.providerName} vállalkozást.`;

  const text = `Kedves ${params.customerName}!\n\nSajnálattal értesítünk, hogy a(z) ${params.providerName} lemondta a következő foglalásodat:\n\n${params.serviceName}\n${when}${reasonLine}\n\n${contactLine}\n\nÜdvözlettel,\nIdőpontNeked.hu`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p>Kedves ${params.customerName}!</p>
      <p>Sajnálattal értesítünk, hogy a(z) <strong>${params.providerName}</strong> lemondta a következő foglalásodat:</p>
      <p style="background: #f5f2ed; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <strong>${params.serviceName}</strong><br />
        ${when}
      </p>
      ${params.reason ? `<p><em>A szolgáltató üzenete:</em> ${params.reason}</p>` : ""}
      <p>${contactLine}</p>
      <p>Üdvözlettel,<br />IdőpontNeked.hu</p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    subject: `Foglalás lemondva – ${params.providerName}`,
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

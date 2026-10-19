import { getResendClient, RESEND_FROM_EMAIL } from "./resend";
import { escapeHtml } from "./escapeHtml";
import { formatHuf, formatStartsAt } from "./format";

export type ProviderNewBookingEmailParams = {
  to: string;
  providerName: string;
  serviceName: string;
  priceHuf: number | null;
  startsAt: string;
  staffName: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  siteUrl: string;
};

/** Értesítő a szolgáltatónak minden vendég által létrehozott új
 * foglalásról, a vendég elérhetőségével — hogy ne csak a fiókjában és a
 * (lassabban frissülő) naptár-feedben lássa. */
export async function sendProviderNewBookingEmail(params: ProviderNewBookingEmailParams) {
  const client = getResendClient();
  if (!client) return { ok: false as const, error: "missing_api_key" as const };

  const when = formatStartsAt(params.startsAt);
  const price = params.priceHuf != null ? ` (${formatHuf(params.priceHuf)})` : "";
  const dashboardUrl = `${params.siteUrl.replace(/\/$/, "")}/dashboard`;

  const lines = [
    `Szolgáltatás: ${params.serviceName}${price}`,
    `Időpont: ${when}`,
    params.staffName ? `Munkatárs: ${params.staffName}` : null,
    `Vendég: ${params.customerName}`,
    `Telefonszám: ${params.customerPhone}`,
    params.customerEmail ? `E-mail: ${params.customerEmail}` : null,
  ].filter(Boolean) as string[];

  const text = `Új foglalás érkezett az IdőpontNeked.hu-n.\n\n${lines.join("\n")}\n\nA foglalásaidat itt látod: ${dashboardUrl}\n\nIdőpontNeked.hu`;

  const row = (label: string, value: string) => `<strong>${label}:</strong> ${escapeHtml(value)}<br />`;
  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p>Új foglalás érkezett az IdőpontNeked.hu-n.</p>
      <p style="background: #f5f2ed; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        ${row("Szolgáltatás", params.serviceName + price)}
        ${row("Időpont", when)}
        ${params.staffName ? row("Munkatárs", params.staffName) : ""}
        ${row("Vendég", params.customerName)}
        <strong>Telefonszám:</strong> <a href="tel:${escapeHtml(params.customerPhone)}" style="color: #1a1a1a;">${escapeHtml(params.customerPhone)}</a><br />
        ${params.customerEmail ? row("E-mail", params.customerEmail) : ""}
      </p>
      <p>
        <a href="${dashboardUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 999px; font-weight: 600;">
          Foglalásaim megnyitása
        </a>
      </p>
      <p style="color: #6b6b6b; font-size: 13px;">Ezt a levelet azért kaptad, mert a(z) ${escapeHtml(params.providerName)} foglalási oldalán új időpontot foglaltak.</p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    subject: `Új foglalás – ${params.serviceName}, ${when}`,
    text,
    html,
  });

  if (error) return { ok: false as const, error: "send_failed" as const };
  return { ok: true as const };
}

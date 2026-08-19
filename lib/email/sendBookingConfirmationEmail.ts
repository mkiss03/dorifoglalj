import { getResendClient, RESEND_FROM_EMAIL } from "./resend";

export type SendBookingConfirmationEmailParams = {
  to: string;
  customerName: string;
  providerName: string;
  providerPhone?: string | null;
  providerAddress?: string | null;
  providerCity?: string | null;
  serviceName: string;
  priceHuf: number;
  startsAt: string;
  staffName?: string | null;
};

export type SendBookingConfirmationEmailResult =
  | { ok: true }
  | { ok: false; error: "missing_api_key" | "send_failed" };

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

function formatHuf(price: number): string {
  return new Intl.NumberFormat("hu-HU").format(price) + " Ft";
}

export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationEmailParams
): Promise<SendBookingConfirmationEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const when = formatStartsAt(params.startsAt);
  const location = [params.providerCity, params.providerAddress].filter(Boolean).join(", ");
  const staffLine = params.staffName ? `Munkatárs: ${params.staffName}\n` : "";
  const locationLine = location ? `Helyszín: ${location}\n` : "";
  const phoneLine = params.providerPhone ? `Telefonszám: ${params.providerPhone}\n` : "";

  const text = `Kedves ${params.customerName}!\n\nSikeresen lefoglaltad a következő időpontot:\n\nSzolgáltató: ${params.providerName}\nSzolgáltatás: ${params.serviceName} (${formatHuf(params.priceHuf)})\nIdőpont: ${when}\n${staffLine}${locationLine}${phoneLine}\nKöszönjük, hogy az IdőpontNeked.hu-t választottad!\n\nÜdvözlettel,\nIdőpontNeked.hu`;

  const html = `
    <div style="font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="font-size: 22px; font-weight: bold; color: #1a1a1a; margin: 0;">IdőpontNeked<span style="color: #6b7280; font-weight: normal;">.hu</span></h1>
      </div>

      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h2 style="font-size: 18px; margin-top: 0; color: #1a1a1a;">Foglalás visszaigazolva!</h2>
        <p style="margin-bottom: 20px;">Kedves <strong>${params.customerName}</strong>! Sikeresen rögzítettük az időpontodat.</p>

        <div style="background: #f5f2ed; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin-bottom: 4px;">
            ${params.serviceName}
          </div>
          <div style="font-size: 14px; color: #a82348; font-weight: 600; margin-bottom: 12px;">
            ${formatHuf(params.priceHuf)}
          </div>
          <hr style="border: 0; border-top: 1px solid #e2ddd5; margin: 10px 0;" />
          <div style="font-size: 14px; color: #374151; margin-top: 8px;">
            <strong>Szolgáltató:</strong> ${params.providerName}<br />
            ${params.staffName ? `<strong>Munkatárs:</strong> ${params.staffName}<br />` : ""}
            <strong>Időpont:</strong> ${when}<br />
            ${location ? `<strong>Cím:</strong> ${location}<br />` : ""}
            ${params.providerPhone ? `<strong>Telefon:</strong> ${params.providerPhone}<br />` : ""}
          </div>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
          Ha módosítani vagy lemondani szeretnéd az időpontodat, kérjük keresd közvetlenül a szolgáltatót a fenti elérhetőségen.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af;">
        <p>Üdvözlettel,<br /><strong>IdőpontNeked.hu</strong> — Ahol a szabad időpontok várnak</p>
      </div>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: params.to,
    subject: `Foglalás visszaigazolva — ${params.providerName}`,
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

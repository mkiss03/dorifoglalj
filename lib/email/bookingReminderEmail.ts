import { RESEND_FROM_EMAIL } from "./resend";
import { escapeHtml } from "./escapeHtml";
import { formatStartsAt, formatTime } from "./format";

export type BookingReminderParams = {
  to: string;
  customerName: string;
  providerName: string;
  providerPhone: string | null;
  providerAddress: string | null;
  providerCity: string | null;
  serviceName: string;
  startsAt: string;
  staffName: string | null;
};

/** A foglalás előtti napi emlékeztető levél — csak összeállítja, a
 * kiküldést a hívó végzi kötegelve (Resend batch). */
export function buildBookingReminderEmail(p: BookingReminderParams) {
  const when = formatStartsAt(p.startsAt);
  const location = [p.providerCity, p.providerAddress].filter(Boolean).join(", ");
  const contact = p.providerPhone
    ? `Ha mégsem tudsz menni, kérjük, minél előbb jelezd a szolgáltatónak a ${p.providerPhone} telefonszámon, hogy más foglalhasson a helyedre.`
    : "Ha mégsem tudsz menni, kérjük, minél előbb jelezd a szolgáltatónak, hogy más foglalhasson a helyedre.";

  const text = [
    `Kedves ${p.customerName}!`,
    "",
    "Emlékeztetünk, hogy holnap időpontod van:",
    "",
    `Szolgáltató: ${p.providerName}`,
    `Szolgáltatás: ${p.serviceName}`,
    `Időpont: ${when}`,
    p.staffName ? `Munkatárs: ${p.staffName}` : null,
    location ? `Helyszín: ${location}` : null,
    p.providerPhone ? `Telefonszám: ${p.providerPhone}` : null,
    "",
    contact,
    "",
    "Üdvözlettel,",
    "IdőpontNeked.hu",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = `
    <div style="font-family: 'Ubuntu', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding-bottom: 20px;">
        <h1 style="font-size: 22px; font-weight: bold; color: #1a1a1a; margin: 0;">IdőpontNeked<span style="color: #6b7280; font-weight: normal;">.hu</span></h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px;">
        <h2 style="font-size: 18px; margin-top: 0; color: #1a1a1a;">Holnap ${formatTime(p.startsAt)}-kor időpontod van</h2>
        <p>Kedves <strong>${escapeHtml(p.customerName)}</strong>! Emlékeztetünk a holnapi foglalásodra.</p>
        <div style="background: #f5f2ed; border-radius: 14px; padding: 18px 20px; margin: 20px 0; font-size: 14px; color: #374151;">
          <div style="font-size: 16px; font-weight: bold; color: #1a1a1a; margin-bottom: 8px;">${escapeHtml(p.serviceName)}</div>
          <strong>Szolgáltató:</strong> ${escapeHtml(p.providerName)}<br />
          <strong>Időpont:</strong> ${escapeHtml(when)}<br />
          ${p.staffName ? `<strong>Munkatárs:</strong> ${escapeHtml(p.staffName)}<br />` : ""}
          ${location ? `<strong>Cím:</strong> ${escapeHtml(location)}<br />` : ""}
          ${p.providerPhone ? `<strong>Telefon:</strong> ${escapeHtml(p.providerPhone)}<br />` : ""}
        </div>
        <p style="font-size: 13px; color: #6b7280;">${escapeHtml(contact)}</p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #9ca3af;">
        <p>Üdvözlettel,<br /><strong>IdőpontNeked.hu</strong> · Ahol a szabad időpontok várnak</p>
      </div>
    </div>
  `;

  return {
    from: RESEND_FROM_EMAIL,
    to: p.to,
    subject: `Emlékeztető: holnapi időpontod – ${p.providerName}`,
    text,
    html,
  };
}

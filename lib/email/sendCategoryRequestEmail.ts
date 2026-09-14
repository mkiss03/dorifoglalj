import { getResendClient, RESEND_FROM_EMAIL } from "./resend";
import { escapeHtml } from "./escapeHtml";
import { ADMIN_NOTIFICATION_EMAIL } from "@/lib/contact";

export type SendCategoryRequestEmailParams = {
  businessName: string;
  requestedCategory: string;
  contactEmail: string | null;
};

export type SendCategoryRequestEmailResult =
  | { ok: true }
  | { ok: false; error: "missing_api_key" | "send_failed" };

/** Értesítő, ha egy szolgáltató az „Egyéb” kategóriát választva új
 * megnevezést kér. A kérés az adatbázisban (`providers.category_other`) és
 * az admin listában akkor is látszik, ha ez az email nem megy ki — ez csak
 * hogy ne kelljen naponta nézegetni a listát. */
export async function sendCategoryRequestEmail(
  params: SendCategoryRequestEmailParams
): Promise<SendCategoryRequestEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const contactLine = params.contactEmail ? `\nKapcsolat: ${params.contactEmail}` : "";

  const text = `Új kategória-kérés érkezett.\n\nSzolgáltató: ${params.businessName}\nKért megnevezés: ${params.requestedCategory}${contactLine}\n\nA kérés a /admin/szolgaltatok oldalon is látszik a szolgáltató sorában.`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p>Új kategória-kérés érkezett.</p>
      <p style="background: #f5f2ed; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <strong>Szolgáltató:</strong> ${escapeHtml(params.businessName)}<br />
        <strong>Kért megnevezés:</strong> ${escapeHtml(params.requestedCategory)}
        ${params.contactEmail ? `<br /><strong>Kapcsolat:</strong> ${escapeHtml(params.contactEmail)}` : ""}
      </p>
      <p>A kérés a <strong>/admin/szolgaltatok</strong> oldalon is látszik a szolgáltató sorában.</p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `Új kategória-kérés – ${params.businessName}`,
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

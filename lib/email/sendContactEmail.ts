import { getResendClient, RESEND_FROM_EMAIL } from "./resend";
import { SUPPORT_EMAIL } from "@/lib/contact";

export type SendContactEmailParams = {
  name: string;
  email: string;
  message: string;
};

export type SendContactEmailResult = { ok: true } | { ok: false; error: "missing_api_key" | "send_failed" };

export async function sendContactEmail(params: SendContactEmailParams): Promise<SendContactEmailResult> {
  const client = getResendClient();
  if (!client) return { ok: false, error: "missing_api_key" };

  const text = `Név: ${params.name}\nEmail: ${params.email}\n\n${params.message}`;

  const html = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.6;">
      <p><strong>Név:</strong> ${params.name}</p>
      <p><strong>Email:</strong> ${params.email}</p>
      <p style="background: #f5f2ed; border-radius: 12px; padding: 16px 20px; margin: 16px 0; white-space: pre-wrap;">${params.message}</p>
    </div>
  `;

  const { error } = await client.emails.send({
    from: RESEND_FROM_EMAIL,
    to: SUPPORT_EMAIL,
    replyTo: params.email,
    subject: `Kapcsolatfelvétel — ${params.name}`,
    text,
    html,
  });

  if (error) return { ok: false, error: "send_failed" };
  return { ok: true };
}

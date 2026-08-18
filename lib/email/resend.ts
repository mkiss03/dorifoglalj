import { Resend } from "resend";

/** `null`, ha nincs beállítva `RESEND_API_KEY` — a hívó félnek ekkor kecsesen
 * kell viselkednie (nincs email-küldés, de a hívó folyamat nem hibázhat el emiatt). */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "IdőpontNeked.hu <foglalas@idopontneked.hu>";

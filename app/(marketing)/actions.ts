"use server";

import { sendContactEmail } from "@/lib/email/sendContactEmail";
import { SUPPORT_EMAIL } from "@/lib/contact";
import { checkRateLimit } from "@/lib/rate-limit";

export type ContactState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 2000;

export async function sendContactMessageAction(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot: valós látogató sosem tölti ki ezt a láthatatlan mezőt — ha
  // mégis ki van töltve, egy bot küldte. Csendben "sikert" mutatunk, hogy a
  // bot ne próbálkozzon tovább, de ténylegesen nem küldünk semmit.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", message: "Köszönjük, hamarosan válaszolunk!" };
  }

  // Rate limit: max 5 kapcsolat üzenet / IP / 10 perc
  const rateLimit = await checkRateLimit("contact", 5, 10 * 60 * 1000);
  if (!rateLimit.success) {
    return {
      status: "error",
      message: "Túl sok üzenetküldési kísérlet. Próbáld újra néhány perc múlva.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Minden mező kitöltése kötelező." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Érvénytelen email cím." };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { status: "error", message: "Az üzenet túl hosszú." };
  }

  const result = await sendContactEmail({ name, email, message });

  if (!result.ok) {
    if (result.error === "missing_api_key") {
      return {
        status: "error",
        message: `Az üzenetküldés jelenleg nincs beállítva — írj közvetlenül a ${SUPPORT_EMAIL} címre.`,
      };
    }
    return { status: "error", message: "Hiba történt az üzenet küldése közben, próbáld újra." };
  }

  return { status: "success", message: "Köszönjük! Hamarosan válaszolunk." };
}

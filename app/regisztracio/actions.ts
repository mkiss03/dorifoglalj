"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getTrustedSiteUrl } from "@/lib/site-url";
import { sendProviderSignupNotificationEmail } from "@/lib/email/sendProviderSignupNotificationEmail";

export type SignUpState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  if (String(formData.get("hp_website") ?? "").trim()) {
    return { status: "success" };
  }

  const rateLimit = await checkRateLimit("signup", 5, 10 * 60 * 1000);
  if (!rateLimit.success) {
    return {
      status: "error",
      message: "Túl sok regisztrációs kísérlet. Próbáld újra néhány perc múlva.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");
  const businessName = String(formData.get("business_name") ?? "").trim();

  if (!email || !password || !businessName) {
    return { status: "error", message: "Minden mező kitöltése kötelező." };
  }
  if (password.length < 8) {
    return { status: "error", message: "A jelszó legalább 8 karakter legyen." };
  }
  // A megerősítő mezőt csak akkor kérjük számon, ha meg is érkezett — így egy
  // régi (cache-elt) űrlapról érkező beküldés sem hibázik el feleslegesen.
  if (passwordConfirm && passwordConfirm !== password) {
    return { status: "error", message: "A két jelszó nem egyezik." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: businessName } },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // Értesítő az üzemeltetőnek, hogy minél előbb jóvá lehessen hagyni a
  // fiókot. Szándékosan nem befolyásolja a regisztráció kimenetelét: ha
  // nincs Resend kulcs vagy elhasal a küldés, a felhasználó ettől még
  // sikeresen regisztrált.
  try {
    const siteUrl = await getTrustedSiteUrl();
    await sendProviderSignupNotificationEmail({ businessName, email, siteUrl });
  } catch {
    // szándékosan elnyelve
  }

  return { status: "success" };
}

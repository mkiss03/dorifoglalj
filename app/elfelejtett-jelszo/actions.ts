"use server";

import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl } from "@/lib/site-url";

export type ForgotPasswordState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Add meg az e-mail címed." };
  }

  const supabase = await createClient();
  const siteUrl = await getTrustedSiteUrl();

  // A tényleges linket a Supabase "Reset Password" email sablonja állítja
  // össze (ugyanúgy, mint a Confirm Signup sablonnál): formátuma
  // {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
  // &next=/jelszo-uj (ezt kell beállítani a Supabase dashboardon).
  //
  // Szándékosan nem ágazunk el a hiba/siker között a válaszban, hogy ne
  // legyen kideríthető, mely email cím van regisztrálva a rendszerben.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/jelszo-uj`,
  });

  return {
    status: "success",
    message: "Ha ezzel az e-mail címmel van fiók nálunk, elküldtük a jelszó-visszaállító linket.",
  };
}

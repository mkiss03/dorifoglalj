"use server";

import { createClient } from "@/lib/supabase/server";
import { getTrustedSiteUrl } from "@/lib/site-url";

export type MagicLinkState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function magicLinkAction(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Add meg az e-mail címed." };
  }

  const supabase = await createClient();
  const siteUrl = await getTrustedSiteUrl();

  // shouldCreateUser: false, mert a magic link csak meglévő fiókkal való
  // bejelentkezésre szolgál (regisztráció a /regisztracio oldalon,
  // jelszóval történik). A választ szándékosan nem ágaztatjuk el a
  // hiba/siker között, hogy ne legyen kideríthető, mely email van regisztrálva.
  await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/dashboard`,
    },
  });

  return {
    status: "success",
    message: "Ha ezzel az e-mail címmel van fiók nálunk, elküldtünk egy bejelentkező linket.",
  };
}

"use server";

import { createClient } from "@/lib/supabase/server";

export type SetPasswordState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function setPasswordAction(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) {
    return { status: "error", message: "A jelszó legalább 8 karakter legyen." };
  }
  if (password !== passwordConfirm) {
    return { status: "error", message: "A két jelszó nem egyezik." };
  }

  const supabase = await createClient();

  // Ide csak a /auth/confirm route-on átment, érvényes "recovery" session-nel
  // lehet eljutni; updateUser() a jelenlegi session felhasználóján hajtja
  // végre a jelszóváltást.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "A link lejárt vagy már felhasználták. Kérj egy újat." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { status: "error", message: "Hiba történt a jelszó beállítása során." };
  }

  return { status: "success", message: "Jelszavad frissült. Mostantól ezzel jelentkezhetsz be." };
}

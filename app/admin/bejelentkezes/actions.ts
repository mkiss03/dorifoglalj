"use server";

import { redirect } from "next/navigation";
import { attemptSignIn } from "@/lib/supabase/signIn";
import { isAdmin } from "@/lib/supabase/server";
import type { SignInState } from "@/app/bejelentkezes/actions";

/** Ugyanaz a hitelesítés, mint a nyilvános bejelentkezésnél (attemptSignIn),
 * csak a cél más: ez az admin ajtó, sikeres belépés után is_admin()-t néz —
 * admin fiókkal a szerkesztőbe kerül, egyébként a saját dashboardjára
 * (nem hibaüzenet, hiszen a jelszó/email helyes volt, csak nem admin). */
export async function adminSignInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const result = await attemptSignIn(formData);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  redirect((await isAdmin()) ? "/admin/szerkeszto" : "/dashboard");
}

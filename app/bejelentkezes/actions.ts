"use server";

import { redirect } from "next/navigation";
import { attemptSignIn } from "@/lib/supabase/signIn";

export type SignInState = {
  status: "idle" | "error";
  message?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const result = await attemptSignIn(formData);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  // Ez a nyilvános, szolgáltatói bejelentkezés — mindig a dashboardra visz,
  // FÜGGETLENÜL attól, hogy a fiók egyébként admin-e is. Az admin terület
  // szándékosan egy külön ajtón (/admin/bejelentkezes) érhető el, saját
  // server actionnel (lásd app/admin/bejelentkezes/actions.ts) — ugyanaz a
  // fiók egyszer providerként, máskor adminként lép be, attól függően,
  // melyik oldalon jelentkezik be.
  redirect("/dashboard");
}

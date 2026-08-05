"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  status: "idle" | "error";
  message?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Add meg az e-mail címed és a jelszavad." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "Hibás e-mail cím vagy jelszó." };
  }

  // Ez a nyilvános, szolgáltatói bejelentkezés — mindig a dashboardra visz,
  // FÜGGETLENÜL attól, hogy a fiók egyébként admin-e is. Az admin terület
  // szándékosan egy külön ajtón (/admin/bejelentkezes) érhető el, hogy ne
  // a bejelentkezés helye/módja döntse el meglepetésszerűen, hova kerül a
  // felhasználó — ugyanazzal a fiókkal egyszer providerként, máskor
  // adminként is be lehet lépni, attól függően, melyik oldalon jelentkezik be.
  redirect("/dashboard");
}

"use server";

import { redirect } from "next/navigation";
import { createClient, isAdmin } from "@/lib/supabase/server";

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

  // Admin fiókkal bejelentkezve egyenesen a szerkesztőbe — nincs szükség
  // arra, hogy a szolgáltatói dashboardról kézzel navigáljon oda.
  redirect((await isAdmin()) ? "/admin/szerkeszto" : "/dashboard");
}

"use server";

import { createClient } from "@/lib/supabase/server";

export type SignUpState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const businessName = String(formData.get("business_name") ?? "").trim();

  if (!email || !password || !businessName) {
    return { status: "error", message: "Minden mező kitöltése kötelező." };
  }
  if (password.length < 8) {
    return { status: "error", message: "A jelszó legalább 8 karakter legyen." };
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
  return { status: "success" };
}

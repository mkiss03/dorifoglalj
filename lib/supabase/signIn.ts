import { createClient } from "./server";

/** A tényleges bejelentkezési logika, megosztva a nyilvános (/bejelentkezes)
 * és az admin (/admin/bejelentkezes) belépő oldal server actionje között —
 * a hitelesítés ugyanaz, csak a sikeres belépés utáni átirányítás célja
 * különbözik a két ajtó között (lásd a két actions.ts fájlt). */
export async function attemptSignIn(formData: FormData): Promise<{ ok: true } | { ok: false; message: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Add meg az e-mail címed és a jelszavad." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Hibás e-mail cím vagy jelszó." };
  }

  return { ok: true };
}

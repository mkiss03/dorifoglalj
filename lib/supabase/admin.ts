import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Szerveroldali, RLS-t megkerülő kliens a Supabase titkos kulcsával
 * (`SUPABASE_SECRET_KEY`, régi néven service_role). Kizárólag olyan
 * szerveroldali feladatokhoz, ahol nincs bejelentkezett felhasználó, de
 * több szolgáltató adatát kell olvasni (értesítők, időzített emlékeztető).
 * Kliensoldali kódba SOHA nem kerülhet. `null`, ha nincs beállítva — a
 * hívónak ekkor kecsesen ki kell hagynia a műveletet. */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

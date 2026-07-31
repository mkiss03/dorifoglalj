import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Cookie-mentes kliens a publikus, cache-elhető olvasásokhoz (pl. a
 * weboldal-tartalom `unstable_cache`-elt lekérdezéséhez) — a szokásos
 * `lib/supabase/server.ts` kliens `cookies()`-t olvas, ami `unstable_cache`
 * belsejéből tiltott. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

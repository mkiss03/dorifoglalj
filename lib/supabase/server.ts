import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component render nem írhat cookie-t (csak Server Action/Route
            // Handler) — a proxy.ts minden requestnél frissíti a session cookie-t.
          }
        },
      },
    }
  );
}

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Admin-e a bejelentkezett felhasználó (public.admins tábla, is_admin()
 * RPC-n keresztül) — minden admin-route-gate és bejelentkezés utáni
 * átirányítás ezt hívja, hogy egy helyen legyen a döntés. */
export const isAdmin = cache(async () => {
  const user = await getUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  return Boolean(data);
});

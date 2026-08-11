import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Amíg nincs beállítva a Supabase projekt (.env.local), ne dőljön el emiatt
  // az egész oldal — a proxy minden route-on lefut, a marketing oldalnak
  // pedig semmi köze a Supabase-hez.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes an expiring session cookie — Server Components can't write
  // cookies themselves, so this is what actually keeps sessions alive.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  // Csak azokon az útvonalakon fut, ahol az auth-állapotnak ténylegesen
  // jelentősége van — a marketing oldalak (főoldal, /kereses, jogi oldalak,
  // /foglalas) sosem néznek munkamenetet, a tényleges beléptetés (redirect)
  // pedig már úgyis a dashboard/admin layout-okban történik saját
  // getUser()-hívással. Korábban ez MINDEN navigáción lefuttatott egy
  // Supabase auth-kört is a marketing oldalakon — ez adta a lassú
  // oldalváltás érzetének egyik fő okát.
  matcher: ["/dashboard/:path*", "/admin/:path*", "/bejelentkezes", "/regisztracio", "/auth/:path*"],
};

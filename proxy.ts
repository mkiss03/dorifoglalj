import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const MARKETING_PATH_PREFIXES = ["/kereses", "/foglalas"];
const MARKETING_EXACT_PATHS = ["/", "/aszf", "/adatkezeles", "/impresszum"];

function isMarketingPath(pathname: string): boolean {
  return (
    MARKETING_EXACT_PATHS.includes(pathname) ||
    MARKETING_PATH_PREFIXES.some((prefix) => pathname.startsWith(`${prefix}/`) || pathname === prefix)
  );
}

/** Cookie-mentes, csak számláló RPC — direkt fetch a Supabase REST rétegen,
 * hogy ne kelljen a teljes @supabase/ssr cookie-kezelést instanciálni ehhez
 * az egyetlen, session-től független híváshoz. `event.waitUntil`-lel a
 * válasz elküldése UTÁN fut, így ez sosem lassítja a látogató oldalbetöltését,
 * és egy néma hiba (pl. a schema_v21.sql még nincs lefuttatva) sem eshet a
 * kérés terhére. */
async function recordPageView() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return;
    await fetch(`${url}/rest/v1/rpc/record_page_view`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });
  } catch {
    // szándékosan néma — a látogatószámláló sosem eshet a kérés terhére
  }
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  // Amíg nincs beállítva a Supabase projekt (.env.local), ne dőljön el emiatt
  // az egész oldal — a proxy minden route-on lefut, a marketing oldalnak
  // pedig semmi köze a Supabase auth-hoz.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.next({ request });
  }

  if (isMarketingPath(pathname)) {
    // Marketing oldalakon nincs auth-állapot, amit kezelni kellene — csak a
    // durva, admin-panelbeli oldalmegtekintés-számlálót növeljük a
    // háttérben (ISR/statikus cache mellett is minden kérésnél lefut, mert a
    // middleware a cache ELŐTT ül).
    event.waitUntil(recordPageView());
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
  // Az auth-releváns útvonalak (dashboard/admin/bejelentkezés-körüli oldalak)
  // mellett a nyilvános marketing oldalak is szerepelnek itt — de csak a
  // fenti, könnyű látogatószámláló miatt, session-nel ott nem foglalkozunk.
  // Korábban ez MINDEN navigáción lefuttatott egy Supabase auth-kört is a
  // marketing oldalakon — ez adta a lassú oldalváltás érzetének egyik fő
  // okát, ezért ott most kizárólag a nem-blokkoló számláló fut.
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/bejelentkezes",
    "/regisztracio",
    "/auth/:path*",
    "/elfelejtett-jelszo",
    "/jelszo-uj",
    "/belepes-linkkel",
    "/",
    "/kereses",
    "/kereses/:path*",
    "/foglalas/:path*",
    "/aszf",
    "/adatkezeles",
    "/impresszum",
  ],
};

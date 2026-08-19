import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** A `next` célt vagy relatív path-ként ("/jelszo-uj"), vagy — ha a Supabase
 * email-sablon a `{{ .RedirectTo }}` mezőt használja — ugyanerre az originre
 * mutató abszolút URL-ként kapjuk. Mindkét formát elfogadjuk, de csak
 * ugyanarra az originre mutató célt engedünk át (nyílt redirect ellen). */
function resolveNext(nextParam: string | null, requestUrl: string): string {
  if (!nextParam) return "/dashboard";
  if (nextParam.startsWith("/")) return nextParam;
  try {
    const nextUrl = new URL(nextParam);
    const origin = new URL(requestUrl).origin;
    if (nextUrl.origin === origin) return `${nextUrl.pathname}${nextUrl.search}`;
  } catch {
    // Érvénytelen URL — figyelmen kívül hagyjuk, marad az alapértelmezett.
  }
  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = resolveNext(searchParams.get("next"), request.url);

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      redirect(next);
    }
  }

  redirect("/auth/error");
}
